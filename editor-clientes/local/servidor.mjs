// Corre el editor en local, sin Apps Script, para probarlo: sirve la página de dist/ y ejecuta el
// código del servidor (Codigo.js) en Node con reemplazos mínimos de los servicios de Apps Script.
// Publica de verdad en GitHub con tu token de `gh`, así que por defecto usa la rama
// prueba-editor-clientes de cada repo (créala antes; RAMA=otra para cambiarla).
//
//   node local/servidor.mjs            → http://localhost:8790
//   PUERTO=… RAMA=… USUARIO=… node local/servidor.mjs
import { execFileSync } from "node:child_process";
import { createHash, randomUUID, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import vm from "node:vm";

const puerto = Number(process.env.PUERTO || 8790);
execFileSync("node", [new URL("../construir.mjs", import.meta.url).pathname], { stdio: "inherit" });
const dist = new URL("../dist/", import.meta.url);

// ---------- Reemplazos de Apps Script ----------

const firmado = (b) => (b > 127 ? b - 256 : b);
const sinSigno = (bytes) => Buffer.from(bytes.map((b) => (b + 256) % 256));
const propiedades = {
  RAMA: process.env.RAMA || "prueba-editor-clientes",
  GITHUB_TOKEN: execFileSync("gh", ["auth", "token"]).toString().trim(),
};
const cache = new Map();

// Pedido HTTP sincrónico con curl, como UrlFetchApp.fetch.
function fetchSincronico(url, opciones = {}) {
  const args = ["-sS", "-X", (opciones.method || "get").toUpperCase(), "-w", "\n%{http_code}", url];
  for (const [k, v] of Object.entries(opciones.headers || {})) args.push("-H", `${k}: ${v}`);
  if (opciones.payload !== undefined) args.push("-H", `Content-Type: ${opciones.contentType || "application/json"}`, "--data-binary", "@-");
  const salida = execFileSync("curl", args, { input: opciones.payload ?? "", maxBuffer: 64 * 1024 * 1024 }).toString("utf8");
  const corte = salida.lastIndexOf("\n");
  return { getResponseCode: () => Number(salida.slice(corte + 1)), getContentText: () => salida.slice(0, corte) };
}

const contexto = vm.createContext({
  console,
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => propiedades[k] ?? null,
      getProperties: () => ({ ...propiedades }),
      setProperty: (k, v) => { propiedades[k] = v; },
      setProperties: (o) => Object.assign(propiedades, o),
      deleteProperty: (k) => { delete propiedades[k]; },
    }),
  },
  CacheService: (() => {
    const c = { get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v), remove: (k) => cache.delete(k) };
    return { getScriptCache: () => c, getUserCache: () => c };
  })(),
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
  Session: {
    getActiveUser: () => ({ getEmail: () => process.env.USUARIO || "prueba@teamcubation.com" }),
    getEffectiveUser: () => ({ getEmail: () => "duenio@teamcubation.com" }),
  },
  GroupsApp: { getGroupByEmail: () => ({ hasUser: () => !process.env.SIN_ACCESO }) },
  UrlFetchApp: { fetch: fetchSincronico },
  ScriptApp: { getService: () => ({ getUrl: () => `http://localhost:${puerto}/` }) },
  Utilities: {
    Charset: { UTF_8: "UTF-8" },
    DigestAlgorithm: { SHA_1: "sha1" },
    base64Decode: (s) => [...Buffer.from(s, "base64")].map(firmado),
    base64Encode: (bytes) => (typeof bytes === "string" ? Buffer.from(bytes) : sinSigno(bytes)).toString("base64"),
    base64EncodeWebSafe: (v) => (typeof v === "string" ? Buffer.from(v) : sinSigno(v)).toString("base64url").padEnd(Math.ceil((typeof v === "string" ? Buffer.byteLength(v) : v.length) / 3) * 4, "="),
    newBlob: (bytes) => ({ getDataAsString: () => sinSigno(bytes).toString("utf8") }),
    computeRsaSha256Signature: (valor, clave) => [...sign("sha256", Buffer.from(valor), clave)].map(firmado),
    computeDigest: (algoritmo, bytes) => [...createHash(algoritmo).update(sinSigno(bytes)).digest()].map(firmado),
    getUuid: () => randomUUID(),
  },
});
for (const archivo of ["cambios.js", "github.js", "Codigo.js"]) {
  vm.runInContext(readFileSync(new URL(archivo, dist), "utf8"), contexto, { filename: archivo });
}

// ---------- google.script.run en la página: cada llamada es un POST a /api/<función> ----------

const simulacion = `<script>
window.google = { script: { run: (function () {
  function llamar(exito, fallo) {
    return new Proxy({}, { get: function (_, nombre) {
      if (nombre === "withSuccessHandler") return function (f) { return llamar(f, fallo); };
      if (nombre === "withFailureHandler") return function (f) { return llamar(exito, f); };
      return function () {
        fetch("/api/" + nombre, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify([].slice.call(arguments)) })
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.error) { if (fallo) fallo(new Error(d.error)); } else if (exito) exito(d.resultado); });
      };
    } });
  }
  return llamar(null, null);
})() } };
</script>`;

createServer((pedido, respuesta) => {
  if (pedido.method === "GET" && (pedido.url === "/" || pedido.url.startsWith("/?"))) {
    const pagina = readFileSync(new URL("editor.html", dist), "utf8").replace("<head>", `<head>${simulacion}`);
    respuesta.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(pagina);
    return;
  }
  const funcion = pedido.method === "POST" && pedido.url.match(/^\/api\/(cargar|publicar|estadoDespliegue)$/)?.[1];
  if (!funcion) {
    respuesta.writeHead(404).end();
    return;
  }
  let cuerpo = "";
  pedido.on("data", (parte) => { cuerpo += parte; });
  pedido.on("end", () => {
    let salida;
    try {
      const resultado = contexto[funcion](...JSON.parse(cuerpo));
      salida = { resultado: JSON.parse(JSON.stringify(resultado ?? null)) };
    } catch (err) {
      console.error(`${funcion}: ${err.message}`);
      salida = { error: err.message };
    }
    respuesta.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(salida));
  });
}).listen(puerto, () => console.log(`Editor local en http://localhost:${puerto} (rama ${propiedades.RAMA})`));
