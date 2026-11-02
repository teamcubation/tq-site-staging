// Editor de clientes (navegador): la lista se edita acá y se publica de una sola vez con
// google.script.run.publicar. Usa Logo (logo.js) para convertir los logos y Cambios (cambios.js)
// para validar la lista y resumir los cambios.
(() => {
  // Igual que en TiraLogos.astro: cada logo de la tira ocupa más o menos la misma superficie.
  const SUPERFICIE = 3000;

  // google.script.run con promesas: servidor.cargar(), servidor.publicar(pedido)…
  const servidor = new Proxy({}, {
    get: (_, funcion) => (...args) => new Promise((ok, mal) => {
      google.script.run.withSuccessHandler(ok).withFailureHandler(mal)[funcion](...args);
    }),
  });

  const $ = (id) => document.getElementById(id);
  const estado = {
    datos: null, // lo que devolvió cargar()
    original: [], // la lista publicada, para comparar
    clientes: [], // la lista que se está editando
    logosNuevos: {}, // slug → { dataUrl, base64 }
    quitados: [], // { cliente, indice }, para deshacer
    confirmando: null, // slug del cliente que se está por quitar
    destacar: null, // slug a resaltar en el próximo dibujo
  };

  // ---------- Utilidades ----------

  function el(etiqueta, atributos, texto) {
    const nodo = document.createElement(etiqueta);
    for (const [k, v] of Object.entries(atributos || {})) nodo.setAttribute(k, v);
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function boton(texto, clase, alHacerClic) {
    const b = el("button", { type: "button", class: clase }, texto);
    b.addEventListener("click", alHacerClic);
    return b;
  }

  // "A", "A y B", "A, B y C"
  function listar(items) {
    return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const mensajeDe = (err) => String((err && err.message) || err).replace(/^Error: /, "");
  const esNuevo = (slug) => !estado.original.some((c) => c.slug === slug);
  const zoomDe = (c) => (c.zoom === undefined ? 1 : c.zoom);
  const urlLogo = (slug) => (estado.logosNuevos[slug] ? estado.logosNuevos[slug].dataUrl : `${estado.datos.urlLogos}${slug}.png`);

  function mostrarError(caja, titulo, err) {
    caja.replaceChildren(el("strong", {}, titulo), document.createTextNode(` ${mensajeDe(err)}`));
    caja.hidden = false;
  }

  // Tamaño del logo en la tira de la home (mismo cálculo que TiraLogos.astro).
  function medirParaTira(img, zoom) {
    img.dataset.zoom = zoom;
    const ajustar = () => {
      const proporcion = img.naturalWidth / img.naturalHeight;
      const alto = Math.min(44, Math.sqrt(SUPERFICIE / proporcion), 150 / proporcion) * Number(img.dataset.zoom);
      img.style.width = `${Math.round(alto * proporcion)}px`;
      img.style.height = `${Math.round(alto)}px`;
    };
    if (img.complete && img.naturalWidth) ajustar();
    else img.addEventListener("load", ajustar, { once: true });
  }

  // ---------- Carga ----------

  async function cargar() {
    $("cargando").hidden = false;
    $("editor").hidden = true;
    $("error-carga").hidden = true;
    $("barra").hidden = true;
    try {
      const datos = await servidor.cargar();
      estado.datos = datos;
      estado.original = datos.clientes.map((c) => ({ ...c }));
      estado.clientes = datos.clientes.map((c) => ({ ...c }));
      estado.logosNuevos = {};
      estado.quitados = [];
      estado.confirmando = null;
      $("usuario").textContent = datos.usuario;
      $("enlaces").replaceChildren(...datos.sitios.map((s) => el("a", { href: `${s.url}/casos/`, target: "_blank", rel: "noopener" }, s.nombre)));
      $("prueba").textContent = `Modo de prueba: los cambios se guardan en la rama «${datos.rama}» y no se publican en los sitios.`;
      $("prueba").hidden = datos.rama === "main";
      $("cargando").hidden = true;
      $("editor").hidden = false;
      dibujar();
    } catch (err) {
      $("cargando").hidden = true;
      mostrarError($("error-carga"), "No se pudo cargar la lista de clientes.", err);
    }
  }

  // ---------- Dibujo ----------

  function dibujar() {
    $("grilla").replaceChildren(...estado.clientes.map(tarjeta));
    actualizar();
    if (estado.destacar) {
      const li = $("grilla").querySelector(`[data-slug="${estado.destacar}"]`);
      if (li) {
        li.classList.add("tarjeta--destacada");
        li.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      estado.destacar = null;
    }
  }

  // Lo que cambia sin volver a dibujar la grilla (para no perder el foco al escribir).
  function actualizar() {
    $("cuenta").textContent = `(${estado.clientes.length})`;
    [...$("grilla").children].forEach((li, i) => { li.querySelector(".tarjeta__posicion").textContent = i + 1; });
    dibujarTira();
    dibujarResumen();
  }

  function tarjeta(c, i) {
    const li = el("li", { class: `tarjeta${esNuevo(c.slug) ? " tarjeta--nueva" : ""}`, "data-slug": c.slug });
    li.append(el("span", { class: "tarjeta__posicion" }, String(i + 1)));
    const antes = estado.original.find((o) => o.slug === c.slug);
    const marca = !antes ? "Nuevo" : estado.logosNuevos[c.slug] ? "Logo cambiado" : zoomDe(antes) !== zoomDe(c) ? "Otro tamaño" : "";
    if (marca) li.append(el("span", { class: "tarjeta__marca" }, marca));
    const card = el("div", { class: "logo-card", title: "Arrastrá para cambiar el orden" });
    card.style.setProperty("--zoom", zoomDe(c));
    const img = el("img", { src: urlLogo(c.slug), alt: c.nombre });
    card.append(img);
    li.append(card);

    if (estado.confirmando === c.slug) {
      li.append(confirmarQuitar(c));
      return li;
    }

    const nombre = el("input", { class: "tarjeta__nombre", "aria-label": `Nombre de ${c.nombre}`, maxlength: "80" });
    nombre.value = c.nombre;
    nombre.addEventListener("input", () => {
      c.nombre = nombre.value;
      img.alt = nombre.value;
      actualizar();
    });
    li.append(nombre);

    const fila = el("div", { class: "tarjeta__fila" });
    const home = el("input", { type: "checkbox" });
    home.checked = c.home;
    home.addEventListener("change", () => {
      c.home = home.checked;
      actualizar();
    });
    const etiqueta = el("label", { class: "tarjeta__home" });
    etiqueta.append(home, document.createTextNode("En la home"));
    const acciones = el("div", { class: "tarjeta__acciones" });
    acciones.append(
      boton("Logo", "", () => abrirDialogoLogo(c)),
      boton("Quitar", "", () => {
        estado.confirmando = c.slug;
        dibujar();
      }),
    );
    fila.append(etiqueta, acciones);
    li.append(fila);
    return li;
  }

  function confirmarQuitar(c) {
    const caja = el("div", { class: "tarjeta__confirmar" });
    caja.append(el("p", {}, `¿Quitar ${c.nombre.trim() || "este cliente"}?`));
    const lugares = estado.datos.menciones[c.slug];
    if (lugares && !esNuevo(c.slug)) {
      caja.append(el("p", {}, `También aparece nombrado en ${listar(lugares)}. Ese texto no cambia solo: avisá si hay que corregirlo.`));
    }
    caja.append(
      boton("Quitar", "boton boton--peligro", () => quitarCliente(c)),
      boton("Cancelar", "boton boton--texto", () => {
        estado.confirmando = null;
        dibujar();
      }),
    );
    return caja;
  }

  function quitarCliente(c) {
    const indice = estado.clientes.indexOf(c);
    estado.clientes.splice(indice, 1);
    if (esNuevo(c.slug)) delete estado.logosNuevos[c.slug];
    else estado.quitados.push({ cliente: c, indice: indice });
    estado.confirmando = null;
    dibujar();
  }

  function deshacerQuitar(q) {
    estado.quitados.splice(estado.quitados.indexOf(q), 1);
    estado.clientes.splice(Math.min(q.indice, estado.clientes.length), 0, q.cliente);
    estado.destacar = q.cliente.slug;
    dibujar();
  }

  function dibujarTira() {
    const enHome = estado.clientes.filter((c) => c.home);
    $("cuenta-home").textContent = `(${enHome.length})`;
    if (!enHome.length) {
      $("tira").replaceChildren(el("p", { class: "tira__vacia" }, "Ningún cliente está marcado para la home: la tira quedaría vacía."));
      return;
    }
    $("tira").replaceChildren(...enHome.map((c) => {
      const caja = el("div", { class: "tira__logo" });
      const img = el("img", { src: urlLogo(c.slug), alt: c.nombre });
      medirParaTira(img, zoomDe(c));
      caja.append(img);
      return caja;
    }));
  }

  function comparacion() {
    const reemplazados = Object.keys(estado.logosNuevos).filter((slug) => !esNuevo(slug));
    return Cambios.comparar(estado.original, estado.clientes, reemplazados);
  }

  function errores() {
    const conLogo = new Set(estado.datos.logos.concat(Object.keys(estado.logosNuevos)));
    return Cambios.validar(estado.clientes, (slug) => conLogo.has(slug));
  }

  // Los cambios en palabras, para la barra y para confirmar la publicación.
  function frases(r) {
    const f = [];
    if (r.agregados.length) f.push(`Agregás ${listar(r.agregados)}`);
    r.quitados.forEach((n) => f.push(`Quitás ${n}`));
    r.renombrados.forEach((x) => f.push(`${x.de} → ${x.a}`));
    if (r.logos.length) f.push(`Cambia el logo de ${listar(r.logos)}`);
    if (r.zoom.length) f.push(`Cambia el tamaño de ${listar(r.zoom)}`);
    if (r.aLaHome.length) f.push(`A la home: ${listar(r.aLaHome)}`);
    if (r.fueraDeLaHome.length) f.push(`Sale de la home: ${listar(r.fueraDeLaHome)}`);
    if (r.orden) f.push("Cambia el orden");
    return f;
  }

  function dibujarResumen() {
    const r = comparacion();
    const problemas = errores();
    const hay = Cambios.hayCambios(r);
    $("barra").hidden = !hay && !problemas.length;
    // Los quitados van uno por uno, cada uno con su "deshacer".
    const items = frases({ ...r, quitados: [] }).map((texto) => el("li", {}, texto));
    estado.quitados.forEach((q) => {
      const original = estado.original.find((c) => c.slug === q.cliente.slug);
      const li = el("li", {}, `Quitás ${original.nombre} · `);
      li.append(boton("deshacer", "enlace-boton", () => deshacerQuitar(q)));
      items.push(li);
    });
    problemas.forEach((p) => items.push(el("li", { class: "aviso--error" }, p)));
    $("resumen").replaceChildren(...items);
    $("publicar").disabled = !hay || problemas.length > 0;
  }

  // ---------- Orden ----------

  Sortable.create($("grilla"), {
    animation: 150,
    handle: ".logo-card",
    onEnd: () => {
      const orden = [...$("grilla").children].map((li) => li.dataset.slug);
      estado.clientes.sort((a, b) => orden.indexOf(a.slug) - orden.indexOf(b.slug));
      actualizar();
    },
  });

  // ---------- Agregar o editar un logo ----------

  // Como en el sitio (CasosBody.astro): el logo entra en una caja de 140 × 44 px multiplicada por
  // su zoom y, agrandado, puede ocupar el relleno de la tarjeta hasta 12 px del borde, o sea hasta
  // 164 × 80 px. El zoom llega hasta donde el logo todavía entra, y nunca a más de 200 %.
  const CAJA = { ancho: 140, alto: 44 };
  const TOPE = { ancho: 164, alto: 80 };

  function zoomMaximo(proporcion) {
    const ancho = Math.min(CAJA.ancho, CAJA.alto * proporcion);
    const zoom = Math.min(Cambios.ZOOM.max, TOPE.ancho / ancho, TOPE.alto / (ancho / proporcion));
    return Math.floor(zoom * 100 + 1e-6) / 100;
  }

  // Detalle (0 a 100) ↔ umbral de Logo.procesar: más detalle es un umbral más bajo. 100 es
  // Logo.UMBRAL_SITIO: un logo del sitio queda como estaba.
  const umbralDe = (detalle) => 0.6 - (0.58 * detalle) / 100;
  const detalleDe = (umbral) => Math.round(((0.6 - umbral) / 0.58) * 100);

  // Lo guardado en editor-clientes/originales/ajustes.json ({ detalle, invertir, sitio }) como
  // opciones de Logo.procesar, y al revés.
  function opcionesDe(ajustes) {
    const o = {};
    if (ajustes.detalle !== undefined) o.umbral = umbralDe(ajustes.detalle);
    if (ajustes.invertir !== undefined) o.invertir = ajustes.invertir;
    if (ajustes.sitio) o.sitio = true;
    return o;
  }

  function ajustesDe(opciones) {
    const a = {};
    if (opciones.umbral !== undefined) a.detalle = detalleDe(opciones.umbral);
    if (opciones.invertir !== undefined) a.invertir = opciones.invertir;
    if (opciones.sitio) a.sitio = true;
    return a;
  }

  const ajustesGuardados = (slug) => (estado.logosNuevos[slug] ? estado.logosNuevos[slug].ajustes : estado.datos.ajustes[slug] || {});

  // El diálogo abierto:
  //   cliente: el que se edita (null al agregar uno)
  //   zoom, y proporcion: la del logo que se ve (null hasta que carga la imagen)
  //   fuente: de dónde sale el logo al cambiar el detalle, { archivo, lectura, tipo, sitio }, con
  //     tipo "nuevo" (recién elegido), "sesion" (elegido antes, todavía sin publicar), "guardado"
  //     (el original guardado en el repo) o "sitio" (no hay original: se ajusta el del sitio, y
  //     sitio es true también si el original guardado es un logo del sitio). null mientras carga.
  //   opciones: las de Logo.procesar elegidas a mano (o guardadas)
  //   resultado: el logo convertido de nuevo, { dataUrl, base64, altoOriginal } o { error }; null
  //     si sigue el de antes
  let dialogo = null;
  let urlOriginal = null;

  function abrirDialogoLogo(cliente) {
    const d = { cliente: cliente, zoom: cliente ? zoomDe(cliente) : 1, proporcion: null, fuente: null, opciones: {}, resultado: null };
    dialogo = d;
    $("logo-titulo").textContent = cliente ? `Logo de ${cliente.nombre}` : "Agregar cliente";
    $("campo-nombre").hidden = !!cliente;
    $("logo-nombre").value = "";
    $("logo-archivo").value = "";
    $("zona-texto").textContent = cliente
      ? "Para cambiar el archivo, soltá otro acá o elegilo (PNG, JPG, SVG o WebP)."
      : "Soltá el archivo acá o elegilo (PNG, JPG, SVG o WebP). Mejor si es grande o SVG.";
    $("logo-error").hidden = true;
    $("logo-aceptar").textContent = cliente ? "Listo" : "Agregar";
    mostrarOriginal(null);
    $("logo-detalle").disabled = true;
    $("ajuste-invertir").hidden = true;
    nota("");
    if (cliente) {
      d.opciones = opcionesDe(ajustesGuardados(cliente.slug));
      nota("Cargando el original para poder cambiar el detalle…");
      cargarFuente(d);
    }
    mostrar();
    $("dialogo-logo").showModal();
    (cliente ? $("zona") : $("logo-nombre")).focus();
  }

  function nota(texto) {
    $("logo-nota").textContent = texto;
    $("logo-nota").hidden = !texto;
  }

  function mostrarOriginal(archivo) {
    if (urlOriginal) URL.revokeObjectURL(urlOriginal);
    urlOriginal = archivo ? URL.createObjectURL(archivo) : null;
    if (urlOriginal) $("vista-original").src = urlOriginal;
    else $("vista-original").removeAttribute("src");
  }

  // Busca de dónde sale el logo de un cliente que ya tiene uno: el archivo elegido en esta sesión,
  // el original guardado o, si no hay, el logo del sitio.
  async function cargarFuente(d) {
    const slug = d.cliente.slug;
    const previo = estado.logosNuevos[slug];
    const guardado = estado.datos.originales[slug];
    try {
      let fuente;
      if (previo && previo.original) fuente = { tipo: "sesion", archivo: previo.original.archivo, sitio: previo.original.sitio };
      else if (guardado) fuente = { tipo: "guardado", archivo: await descargar(estado.datos.urlOriginales + guardado, guardado), sitio: !!d.opciones.sitio };
      else fuente = { tipo: "sitio", archivo: await descargar(`${estado.datos.urlLogos}${slug}.png`, `${slug}.png`), sitio: true };
      fuente.lectura = await leerImagen(fuente.archivo);
      if (dialogo !== d) return;
      d.fuente = fuente;
      if (fuente.sitio) d.opciones.sitio = true;
      mostrarOriginal(fuente.archivo);
      // Los controles quedan en lo que se usó para el logo, sin convertirlo de nuevo.
      ponerControles(Logo.procesar(fuente.lectura.px, fuente.lectura.ancho, fuente.lectura.alto, d.opciones));
    } catch (err) {
      if (dialogo !== d) return;
      console.error(err);
      nota("No se pudo cargar el original de este logo, así que el detalle no se puede cambiar (el zoom sí). Para cambiarlo, subí el archivo de nuevo.");
    }
  }

  // Un archivo del repo (raw.githubusercontent.com, que permite leerlo desde otra página).
  async function descargar(url, nombre) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return new File([await r.blob()], nombre, { type: tipoDe(nombre) });
  }

  const TIPOS = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", webp: "image/webp" };
  const tipoDe = (nombre) => TIPOS[(nombre.split(".").pop() || "").toLowerCase()] || "";
  function extensionDe(archivo) {
    const porTipo = Object.keys(TIPOS).find((e) => TIPOS[e] === archivo.type);
    const porNombre = (archivo.name.split(".").pop() || "").toLowerCase();
    const extension = TIPOS[porNombre] ? porNombre : porTipo || "png";
    return extension === "jpeg" ? "jpg" : extension;
  }

  // Dibuja el archivo en un canvas y devuelve sus píxeles. Los SVG se dibujan grandes (1600 px
  // del lado mayor) para que el borde quede nítido al achicarlos; las fotos, hasta 2400 px.
  async function leerImagen(archivo) {
    const esSvg = archivo.type === "image/svg+xml" || /\.svg$/i.test(archivo.name);
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      let ancho = img.naturalWidth;
      let alto = img.naturalHeight;
      if (esSvg) {
        const proporcion = proporcionSvg(await archivo.text()) || (ancho && alto ? ancho / alto : 1);
        [ancho, alto] = proporcion >= 1 ? [1600, Math.round(1600 / proporcion)] : [Math.round(1600 * proporcion), 1600];
      } else {
        const escala = Math.min(1, 2400 / Math.max(ancho, alto));
        ancho = Math.max(1, Math.round(ancho * escala));
        alto = Math.max(1, Math.round(alto * escala));
      }
      const canvas = el("canvas", { width: ancho, height: alto });
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, ancho, alto);
      return { px: ctx.getImageData(0, 0, ancho, alto).data, ancho: ancho, alto: alto };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function proporcionSvg(texto) {
    const svg = new DOMParser().parseFromString(texto, "image/svg+xml").documentElement;
    const caja = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
    if (caja.length === 4 && caja[2] > 0 && caja[3] > 0) return caja[2] / caja[3];
    const ancho = parseFloat(svg.getAttribute("width"));
    const alto = parseFloat(svg.getAttribute("height"));
    return ancho > 0 && alto > 0 ? ancho / alto : null;
  }

  function aPng(r) {
    const canvas = el("canvas", { width: r.ancho, height: r.alto });
    canvas.getContext("2d").putImageData(new ImageData(r.rgba, r.ancho, r.alto), 0, 0);
    return canvas.toDataURL("image/png");
  }

  async function elegirArchivo(archivo) {
    const d = dialogo;
    if (!archivo || !d) return;
    $("logo-error").hidden = true;
    if (archivo.size > 10 * 1024 * 1024) {
      mostrarError($("logo-error"), "El archivo es muy grande.", "Usá uno de menos de 10 MB.");
      return;
    }
    const textoZona = $("zona-texto").textContent;
    $("zona-texto").textContent = `Procesando ${archivo.name}…`;
    let lectura;
    try {
      lectura = await leerImagen(archivo);
    } catch (err) {
      $("zona-texto").textContent = textoZona;
      mostrarError($("logo-error"), "No se pudo leer la imagen.", "Probá con otro archivo (PNG, JPG, SVG o WebP).");
      return;
    }
    if (dialogo !== d) return;
    $("zona-texto").textContent = `${archivo.name} · elegir otro archivo`;
    d.fuente = { tipo: "nuevo", archivo: archivo, lectura: lectura, sitio: false };
    d.opciones = {};
    d.zoom = 1;
    nota("");
    mostrarOriginal(archivo);
    convertir(true);
  }

  // Convierte la fuente con las opciones del diálogo. inicial: además pone el detalle e invertir
  // en lo que eligió Logo.
  function convertir(inicial) {
    const d = dialogo;
    const { px, ancho, alto } = d.fuente.lectura;
    const r = Logo.procesar(px, ancho, alto, d.opciones);
    if (inicial) ponerControles(r);
    if (r.error) {
      d.resultado = {
        error: r.fondoTransparente && !d.fuente.sitio
          ? "No quedó nada visible: subí el detalle o probá «Invertir»."
          : "No quedó nada visible: subí el detalle.",
      };
    } else {
      const dataUrl = aPng(r);
      d.resultado = { dataUrl: dataUrl, base64: dataUrl.split(",")[1], altoOriginal: r.altoOriginal };
    }
    mostrar();
  }

  function ponerControles(r) {
    const d = dialogo;
    $("logo-detalle").value = detalleDe(r.umbral);
    $("logo-detalle").disabled = false;
    $("logo-invertir").checked = r.invertir;
    $("ajuste-invertir").hidden = d.fuente.sitio || !r.fondoTransparente;
    nota(d.fuente.sitio
      ? "No está guardado el archivo original de este logo, así que el detalle se ajusta sobre el del sitio: bajarlo borra lo más tenue, pero subirlo no recupera lo que le falta. Para eso, subí el original."
      : "");
  }

  // Las vistas: el logo nuevo o, si no cambió, el de antes, con el zoom.
  function mostrar() {
    const d = dialogo;
    const r = d.resultado;
    $("vista").hidden = !d.cliente && !r;
    $("logo-aviso").hidden = true;
    if (r && r.error) {
      d.proporcion = null;
      $("vista-tarjeta").removeAttribute("src");
      $("vista-home").removeAttribute("src");
      $("logo-aviso").textContent = r.error;
      $("logo-aviso").hidden = false;
    } else if (d.cliente || r) {
      const src = r ? r.dataUrl : urlLogo(d.cliente.slug);
      const img = $("vista-tarjeta");
      if (img.getAttribute("src") !== src) {
        d.proporcion = null;
        img.src = src;
        $("vista-home").src = src;
      } else if (img.complete && img.naturalWidth) {
        d.proporcion = img.naturalWidth / img.naturalHeight;
      }
    }
    mostrarZoom();
    validarDialogo();
  }

  // La proporción se sabe cuando carga la imagen; con ella, hasta dónde llega el zoom.
  $("vista-tarjeta").addEventListener("load", () => {
    const img = $("vista-tarjeta");
    if (!dialogo || !img.naturalWidth) return;
    dialogo.proporcion = img.naturalWidth / img.naturalHeight;
    mostrarZoom();
  });

  function mostrarZoom() {
    const d = dialogo;
    const control = $("logo-zoom");
    const maximo = d.proporcion ? zoomMaximo(d.proporcion) : Cambios.ZOOM.max;
    d.zoom = Math.min(d.zoom, maximo);
    control.max = Math.round(maximo * 100);
    control.value = Math.round(d.zoom * 100);
    control.disabled = !d.proporcion;
    $("logo-zoom-valor").textContent = `${Math.round(d.zoom * 100)} %`;
    $("logo-zoom-restablecer").hidden = d.zoom === 1;
    $("logo-zoom-tope").hidden = !d.proporcion || d.zoom < maximo || maximo >= Cambios.ZOOM.max;
    $("vista-tarjeta").parentElement.style.setProperty("--zoom", d.zoom);
    medirParaTira($("vista-home"), d.zoom);
    // Se ve borroso si en una pantalla de alta densidad el logo queda a más de 1,5 veces su tamaño.
    const r = d.resultado;
    if (r && !r.error && r.altoOriginal < 60 * d.zoom) {
      $("logo-aviso").textContent = `El logo es chico (${r.altoOriginal} px de alto) y se va a ver algo borroso. Si conseguís uno más grande o en SVG, mejor.`;
      $("logo-aviso").hidden = false;
    } else if (!r || !r.error) {
      $("logo-aviso").hidden = true;
    }
  }

  function validarDialogo() {
    const d = dialogo;
    let ok = !!d && (d.resultado ? !d.resultado.error : !!d.cliente);
    if (d && !d.cliente) {
      const nombre = $("logo-nombre").value.trim().toLowerCase();
      const repetido = estado.clientes.some((c) => c.nombre.trim().toLowerCase() === nombre);
      $("logo-nombre").setCustomValidity(repetido ? "Ya hay un cliente con ese nombre." : "");
      ok = ok && !!nombre && !repetido;
    }
    $("logo-aceptar").disabled = !ok;
  }

  let pendiente = null;
  $("logo-detalle").addEventListener("input", () => {
    if (!dialogo || !dialogo.fuente) return;
    dialogo.opciones.umbral = umbralDe(Number($("logo-detalle").value));
    clearTimeout(pendiente);
    pendiente = setTimeout(() => convertir(false), 60);
  });
  $("logo-invertir").addEventListener("change", () => {
    if (!dialogo || !dialogo.fuente) return;
    // El umbral automático depende de invertir: vuelve a calcularse.
    dialogo.opciones = { invertir: $("logo-invertir").checked };
    convertir(true);
  });

  // El zoom solo cambia cómo se ve: no hay que convertir el logo de nuevo.
  $("logo-zoom").addEventListener("input", () => {
    if (!dialogo) return;
    dialogo.zoom = Number($("logo-zoom").value) / 100;
    mostrarZoom();
  });
  $("logo-zoom-restablecer").addEventListener("click", () => {
    if (!dialogo) return;
    dialogo.zoom = 1;
    mostrarZoom();
  });

  $("logo-nombre").addEventListener("input", validarDialogo);
  $("logo-archivo").addEventListener("change", () => elegirArchivo($("logo-archivo").files[0]));
  const zona = $("zona");
  zona.addEventListener("dragover", (e) => { e.preventDefault(); zona.classList.add("zona--encima"); });
  zona.addEventListener("dragleave", () => zona.classList.remove("zona--encima"));
  zona.addEventListener("drop", (e) => {
    e.preventDefault();
    zona.classList.remove("zona--encima");
    elegirArchivo(e.dataTransfer.files[0]);
  });
  document.querySelectorAll("[data-cerrar]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
  // El evento llega después: si mientras tanto se abrió otro logo, no hay nada que limpiar.
  $("dialogo-logo").addEventListener("close", () => {
    if ($("dialogo-logo").open) return;
    dialogo = null;
    clearTimeout(pendiente);
    mostrarOriginal(null);
  });

  $("form-logo").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = dialogo;
    if (!d || $("logo-aceptar").disabled) return;
    let cliente = d.cliente;
    if (!cliente) {
      const nombre = $("logo-nombre").value.trim();
      const usados = new Set(estado.original.concat(estado.clientes).map((c) => c.slug));
      cliente = { slug: Cambios.slugPara(nombre, usados), nombre: nombre, home: false };
      estado.clientes.push(cliente);
    }
    const zoom = Math.round(d.zoom * 100) / 100;
    if (zoom === 1) delete cliente.zoom;
    else cliente.zoom = zoom;
    if (d.resultado) {
      const f = d.fuente;
      // El original que hay que guardar: ninguno si es el que ya está en el repo.
      const original = f.tipo === "guardado" ? null
        : f.tipo === "sesion" ? estado.logosNuevos[cliente.slug].original
        : { archivo: f.archivo, extension: extensionDe(f.archivo), sitio: f.sitio };
      estado.logosNuevos[cliente.slug] = { dataUrl: d.resultado.dataUrl, base64: d.resultado.base64, original: original, ajustes: ajustesDe(d.opciones) };
    }
    estado.destacar = cliente.slug;
    $("dialogo-logo").close();
    dibujar();
  });

  $("agregar").addEventListener("click", () => abrirDialogoLogo(null));

  // ---------- Descartar ----------

  let descartarHasta = 0;
  $("descartar").addEventListener("click", () => {
    if (Date.now() > descartarHasta) {
      descartarHasta = Date.now() + 4000;
      $("descartar").textContent = "¿Seguro? Tocá de nuevo para descartar todo";
      setTimeout(() => { $("descartar").textContent = "Descartar cambios"; }, 4000);
      return;
    }
    descartarHasta = 0;
    $("descartar").textContent = "Descartar cambios";
    estado.clientes = estado.original.map((c) => ({ ...c }));
    estado.logosNuevos = {};
    estado.quitados = [];
    estado.confirmando = null;
    dibujar();
  });

  // ---------- Publicar ----------

  const dialogoPublicar = $("dialogo-publicar");

  function accionesPublicar(...botones) {
    $("publicar-acciones").replaceChildren(...botones);
  }

  $("publicar").addEventListener("click", () => {
    const sitios = estado.datos.sitios.map((s) => s.nombre);
    $("publicar-titulo").textContent = "Publicar los cambios";
    const lista = el("ul", { class: "cambios" });
    frases(comparacion()).forEach((f) => lista.append(el("li", {}, f)));
    $("publicar-cuerpo").replaceChildren(
      el("p", {}, estado.datos.rama === "main" ? `Se publican en ${listar(sitios)}:` : `Se guardan en la rama «${estado.datos.rama}» de los dos repos (modo de prueba):`),
      lista,
      el("p", { class: "ayuda" }, estado.datos.rama === "main"
        ? "En unos 2 minutos se ven en los dos sitios. Quedan registrados con tu nombre."
        : "Quedan registrados con tu nombre."),
    );
    accionesPublicar(
      boton("Seguir editando", "boton boton--texto", () => dialogoPublicar.close()),
      boton("Publicar ahora", "boton", publicarAhora),
    );
    dialogoPublicar.showModal();
  });

  // Lo que se manda a publicar: la lista, los logos nuevos con sus originales (solo en staging,
  // para poder ajustarlos después) y los ajustes de todos los logos que tienen original.
  async function armarPedido() {
    const logos = {};
    const originales = {};
    const ajustes = {};
    for (const c of estado.clientes) {
      const nuevo = estado.logosNuevos[c.slug];
      const a = ajustesGuardados(c.slug);
      if (Object.keys(a).length) ajustes[c.slug] = a;
      if (!nuevo) continue;
      logos[c.slug] = nuevo.base64;
      if (nuevo.original) originales[c.slug] = { extension: nuevo.original.extension, base64: await aBase64(nuevo.original.archivo) };
    }
    return {
      version: 2,
      base: estado.datos.base,
      clientes: estado.clientes.map((c) => ({ slug: c.slug, nombre: c.nombre.trim(), home: c.home, zoom: zoomDe(c) })),
      logos: logos,
      originales: originales,
      ajustes: ajustes,
    };
  }

  function aBase64(archivo) {
    return new Promise((ok, mal) => {
      const lector = new FileReader();
      lector.onload = () => ok(String(lector.result).split(",")[1]);
      lector.onerror = () => mal(lector.error);
      lector.readAsDataURL(archivo);
    });
  }

  // Una fila por paso: texto a la izquierda y estado a la derecha.
  function paso(texto) {
    const li = el("li", {});
    const estadoPaso = el("span", {}, "…");
    li.append(el("span", {}, texto), estadoPaso);
    return {
      li: li,
      marcar(textoEstado, clase, url) {
        estadoPaso.replaceChildren(url ? el("a", { href: url, target: "_blank", rel: "noopener" }, textoEstado) : document.createTextNode(textoEstado));
        li.className = clase || "";
      },
    };
  }

  async function publicarAhora() {
    dialogoPublicar.addEventListener("cancel", evitarCerrar);
    $("publicar-titulo").textContent = "Publicando…";
    const guardar = paso("Guardar los cambios");
    const pasos = el("ul", { class: "pasos" });
    pasos.append(guardar.li);
    $("publicar-cuerpo").replaceChildren(pasos);
    accionesPublicar();

    let respuesta;
    try {
      respuesta = await servidor.publicar(await armarPedido());
    } catch (err) {
      dialogoPublicar.removeEventListener("cancel", evitarCerrar);
      const conflicto = mensajeDe(err).startsWith("CONFLICTO");
      guardar.marcar("no se pudo", "paso--fallo");
      $("publicar-titulo").textContent = conflicto ? "Hay cambios más nuevos" : "No se pudo publicar";
      const explicacion = conflicto
        ? "Mientras editabas, otra persona publicó cambios en los clientes. Recargá para ver la lista actual y volvé a hacer tus cambios."
        : mensajeDe(err);
      pasos.after(el("p", { class: "aviso aviso--error" }, explicacion));
      accionesPublicar(conflicto
        ? boton("Recargar", "boton", () => { dialogoPublicar.close(); cargar(); })
        : boton("Volver", "boton", () => dialogoPublicar.close()));
      return;
    }

    estado.datos.base = respuesta.base;
    guardar.marcar("listo", "paso--listo");
    const errorProduccion = respuesta.commits.find((c) => c.error);
    const publicados = respuesta.commits.filter((c) => c.commit);
    const nombreDe = (id) => estado.datos.sitios.find((s) => s.id === id);

    if (estado.datos.rama !== "main" || !publicados.length) {
      $("publicar-titulo").textContent = errorProduccion ? "Se guardó a medias" : "Listo";
      pasos.after(el("p", { class: errorProduccion ? "aviso aviso--error" : "ayuda" },
        errorProduccion ? `No se pudo guardar en ${nombreDe(errorProduccion.sitio).nombre}: ${errorProduccion.error}`
          : !publicados.length ? "No había nada para publicar: los sitios ya estaban así." : `Guardado en la rama «${estado.datos.rama}».`));
      terminar(!errorProduccion);
      return;
    }

    const filas = {};
    publicados.forEach((c) => {
      filas[c.sitio] = paso(`Publicar en ${nombreDe(c.sitio).nombre}`);
      pasos.append(filas[c.sitio].li);
    });
    if (errorProduccion) {
      pasos.after(el("p", { class: "aviso aviso--error" }, `No se pudo guardar en ${nombreDe(errorProduccion.sitio).nombre}: ${errorProduccion.error} Publicá de nuevo para que los dos sitios queden iguales.`));
    }
    const limite = Date.now() + 15 * 60 * 1000;
    let estados = [];
    try {
      while (Date.now() < limite) {
        estados = await servidor.estadoDespliegue(publicados.map((c) => ({ sitio: c.sitio, commit: c.commit })));
        estados.forEach((e) => {
          const texto = { esperando: "en cola", construyendo: "construyendo…", listo: "listo", fallo: "falló" }[e.estado];
          filas[e.sitio].marcar(texto, e.estado === "listo" ? "paso--listo" : e.estado === "fallo" ? "paso--fallo" : "", e.estado === "fallo" ? e.url : null);
        });
        if (estados.every((e) => e.estado === "listo" || e.estado === "fallo")) break;
        await esperar(5000);
      }
    } catch (err) {
      pasos.after(el("p", { class: "aviso aviso--error" }, `No se pudo seguir el estado de la publicación: ${mensajeDe(err)}`));
    }
    const fallo = estados.some((e) => e.estado === "fallo");
    const listo = estados.length && estados.every((e) => e.estado === "listo");
    $("publicar-titulo").textContent = listo && !errorProduccion ? "Publicado" : fallo ? "La publicación falló" : "Publicando…";
    if (listo) {
      const enlaces = el("p", { class: "ayuda" }, "Ya se ve en ");
      publicados.forEach((c, i) => {
        if (i) enlaces.append(document.createTextNode(" y en "));
        enlaces.append(el("a", { href: `${nombreDe(c.sitio).url}/casos/`, target: "_blank", rel: "noopener" }, nombreDe(c.sitio).nombre));
      });
      enlaces.append(document.createTextNode("."));
      pasos.after(enlaces);
    } else if (fallo) {
      pasos.after(el("p", { class: "aviso aviso--error" }, "Los cambios quedaron guardados pero el sitio no se pudo construir. Avisale a quien administra el sitio (el enlace «falló» muestra el detalle)."));
    } else {
      pasos.after(el("p", { class: "ayuda" }, "Se está demorando más de lo normal; los cambios ya están guardados y se van a ver cuando termine."));
    }
    terminar(true);
  }

  function evitarCerrar(e) {
    e.preventDefault();
  }

  // Cierra el diálogo de publicación y vuelve a cargar la lista (ya publicada) desde GitHub.
  function terminar(recargar) {
    dialogoPublicar.removeEventListener("cancel", evitarCerrar);
    accionesPublicar(boton("Cerrar", "boton", () => {
      dialogoPublicar.close();
      if (recargar) cargar();
    }));
  }

  window.addEventListener("beforeunload", (e) => {
    if (estado.datos && Cambios.hayCambios(comparacion())) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  cargar();
})();
