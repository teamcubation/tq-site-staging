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
  const urlLogo = (slug) => (estado.logosNuevos[slug] ? estado.logosNuevos[slug].dataUrl : `${estado.datos.urlLogos}${slug}.png`);

  function mostrarError(caja, titulo, err) {
    caja.replaceChildren(el("strong", {}, titulo), document.createTextNode(` ${mensajeDe(err)}`));
    caja.hidden = false;
  }

  // Tamaño del logo en la tira de la home (mismo cálculo que TiraLogos.astro).
  function medirParaTira(img) {
    const ajustar = () => {
      const proporcion = img.naturalWidth / img.naturalHeight;
      const alto = Math.min(44, Math.sqrt(SUPERFICIE / proporcion), 150 / proporcion);
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
    const marca = esNuevo(c.slug) ? "Nuevo" : estado.logosNuevos[c.slug] ? "Logo nuevo" : "";
    if (marca) li.append(el("span", { class: "tarjeta__marca" }, marca));
    const card = el("div", { class: "logo-card", title: "Arrastrá para cambiar el orden" });
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
      medirParaTira(img);
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
    if (r.logos.length) f.push(`Logo nuevo: ${listar(r.logos)}`);
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

  // ---------- Agregar o cambiar un logo ----------

  let dialogo = null; // { cliente, lectura, resultado, opciones }
  let urlOriginal = null;

  // Detalle (0 a 100) ↔ umbral de Logo.procesar: más detalle es un umbral más bajo.
  const umbralDe = (detalle) => 0.6 - (0.58 * detalle) / 100;
  const detalleDe = (umbral) => Math.round(((0.6 - umbral) / 0.58) * 100);

  function abrirDialogoLogo(cliente) {
    dialogo = { cliente: cliente, lectura: null, resultado: null, opciones: {} };
    $("logo-titulo").textContent = cliente ? `Cambiar el logo de ${cliente.nombre}` : "Agregar cliente";
    $("campo-nombre").hidden = !!cliente;
    $("logo-nombre").value = "";
    $("logo-archivo").value = "";
    $("zona-texto").textContent = "Soltá el archivo acá o elegilo (PNG, JPG, SVG o WebP). Mejor si es grande o SVG.";
    $("vista").hidden = true;
    $("logo-error").hidden = true;
    $("logo-aceptar").textContent = cliente ? "Usar este logo" : "Agregar";
    validarDialogo();
    $("dialogo-logo").showModal();
    (cliente ? $("zona") : $("logo-nombre")).focus();
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
    if (!archivo || !dialogo) return;
    $("logo-error").hidden = true;
    if (archivo.size > 10 * 1024 * 1024) {
      mostrarError($("logo-error"), "El archivo es muy grande.", "Usá uno de menos de 10 MB.");
      return;
    }
    $("zona-texto").textContent = `Procesando ${archivo.name}…`;
    try {
      dialogo.lectura = await leerImagen(archivo);
    } catch (err) {
      $("zona-texto").textContent = "Soltá el archivo acá o elegilo (PNG, JPG, SVG o WebP).";
      mostrarError($("logo-error"), "No se pudo leer la imagen.", "Probá con otro archivo (PNG, JPG, SVG o WebP).");
      return;
    }
    $("zona-texto").textContent = `${archivo.name} · elegir otro archivo`;
    if (urlOriginal) URL.revokeObjectURL(urlOriginal);
    urlOriginal = URL.createObjectURL(archivo);
    $("vista-original").src = urlOriginal;
    dialogo.opciones = {};
    procesarLogo(true);
  }

  function procesarLogo(inicial) {
    const { px, ancho, alto } = dialogo.lectura;
    const r = Logo.procesar(px, ancho, alto, dialogo.opciones);
    if (inicial) {
      $("logo-detalle").value = detalleDe(r.umbral);
      $("logo-invertir").checked = r.invertir;
      $("ajuste-invertir").hidden = !r.fondoTransparente;
    }
    $("vista").hidden = false;
    $("logo-aviso").hidden = true;
    if (r.error) {
      dialogo.resultado = null;
      $("vista-tarjeta").removeAttribute("src");
      $("vista-home").removeAttribute("src");
      $("logo-aviso").textContent = r.fondoTransparente
        ? "No quedó nada visible: subí el detalle o probá «Invertir»."
        : "No quedó nada visible: subí el detalle.";
      $("logo-aviso").hidden = false;
    } else {
      const dataUrl = aPng(r);
      dialogo.resultado = { dataUrl: dataUrl, base64: dataUrl.split(",")[1] };
      $("vista-tarjeta").src = dataUrl;
      $("vista-home").src = dataUrl;
      medirParaTira($("vista-home"));
      if (r.altoOriginal < 60) {
        $("logo-aviso").textContent = `El logo es chico (${r.altoOriginal} px de alto) y se va a ver algo borroso. Si conseguís uno más grande o en SVG, mejor.`;
        $("logo-aviso").hidden = false;
      }
    }
    validarDialogo();
  }

  function validarDialogo() {
    let ok = !!(dialogo && dialogo.resultado);
    if (dialogo && !dialogo.cliente) {
      const nombre = $("logo-nombre").value.trim().toLowerCase();
      const repetido = estado.clientes.some((c) => c.nombre.trim().toLowerCase() === nombre);
      $("logo-nombre").setCustomValidity(repetido ? "Ya hay un cliente con ese nombre." : "");
      ok = ok && !!nombre && !repetido;
    }
    $("logo-aceptar").disabled = !ok;
  }

  let pendiente = null;
  $("logo-detalle").addEventListener("input", () => {
    if (!dialogo || !dialogo.lectura) return;
    dialogo.opciones.umbral = umbralDe(Number($("logo-detalle").value));
    clearTimeout(pendiente);
    pendiente = setTimeout(() => procesarLogo(false), 60);
  });
  $("logo-invertir").addEventListener("change", () => {
    if (!dialogo || !dialogo.lectura) return;
    dialogo.opciones = { invertir: $("logo-invertir").checked };
    procesarLogo(true);
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

  $("form-logo").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("logo-aceptar").disabled) return;
    if (dialogo.cliente) {
      estado.logosNuevos[dialogo.cliente.slug] = dialogo.resultado;
      estado.destacar = dialogo.cliente.slug;
    } else {
      const nombre = $("logo-nombre").value.trim();
      const usados = new Set(estado.original.concat(estado.clientes).map((c) => c.slug));
      const slug = Cambios.slugPara(nombre, usados);
      estado.clientes.push({ slug: slug, nombre: nombre, home: false });
      estado.logosNuevos[slug] = dialogo.resultado;
      estado.destacar = slug;
    }
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

    const logos = {};
    estado.clientes.forEach((c) => { if (estado.logosNuevos[c.slug]) logos[c.slug] = estado.logosNuevos[c.slug].base64; });
    const pedido = {
      base: estado.datos.base,
      clientes: estado.clientes.map((c) => ({ slug: c.slug, nombre: c.nombre.trim(), home: c.home })),
      logos: logos,
    };
    let respuesta;
    try {
      respuesta = await servidor.publicar(pedido);
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
