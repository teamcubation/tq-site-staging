// Arma dist/, lo que clasp sube a Apps Script: el código del servidor tal cual y la página del
// editor con su CSS y su JS adentro (Apps Script sirve un solo archivo HTML).
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const src = new URL("./src/", import.meta.url);
const dist = new URL("./dist/", import.meta.url);
const leer = (archivo) => readFileSync(new URL(archivo, src), "utf8");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const archivo of ["appsscript.json", "Codigo.js", "github.js", "cambios.js", "aviso.html", "configuracion.html"]) {
  copyFileSync(new URL(archivo, src), new URL(archivo, dist));
}
const pagina = leer("editor.html")
  .replace("<!-- estilos -->", () => `<style>\n${leer("estilos.css")}</style>`)
  .replace("<!-- scripts -->", () => ["logo.js", "cambios.js", "editor.js"].map((f) => `<script>\n${leer(f)}</script>`).join("\n"));
writeFileSync(new URL("editor.html", dist), pagina);
console.log("dist/ listo");
