// Cliente mínimo de la API de GitHub para el editor, sincrónico como todo Apps Script. No sabe
// cómo se hace un pedido HTTP: lo recibe (UrlFetchApp en Apps Script, curl en las pruebas).
//   http(metodo, url, cuerpo) → { estado, texto }
var GitHub = (function () {
  const API = "https://api.github.com";

  function crear(http, token) {
    function pedir(metodo, ruta, cuerpo, aceptables) {
      const r = http(metodo, API + ruta, cuerpo === undefined ? undefined : JSON.stringify(cuerpo), token);
      const datos = r.texto ? JSON.parse(r.texto) : null;
      if (r.estado >= 200 && r.estado < 300) return datos;
      if (aceptables && aceptables.indexOf(r.estado) >= 0) return { estado: r.estado, datos: datos };
      throw new Error(`GitHub respondió ${r.estado} a ${metodo} ${ruta}: ${(datos && datos.message) || r.texto}`);
    }
    const enc = encodeURIComponent;
    const rutaContenido = (ruta) => ruta.split("/").map(enc).join("/");

    return {
      // Commit al que apunta la rama.
      commitDeRama(repo, rama) {
        return pedir("GET", `/repos/${repo}/git/ref/heads/${enc(rama)}`).object.sha;
      },
      arbolDeCommit(repo, commit) {
        return pedir("GET", `/repos/${repo}/git/commits/${commit}`).tree.sha;
      },
      // Contenido (texto) y sha de un archivo en un commit, o null si no existe.
      leerArchivo(repo, ref, ruta) {
        const r = pedir("GET", `/repos/${repo}/contents/${rutaContenido(ruta)}?ref=${ref}`, undefined, [404]);
        if (r.estado === 404) return null;
        return { sha: r.sha, texto: decodificarBase64(r.content) };
      },
      // { nombre: sha } de los archivos de una carpeta en un commit ({} si no existe).
      listarCarpeta(repo, ref, ruta) {
        const r = pedir("GET", `/repos/${repo}/contents/${rutaContenido(ruta)}?ref=${ref}`, undefined, [404]);
        const archivos = {};
        if (r.estado === 404) return archivos;
        r.forEach((a) => { if (a.type === "file") archivos[a.name] = a.sha; });
        return archivos;
      },
      // Contenido en base64 de un blob.
      leerBlob(repo, sha) {
        return pedir("GET", `/repos/${repo}/git/blobs/${sha}`).content.replace(/\s/g, "");
      },
      crearBlob(repo, base64) {
        return pedir("POST", `/repos/${repo}/git/blobs`, { content: base64, encoding: "base64" }).sha;
      },
      // Árbol nuevo a partir de base con estos cambios: { path, sha } (sha null borra) o { path, content }.
      crearArbol(repo, base, cambios) {
        const tree = cambios.map((c) => (c.content !== undefined
          ? { path: c.path, mode: "100644", type: "blob", content: c.content }
          : { path: c.path, mode: "100644", type: "blob", sha: c.sha }));
        return pedir("POST", `/repos/${repo}/git/trees`, { base_tree: base, tree: tree }).sha;
      },
      crearCommit(repo, mensaje, arbol, padre, autor) {
        return pedir("POST", `/repos/${repo}/git/commits`, { message: mensaje, tree: arbol, parents: [padre], author: autor }).sha;
      },
      // Mueve la rama al commit si es un avance (fast-forward). false si la rama se movió mientras tanto.
      moverRama(repo, rama, commit) {
        const r = pedir("PATCH", `/repos/${repo}/git/refs/heads/${enc(rama)}`, { sha: commit, force: false }, [409, 422]);
        return !r.estado;
      },
      // Ejecuciones del workflow de deploy para un commit (las más nuevas primero).
      ejecuciones(repo, commit) {
        return pedir("GET", `/repos/${repo}/actions/runs?head_sha=${commit}&per_page=20`).workflow_runs
          .filter((e) => e.path === ".github/workflows/deploy.yml");
      },
      // Repos a los que llega el token (para revisar la instalación de la GitHub App).
      reposDelToken() {
        return pedir("GET", "/installation/repositories?per_page=100").repositories.map((r) => r.full_name);
      },
    };
  }

  // Base64 (con saltos de línea, como lo devuelve GitHub) a texto UTF-8.
  function decodificarBase64(b64) {
    const limpio = b64.replace(/\s/g, "");
    if (typeof Utilities !== "undefined") return Utilities.newBlob(Utilities.base64Decode(limpio)).getDataAsString("UTF-8");
    return Buffer.from(limpio, "base64").toString("utf8");
  }

  return { crear };
})();

if (typeof module !== "undefined") module.exports = GitHub;
