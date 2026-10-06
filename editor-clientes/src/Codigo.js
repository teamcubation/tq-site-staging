// Editor de clientes del sitio: web app de Apps Script que corre como su dueño y solo abren
// cuentas de teamcubation.com que estén en el grupo web@. Lee la lista de clientes del repo de
// staging y publica cada cambio con un commit en staging y otro en producción (los dos repos
// quedan iguales); GitHub Actions construye y publica cada sitio. Publica con una GitHub App
// que se crea e instala desde la página de configuración (?configurar, solo el dueño).

const CONFIG = {
  grupo: "web@teamcubation.com",
  org: "teamcubation",
  sitios: {
    staging: { nombre: "staging", repo: "teamcubation/tq-site-staging", url: "https://site-staging.teamcubation.com" },
    produccion: { nombre: "teamcubation.com", repo: "teamcubation/teamcubation.github.io", url: "https://teamcubation.com" },
  },
  lista: "src/data/clientes.json",
  logos: "src/assets/clientes",
  // Textos del sitio donde se busca si un cliente aparece nombrado (para avisar al quitarlo).
  textos: "src/content",
  lugares: {
    "casos.ts": "la página de Clientes", "home.ts": "la home", "nosotros.ts": "Nosotros",
    "servicios.ts": "Servicios", "metodologia.ts": "Metodología", "teamboarding.ts": "Teamboarding",
    "contacto.ts": "Contacto", "error404.ts": "la página 404", "llms.txt": "llms.txt",
  },
};

// ---------- Páginas ----------

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.code || p.installation_id || p.configurar !== undefined) return paginaConfiguracion(p);
  if (!configurado()) {
    return aviso("El editor todavía no está configurado", esDuenio()
      ? "Falta conectarlo con GitHub: abrí esta misma dirección agregando ?configurar al final."
      : "Avisale a quien lo administra que falta conectarlo con GitHub.");
  }
  if (!tieneAcceso(usuarioActual())) {
    return aviso("No tenés acceso al editor de clientes", `Lo pueden usar quienes están en el grupo ${CONFIG.grupo}. Si tendrías que estar, pedí que te sumen.`);
  }
  return HtmlService.createHtmlOutputFromFile("editor")
    .setTitle("Clientes del sitio")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setFaviconUrl("https://teamcubation.com/favicon-32x32.png");
}

function aviso(titulo, texto) {
  const t = HtmlService.createTemplateFromFile("aviso");
  t.titulo = titulo;
  t.texto = texto;
  return t.evaluate().setTitle(titulo).addMetaTag("viewport", "width=device-width, initial-scale=1");
}

// ---------- Acceso ----------

function usuarioActual() {
  return (Session.getActiveUser().getEmail() || "").toLowerCase();
}

function esDuenio() {
  const yo = usuarioActual();
  return !!yo && yo === (Session.getEffectiveUser().getEmail() || "").toLowerCase();
}

function tieneAcceso(email) {
  if (!email) return false;
  if (esDuenio()) return true;
  const cache = CacheService.getScriptCache();
  const clave = `acceso:${email}`;
  const guardado = cache.get(clave);
  if (guardado) return guardado === "si";
  let ok = false;
  try {
    ok = GroupsApp.getGroupByEmail(CONFIG.grupo).hasUser(email);
  } catch (err) {
    console.error(`No se pudo consultar ${CONFIG.grupo}: ${err}`);
  }
  cache.put(clave, ok ? "si" : "no", 300);
  return ok;
}

function exigirAcceso() {
  const email = usuarioActual();
  if (!tieneAcceso(email)) throw new Error(`No tenés acceso al editor de clientes. Pedí que te sumen a ${CONFIG.grupo}.`);
  return email;
}

// ---------- Funciones que llama el editor (google.script.run) ----------

// La lista actual de staging y lo que el editor necesita para mostrarla.
function cargar() {
  const usuario = exigirAcceso();
  const gh = github();
  const rama = ramaDePublicacion();
  const repo = CONFIG.sitios.staging.repo;
  const base = gh.commitDeRama(repo, rama);
  const lista = gh.leerArchivo(repo, base, CONFIG.lista);
  if (!lista) throw new Error(`No se encontró ${CONFIG.lista} en ${repo}.`);
  const clientes = JSON.parse(lista.texto);
  const logos = gh.listarCarpeta(repo, base, CONFIG.logos);
  return {
    usuario: usuario,
    rama: rama,
    base: base,
    clientes: clientes,
    logos: Object.keys(logos).filter((n) => n.endsWith(".png")).map((n) => n.slice(0, -4)),
    urlLogos: `https://raw.githubusercontent.com/${repo}/${base}/${CONFIG.logos}/`,
    menciones: menciones(gh, repo, base, clientes),
    sitios: Object.keys(CONFIG.sitios).map((id) => ({ id: id, nombre: CONFIG.sitios[id].nombre, url: CONFIG.sitios[id].url })),
  };
}

// Publica la lista en staging y en producción. pedido: { base, clientes, logos: { slug: base64 } },
// donde base es el commit de staging que cargó el editor. Devuelve los commits nuevos de cada sitio
// (null si ya estaba así) y la base para seguir editando.
function publicar(pedido) {
  const usuario = exigirAcceso();
  const cerrojo = LockService.getScriptLock();
  if (!cerrojo.tryLock(20000)) throw new Error("Otra persona está publicando en este momento. Probá de nuevo en un minuto.");
  try {
    const gh = github();
    const rama = ramaDePublicacion();
    const clientes = (pedido.clientes || []).map((c) => ({ slug: c.slug, nombre: String(c.nombre || "").trim(), home: c.home === true }));
    const nuevos = pedido.logos || {};
    const errores = Cambios.validar(clientes, () => true);
    if (errores.length) throw new Error(errores.join(" "));
    Object.keys(nuevos).forEach((slug) => validarPng(nuevos[slug], slug));
    const autor = { name: usuario.split("@")[0], email: usuario, date: new Date().toISOString() };
    const mensajeDesde = (anterior) => Cambios.mensaje(Cambios.comparar(anterior, clientes, Object.keys(nuevos)), usuario);

    // Staging: si la lista o los logos cambiaron desde que se cargó el editor, no se pisa nada.
    const stg = CONFIG.sitios.staging.repo;
    const shaNuevo = {};
    Object.keys(nuevos).forEach((slug) => { shaNuevo[slug] = gh.crearBlob(stg, nuevos[slug]); });
    let finales = null;
    const commitStaging = publicarEn(gh, stg, rama, clientes, mensajeDesde, autor, (head, existentes) => {
      controlarConflicto(gh, stg, pedido.base, head);
      finales = logosFinales(clientes, shaNuevo, existentes);
      return { finales: finales, blob: (slug) => finales[slug] };
    });
    const base = gh.commitDeRama(stg, rama);

    // Producción: queda igual que staging; los logos que no tiene se copian de staging.
    let commitProduccion = null;
    let errorProduccion = null;
    try {
      const prod = CONFIG.sitios.produccion.repo;
      commitProduccion = publicarEn(gh, prod, rama, clientes, mensajeDesde, autor, () => ({
        finales: finales,
        blob: (slug) => gh.crearBlob(prod, nuevos[slug] || gh.leerBlob(stg, finales[slug])),
      }));
    } catch (err) {
      errorProduccion = err.message;
    }
    return {
      base: base,
      commits: [
        { sitio: "staging", commit: commitStaging },
        { sitio: "produccion", commit: commitProduccion, error: errorProduccion },
      ],
    };
  } finally {
    cerrojo.releaseLock();
  }
}

// Estado del deploy de cada commit publicado: esperando, construyendo, listo o fallo.
function estadoDespliegue(commits) {
  exigirAcceso();
  const gh = github();
  return commits.map((c) => {
    const ejecucion = gh.ejecuciones(CONFIG.sitios[c.sitio].repo, c.commit)[0];
    if (!ejecucion) return { sitio: c.sitio, estado: "esperando" };
    if (ejecucion.status !== "completed") {
      return { sitio: c.sitio, estado: ejecucion.status === "in_progress" ? "construyendo" : "esperando", url: ejecucion.html_url };
    }
    return { sitio: c.sitio, estado: ejecucion.conclusion === "success" ? "listo" : "fallo", url: ejecucion.html_url };
  });
}

// ---------- Publicación ----------

// Deja la rama del repo con esta lista y estos logos en un solo commit (o en ninguno si ya
// estaba así). preparar(head, existentes) devuelve { finales: { slug: sha }, blob(slug) }, donde
// blob da el sha del logo en este repo (creándolo si hace falta). Si la rama se mueve mientras
// tanto, vuelve a empezar desde el commit nuevo.
function publicarEn(gh, repo, rama, clientes, mensajeDesde, autor, preparar) {
  for (let intento = 1; intento <= 3; intento++) {
    const head = gh.commitDeRama(repo, rama);
    const existentes = gh.listarCarpeta(repo, head, CONFIG.logos);
    const plan = preparar(head, existentes);
    const cambios = [];
    const quedan = {};
    clientes.forEach((c) => {
      const archivo = `${c.slug}.png`;
      quedan[archivo] = true;
      if (existentes[archivo] !== plan.finales[c.slug]) cambios.push({ path: `${CONFIG.logos}/${archivo}`, sha: plan.blob(c.slug) });
    });
    Object.keys(existentes).forEach((archivo) => {
      if (!quedan[archivo]) cambios.push({ path: `${CONFIG.logos}/${archivo}`, sha: null });
    });
    const actual = gh.leerArchivo(repo, head, CONFIG.lista);
    const json = Cambios.formatear(clientes);
    if (!actual || actual.texto !== json) cambios.push({ path: CONFIG.lista, content: json });
    if (cambios.length === 0) return null;
    const arbol = gh.crearArbol(repo, gh.arbolDeCommit(repo, head), cambios);
    const commit = gh.crearCommit(repo, mensajeDesde(actual ? JSON.parse(actual.texto) : []), arbol, head, autor);
    if (gh.moverRama(repo, rama, commit)) return commit;
  }
  throw new Error(`No se pudo publicar en ${repo}: la rama cambió varias veces seguidas. Probá de nuevo.`);
}

// { slug: sha } del logo que tiene que quedar para cada cliente: el nuevo o el que ya estaba.
function logosFinales(clientes, shaNuevo, existentes) {
  const finales = {};
  clientes.forEach((c) => {
    finales[c.slug] = shaNuevo[c.slug] || existentes[`${c.slug}.png`];
    if (!finales[c.slug]) throw new Error(`${c.nombre} no tiene logo.`);
  });
  const errores = Cambios.validar(clientes, (slug) => !!finales[slug]);
  if (errores.length) throw new Error(errores.join(" "));
  return finales;
}

// Error si la lista o los logos de staging cambiaron entre base (lo que cargó el editor) y head.
function controlarConflicto(gh, repo, base, head) {
  if (!base) throw new Error("Falta el commit desde el que se editó. Recargá el editor.");
  if (base === head) return;
  const antes = gh.leerArchivo(repo, base, CONFIG.lista);
  const ahora = gh.leerArchivo(repo, head, CONFIG.lista);
  const mismosLogos = JSON.stringify(ordenar(gh.listarCarpeta(repo, base, CONFIG.logos))) === JSON.stringify(ordenar(gh.listarCarpeta(repo, head, CONFIG.logos)));
  if ((antes && antes.sha) !== (ahora && ahora.sha) || !mismosLogos) {
    throw new Error("CONFLICTO: mientras editabas, otra persona publicó cambios en los clientes.");
  }
}

function ordenar(objeto) {
  return Object.keys(objeto).sort().map((k) => [k, objeto[k]]);
}

// El logo tiene que ser un PNG de 120 px de alto (lo que arma el editor) y de menos de 1 MB.
function validarPng(base64, slug) {
  const bytes = Utilities.base64Decode(base64).map((b) => (b + 256) % 256);
  const firma = [137, 80, 78, 71, 13, 10, 26, 10];
  const alto = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
  if (bytes.length > 1024 * 1024 || firma.some((b, i) => bytes[i] !== b) || alto !== 120) {
    throw new Error(`El logo de ${slug} no es válido. Volvé a subirlo desde el editor.`);
  }
}

// Dónde aparece nombrado cada cliente en los textos del sitio: { slug: [lugares] }.
function menciones(gh, repo, commit, clientes) {
  const cache = CacheService.getScriptCache();
  const clave = `menciones:${commit}`;
  const guardado = cache.get(clave);
  if (guardado) return JSON.parse(guardado);
  const archivos = Object.keys(gh.listarCarpeta(repo, commit, CONFIG.textos)).filter((n) => /\.(ts|txt)$/.test(n));
  const textos = archivos.map((n) => ({ lugar: CONFIG.lugares[n] || n, texto: gh.leerArchivo(repo, commit, `${CONFIG.textos}/${n}`).texto }));
  const resultado = {};
  clientes.forEach((c) => {
    const nombre = c.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patron = new RegExp(`(^|[^\\p{L}\\p{N}])${nombre}(?![\\p{L}\\p{N}])`, "u");
    const lugares = textos.filter((t) => patron.test(t.texto)).map((t) => t.lugar);
    if (lugares.length) resultado[c.slug] = lugares;
  });
  cache.put(clave, JSON.stringify(resultado), 6 * 3600);
  return resultado;
}

// ---------- GitHub ----------

function propiedades() {
  return PropertiesService.getScriptProperties();
}

// La rama donde publica; RAMA en las propiedades del script permite probar en otra rama.
function ramaDePublicacion() {
  return propiedades().getProperty("RAMA") || "main";
}

function configurado() {
  const p = propiedades().getProperties();
  return !!(p.GITHUB_TOKEN || (p.GITHUB_APP_CLAVE && p.GITHUB_INSTALACION));
}

function github() {
  return GitHub.crear(pedirHttp, tokenGitHub());
}

function pedirHttp(metodo, url, cuerpo, token) {
  const opciones = {
    method: metodo.toLowerCase(),
    muteHttpExceptions: true,
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  };
  if (token) opciones.headers.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) {
    opciones.payload = cuerpo;
    opciones.contentType = "application/json";
  }
  const r = UrlFetchApp.fetch(url, opciones);
  return { estado: r.getResponseCode(), texto: r.getContentText() };
}

// Token de la instalación de la GitHub App (dura una hora; se guarda 50 minutos). GITHUB_TOKEN en
// las propiedades del script lo reemplaza, p. ej. con un token personal para probar.
function tokenGitHub() {
  const props = propiedades();
  const directo = props.getProperty("GITHUB_TOKEN");
  if (directo) return directo;
  const cache = CacheService.getScriptCache();
  const guardado = cache.get("token");
  if (guardado) return guardado;
  const instalacion = props.getProperty("GITHUB_INSTALACION");
  const r = pedirHttp("POST", `https://api.github.com/app/installations/${instalacion}/access_tokens`, undefined, jwtApp());
  if (r.estado !== 201) throw new Error(`GitHub no dio permiso para publicar (${r.estado}): ${r.texto}`);
  const token = JSON.parse(r.texto).token;
  cache.put("token", token, 50 * 60);
  return token;
}

// JWT firmado con la clave de la App, para pedir el token de la instalación.
function jwtApp() {
  const props = propiedades();
  const ahora = Math.floor(Date.now() / 1000);
  const b64 = (texto) => Utilities.base64EncodeWebSafe(texto, Utilities.Charset.UTF_8).replace(/=+$/, "");
  const sinFirma = `${b64(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64(JSON.stringify({ iat: ahora - 60, exp: ahora + 540, iss: props.getProperty("GITHUB_APP_CLIENT_ID") }))}`;
  const firma = Utilities.computeRsaSha256Signature(sinFirma, props.getProperty("GITHUB_APP_CLAVE"));
  return `${sinFirma}.${Utilities.base64EncodeWebSafe(firma).replace(/=+$/, "")}`;
}

// GitHub entrega la clave de la App en PKCS#1 y Apps Script firma con PKCS#8: la envuelve.
function aPkcs8(pem) {
  if (pem.indexOf("BEGIN PRIVATE KEY") >= 0) return pem;
  const pkcs1 = Utilities.base64Decode(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")).map((b) => (b + 256) % 256);
  const largo = (n) => (n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255]);
  const rsa = [0x02, 0x01, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const cuerpo = rsa.concat([0x04], largo(pkcs1.length), pkcs1);
  const der = [0x30].concat(largo(cuerpo.length), cuerpo).map((b) => (b > 127 ? b - 256 : b));
  return `-----BEGIN PRIVATE KEY-----\n${Utilities.base64Encode(der).match(/.{1,64}/g).join("\n")}\n-----END PRIVATE KEY-----\n`;
}

// ---------- Configuración (solo el dueño) ----------

// Crea la GitHub App con un manifiesto, guarda su clave cuando GitHub vuelve con el código y
// guarda la instalación cuando vuelve después de instalarla en los repos.
function paginaConfiguracion(p) {
  if (!esDuenio()) return aviso("Configuración del editor", "Solo la persona dueña del editor puede configurarlo.");
  const props = propiedades();
  const cacheUsuario = CacheService.getUserCache();
  let problema = "";
  if (p.code) {
    if (!p.state || cacheUsuario.get("estado-manifiesto") !== p.state) {
      problema = "El pedido a GitHub venció o no es de esta página. Creá la App de nuevo.";
    } else {
      const r = pedirHttp("POST", `https://api.github.com/app-manifests/${encodeURIComponent(p.code)}/conversions`);
      if (r.estado !== 201) {
        problema = `GitHub no confirmó la App (${r.estado}): ${r.texto}`;
      } else {
        const app = JSON.parse(r.texto);
        props.setProperties({ GITHUB_APP_ID: String(app.id), GITHUB_APP_CLIENT_ID: app.client_id, GITHUB_APP_SLUG: app.slug, GITHUB_APP_CLAVE: aPkcs8(app.pem) });
        props.deleteProperty("GITHUB_INSTALACION");
        CacheService.getScriptCache().remove("token");
      }
    }
  }
  if (p.installation_id) {
    props.setProperty("GITHUB_INSTALACION", String(p.installation_id));
    CacheService.getScriptCache().remove("token");
  }
  const url = ScriptApp.getService().getUrl();
  const estado = cacheUsuario.get("estado-manifiesto") || Utilities.getUuid();
  cacheUsuario.put("estado-manifiesto", estado, 3600);
  const t = HtmlService.createTemplateFromFile("configuracion");
  t.problema = problema;
  t.org = CONFIG.org;
  t.app = props.getProperty("GITHUB_APP_SLUG");
  t.instalacion = props.getProperty("GITHUB_INSTALACION");
  t.estado = estado;
  t.manifiesto = JSON.stringify({
    name: "Teamcubation editor de clientes",
    url: CONFIG.sitios.produccion.url,
    description: "Publica los cambios del editor de clientes del sitio en los repos de staging y producción.",
    public: false,
    redirect_url: url,
    setup_url: url,
    hook_attributes: { url: CONFIG.sitios.produccion.url, active: false },
    default_permissions: { contents: "write", actions: "read", metadata: "read" },
    default_events: [],
  });
  t.necesarios = [CONFIG.sitios.staging.repo, CONFIG.sitios.produccion.repo];
  t.repos = null;
  t.error = "";
  if (t.app && t.instalacion) {
    try {
      t.repos = github().reposDelToken();
    } catch (err) {
      t.error = err.message;
    }
  }
  t.url = url;
  return t.evaluate().setTitle("Configurar el editor de clientes").addMetaTag("viewport", "width=device-width, initial-scale=1");
}
