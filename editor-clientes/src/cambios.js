// Lógica de la lista de clientes que comparten el editor (navegador) y el servidor (Apps Script):
// validarla, compararla con la anterior, escribirla con el formato de src/data/clientes.json y
// armar el mensaje del commit. No depende de nada; las pruebas la cargan en Node.
var Cambios = (function () {
  const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const MAX_NOMBRE = 80;

  // Un slug para un nombre nuevo ("Plaza Logística" → "plaza-logistica"), distinto de los usados.
  function slugPara(nombre, usados) {
    const base = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "cliente";
    let slug = base;
    for (let n = 2; usados.has(slug); n++) slug = `${base}-${n}`;
    return slug;
  }

  // Problemas de la lista, en castellano para mostrarlos tal cual. tieneLogo(slug) dice si el
  // cliente tiene logo (en el repo o recién subido).
  function validar(clientes, tieneLogo) {
    const errores = [];
    const slugs = new Set();
    const nombres = new Set();
    if (!Array.isArray(clientes) || clientes.length === 0) return ["La lista de clientes está vacía."];
    clientes.forEach((c, i) => {
      const nombre = typeof c.nombre === "string" ? c.nombre.trim() : "";
      const quien = nombre || `El cliente ${i + 1}`;
      if (!nombre) errores.push(`${quien} no tiene nombre.`);
      else if (nombre.length > MAX_NOMBRE) errores.push(`${quien}: el nombre es muy largo (hasta ${MAX_NOMBRE} caracteres).`);
      else if (nombres.has(nombre.toLowerCase())) errores.push(`${quien} está dos veces.`);
      if (typeof c.slug !== "string" || !SLUG.test(c.slug)) errores.push(`${quien}: identificador inválido.`);
      else if (slugs.has(c.slug)) errores.push(`${quien}: identificador repetido (${c.slug}).`);
      else if (!tieneLogo(c.slug)) errores.push(`${quien} no tiene logo.`);
      if (typeof c.home !== "boolean") errores.push(`${quien}: falta indicar si va en la home.`);
      nombres.add(nombre.toLowerCase());
      slugs.add(c.slug);
    });
    return errores;
  }

  // La lista como en src/data/clientes.json: un cliente por línea, siempre con las mismas claves.
  function formatear(clientes) {
    const fila = (c) => `  { "slug": ${JSON.stringify(c.slug)}, "nombre": ${JSON.stringify(c.nombre.trim())}, "home": ${c.home ? "true" : "false"} }`;
    return `[\n${clientes.map(fila).join(",\n")}\n]\n`;
  }

  // Qué cambió de antes a despues. logosNuevos: slugs a los que se les subió logo.
  function comparar(antes, despues, logosNuevos) {
    const previo = new Map(antes.map((c) => [c.slug, c]));
    const sigue = new Set(despues.map((c) => c.slug));
    const nuevos = new Set(logosNuevos || []);
    const r = { agregados: [], quitados: [], renombrados: [], logos: [], aLaHome: [], fueraDeLaHome: [], orden: false };
    for (const c of despues) {
      const p = previo.get(c.slug);
      if (!p) { r.agregados.push(c.nombre.trim()); continue; }
      if (p.nombre !== c.nombre.trim()) r.renombrados.push({ de: p.nombre, a: c.nombre.trim() });
      if (nuevos.has(c.slug)) r.logos.push(c.nombre.trim());
      if (!p.home && c.home) r.aLaHome.push(c.nombre.trim());
      if (p.home && !c.home) r.fueraDeLaHome.push(c.nombre.trim());
    }
    for (const p of antes) if (!sigue.has(p.slug)) r.quitados.push(p.nombre);
    // El orden cambió si los que estaban antes y siguen no quedaron en el mismo orden relativo.
    const ordenAntes = antes.filter((c) => sigue.has(c.slug)).map((c) => c.slug);
    const ordenDespues = despues.filter((c) => previo.has(c.slug)).map((c) => c.slug);
    r.orden = ordenAntes.join() !== ordenDespues.join();
    return r;
  }

  function hayCambios(r) {
    return r.orden || ["agregados", "quitados", "renombrados", "logos", "aLaHome", "fueraDeLaHome"].some((k) => r[k].length > 0);
  }

  // "A", "A and B", "A, B and C"
  function enumerar(nombres) {
    return nombres.length < 2 ? nombres.join("") : `${nombres.slice(0, -1).join(", ")} and ${nombres[nombres.length - 1]}`;
  }

  // Mensaje del commit, en inglés como el resto del historial del repo. El título dice todo si
  // entra en 72 caracteres; si no, cuántos de cada cosa.
  function mensaje(r, autor) {
    const partes = [];
    const n = (lista, uno, varios) => (lista.length === 1 ? uno : `${lista.length} ${varios}`);
    if (r.agregados.length) partes.push([`add ${enumerar(r.agregados)}`, `add ${n(r.agregados, "1", "")}`.trim()]);
    if (r.quitados.length) partes.push([`remove ${enumerar(r.quitados)}`, `remove ${n(r.quitados, "1", "")}`.trim()]);
    if (r.renombrados.length) partes.push([`rename ${enumerar(r.renombrados.map((x) => `${x.de} to ${x.a}`))}`, `rename ${n(r.renombrados, "1", "")}`.trim()]);
    if (r.logos.length) partes.push([`new logo for ${enumerar(r.logos)}`, n(r.logos, "new logo", "new logos")]);
    if (r.aLaHome.length) partes.push([`show ${enumerar(r.aLaHome)} on the home page`, "home page"]);
    if (r.fueraDeLaHome.length) partes.push([`take ${enumerar(r.fueraDeLaHome)} off the home page`, "home page"]);
    if (r.orden) partes.push(["reorder", "reorder"]);
    let titulo = `Clients: ${partes.map((p) => p[0]).join("; ") || "no changes"}`;
    if (titulo.length > 72) titulo = `Clients: ${partes.map((p) => p[1]).filter((v, i, a) => a.indexOf(v) === i).join(", ")}`;
    const lineas = partes.map((p) => `- ${p[0][0].toUpperCase()}${p[0].slice(1)}${/[.!?]$/.test(p[0]) ? "" : "."}`);
    return `${titulo}\n\n${lineas.join("\n")}\n\nPublished from the client editor by ${autor}.\n`;
  }

  return { slugPara, validar, formatear, comparar, hayCambios, mensaje };
})();

if (typeof module !== "undefined") module.exports = Cambios;
