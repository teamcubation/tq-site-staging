// Convierte un logo cualquiera al estilo de los logos de clientes del sitio: un solo gris
// (#929292) con transparencia, recortado al logo y de 120 px de alto. Trabaja sobre píxeles
// RGBA sin depender de nada: el editor lo usa en el navegador (decodifica y codifica con un
// canvas) y las pruebas en Node (con sharp).
var Logo = (function () {
  var GRIS = 146;
  var ALTO = 120;
  // Por debajo de esta tinta un píxel es fondo o ruido (p. ej. de JPEG), nunca un color del logo.
  var RUIDO = 0.02;
  var BINS = 49;

  // Luminancia (0 a 1) con los pesos de Rec. 709 sobre los valores con gamma.
  function luminancia(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  // Mira un marco de 2 px alrededor de la imagen. Si es mayormente transparente, el logo está
  // sobre transparente; si no, el fondo es el color del borde (la mediana de su luminancia).
  function analizarFondo(px, ancho, alto) {
    var transparentes = 0, lums = [];
    function mirar(x, y) {
      var i = (y * ancho + x) * 4;
      if (px[i + 3] < 16) transparentes++;
      else lums.push(luminancia(px[i], px[i + 1], px[i + 2]));
    }
    var grosor = Math.min(2, ancho, alto);
    for (var g = 0; g < grosor; g++) {
      for (var x = 0; x < ancho; x++) { mirar(x, g); mirar(x, alto - 1 - g); }
      for (var y = grosor; y < alto - grosor; y++) { mirar(g, y); mirar(ancho - 1 - g, y); }
    }
    if (transparentes >= lums.length) return { transparente: true };
    lums.sort(function (a, b) { return a - b; });
    return { transparente: false, luminancia: lums[Math.floor(lums.length / 2)] };
  }

  // "Tinta" de cada píxel, de 0 (fondo) a 1: cuánto se aparta del fondo. Sobre transparente,
  // los colores oscuros son tinta (o los claros, con invertir); sobre un color, la distancia
  // en luminancia a ese color.
  function calcularTinta(px, ancho, alto, fondo, invertir) {
    var n = ancho * alto, tinta = new Float32Array(n);
    var lb = fondo.luminancia, rango = Math.max(lb, 1 - lb);
    for (var p = 0, i = 0; p < n; p++, i += 4) {
      var a = px[i + 3] / 255, l = luminancia(px[i], px[i + 1], px[i + 2]);
      if (fondo.transparente) tinta[p] = a * (invertir ? l : 1 - l);
      else tinta[p] = Math.abs(a * l + (1 - a) * lb - lb) / rango;
    }
    return tinta;
  }

  // Un logo claro sobre transparente (pensado para fondos oscuros) se ve al invertirlo.
  function sugerirInvertir(px, fondo) {
    if (!fondo.transparente) return false;
    var suma = 0, cuenta = 0;
    for (var i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 128) { suma += luminancia(px[i], px[i + 1], px[i + 2]); cuenta++; }
    }
    return cuenta > 0 && suma / cuenta > 0.75;
  }

  // Los "colores planos" del logo: niveles de tinta donde se juntan muchos píxeles (el interior
  // de cada color; los bordes suavizados quedan repartidos en muchos niveles).
  function nivelesPlanos(tinta) {
    var hist = new Array(BINS).fill(0), ancho = (1 - RUIDO) / BINS;
    for (var p = 0; p < tinta.length; p++) {
      if (tinta[p] > RUIDO) hist[Math.min(BINS - 1, Math.floor((tinta[p] - RUIDO) / ancho))]++;
    }
    var pico = Math.max.apply(null, hist), niveles = [];
    if (pico === 0) return niveles;
    for (var b = 0; b < BINS; b++) {
      if (hist[b] >= pico * 0.15) niveles.push(RUIDO + (b + 0.5) * ancho);
    }
    return niveles;
  }

  // Calcula la máscara de opacidad (0 a 1) del logo. Lo que tiene menos tinta que el umbral
  // queda transparente; desde el color plano más claro del logo hacia arriba, opaco; en el medio
  // (bordes suavizados), proporcional. Así un logo de varios colores queda gris parejo.
  function mascara(px, ancho, alto, opciones) {
    opciones = opciones || {};
    var fondo = analizarFondo(px, ancho, alto);
    var invertir = opciones.invertir == null ? sugerirInvertir(px, fondo) : !!opciones.invertir;
    var tinta = calcularTinta(px, ancho, alto, fondo, invertir);
    var niveles = nivelesPlanos(tinta);
    var masAlto = niveles.length ? niveles[niveles.length - 1] : 1;
    // El amarillo puro tiene muy poca tinta: con el umbral por defecto queda transparente, como
    // en los logos hechos a mano, salvo que sea el único color del logo.
    var umbral = opciones.umbral == null ? Math.min(0.15, 0.6 * masAlto) : opciones.umbral;
    var planos = niveles.filter(function (l) { return l > umbral; });
    var lleno = Math.max(umbral + 0.08, 0.9 * (planos.length ? planos[0] : masAlto));
    var alfa = new Float32Array(tinta.length);
    for (var p = 0; p < tinta.length; p++) {
      alfa[p] = Math.min(1, Math.max(0, (tinta[p] - umbral) / (lleno - umbral)));
    }
    return { alfa: alfa, fondoTransparente: fondo.transparente, invertir: invertir, umbral: umbral };
  }

  // Rectángulo que contiene el logo (opacidad visible), o null si no hay nada.
  function recorte(alfa, ancho, alto) {
    var x0 = ancho, y0 = alto, x1 = -1, y1 = -1;
    for (var y = 0; y < alto; y++) {
      for (var x = 0; x < ancho; x++) {
        if (alfa[y * ancho + x] >= 0.02) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    return x1 < 0 ? null : { x: x0, y: y0, ancho: x1 - x0 + 1, alto: y1 - y0 + 1 };
  }

  // Reescala n valores de src (desde si, cada sp) a m valores de dst (desde di, cada dp):
  // promedia áreas al achicar e interpola linealmente al agrandar.
  function reescalarEje(src, si, sp, n, dst, di, dp, m) {
    var j, k;
    if (m < n) {
      var paso = n / m;
      for (j = 0; j < m; j++) {
        var a = j * paso, b = a + paso, suma = 0, fin = Math.min(n, Math.ceil(b));
        for (k = Math.floor(a); k < fin; k++) suma += src[si + k * sp] * (Math.min(b, k + 1) - Math.max(a, k));
        dst[di + j * dp] = suma / paso;
      }
    } else {
      for (j = 0; j < m; j++) {
        var pos = (j + 0.5) * n / m - 0.5;
        var k0 = Math.max(0, Math.floor(pos)), k1 = Math.min(n - 1, k0 + 1);
        var f = Math.min(1, Math.max(0, pos - k0));
        dst[di + j * dp] = src[si + k0 * sp] * (1 - f) + src[si + k1 * sp] * f;
      }
    }
  }

  // Reescala un canal (ancho × alto) a nAncho × nAlto, primero en horizontal y después en vertical.
  function reescalar(datos, ancho, alto, nAncho, nAlto) {
    var medio = new Float32Array(nAncho * alto), fin = new Float32Array(nAncho * nAlto);
    for (var y = 0; y < alto; y++) reescalarEje(datos, y * ancho, 1, ancho, medio, y * nAncho, 1, nAncho);
    for (var x = 0; x < nAncho; x++) reescalarEje(medio, x, nAncho, alto, fin, x, nAncho, nAlto);
    return fin;
  }

  // Todo el proceso: de los píxeles RGBA de cualquier logo a los del logo listo para el sitio.
  // Devuelve { rgba, ancho, alto, altoOriginal, fondoTransparente, invertir, umbral } o
  // { error } si no quedó nada visible.
  function procesar(px, ancho, alto, opciones) {
    var m = mascara(px, ancho, alto, opciones);
    var r = recorte(m.alfa, ancho, alto);
    if (!r) return { error: "No quedó nada visible del logo.", invertir: m.invertir, umbral: m.umbral, fondoTransparente: m.fondoTransparente };
    var recortado = new Float32Array(r.ancho * r.alto);
    for (var y = 0; y < r.alto; y++) {
      recortado.set(m.alfa.subarray((r.y + y) * ancho + r.x, (r.y + y) * ancho + r.x + r.ancho), y * r.ancho);
    }
    var nAncho = Math.max(1, Math.round(r.ancho * ALTO / r.alto));
    var alfa = reescalar(recortado, r.ancho, r.alto, nAncho, ALTO);
    var rgba = new Uint8ClampedArray(nAncho * ALTO * 4);
    for (var p = 0, i = 0; p < alfa.length; p++, i += 4) {
      rgba[i] = rgba[i + 1] = rgba[i + 2] = GRIS;
      rgba[i + 3] = Math.round(alfa[p] * 255);
    }
    return {
      rgba: rgba, ancho: nAncho, alto: ALTO, altoOriginal: r.alto,
      fondoTransparente: m.fondoTransparente, invertir: m.invertir, umbral: m.umbral,
    };
  }

  return { GRIS: GRIS, ALTO: ALTO, procesar: procesar, mascara: mascara, reescalar: reescalar };
})();

if (typeof module !== "undefined") module.exports = Logo;
