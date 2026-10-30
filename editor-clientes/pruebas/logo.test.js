const { test } = require("node:test");
const assert = require("node:assert/strict");
const Logo = require("../src/logo.js");

// Imagen de prueba: fondo de un color con un rectángulo de otro (ancho × alto, RGBA).
function imagen(ancho, alto, fondo, tinta, rect) {
  const px = new Uint8ClampedArray(ancho * alto * 4);
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const dentro = x >= rect.x && x < rect.x + rect.ancho && y >= rect.y && y < rect.y + rect.alto;
      px.set(dentro ? tinta : fondo, (y * ancho + x) * 4);
    }
  }
  return px;
}

const BLANCO = [255, 255, 255, 255];
const TRANSPARENTE = [0, 0, 0, 0];

test("un logo oscuro sobre blanco queda gris, recortado y de 120 px de alto", () => {
  const px = imagen(400, 300, BLANCO, [20, 20, 120, 255], { x: 50, y: 100, ancho: 300, alto: 60 });
  const r = Logo.procesar(px, 400, 300);
  assert.equal(r.fondoTransparente, false);
  assert.equal(r.alto, 120);
  assert.equal(r.ancho, 600); // 300 × 60 recortado y llevado a 120 de alto
  assert.equal(r.altoOriginal, 60);
  for (let i = 0; i < r.rgba.length; i += 4) {
    assert.deepEqual([r.rgba[i], r.rgba[i + 1], r.rgba[i + 2]], [146, 146, 146]);
    assert.equal(r.rgba[i + 3], 255);
  }
});

test("un logo blanco sobre transparente se invierte solo", () => {
  const px = imagen(200, 100, TRANSPARENTE, [255, 255, 255, 255], { x: 20, y: 30, ancho: 100, alto: 40 });
  const r = Logo.procesar(px, 200, 100);
  assert.equal(r.fondoTransparente, true);
  assert.equal(r.invertir, true);
  assert.equal(r.ancho, 300);
  const sinInvertir = Logo.procesar(px, 200, 100, { invertir: false });
  assert.ok(sinInvertir.error);
});

test("un logo de varios colores queda gris parejo", () => {
  // Mitad cian y mitad verde claro (como Genneia): los dos tienen que quedar opacos.
  const px = imagen(200, 100, BLANCO, [27, 169, 225, 255], { x: 10, y: 10, ancho: 90, alto: 80 });
  const verde = imagen(200, 100, BLANCO, [141, 198, 63, 255], { x: 100, y: 10, ancho: 90, alto: 80 });
  for (let i = 0; i < px.length; i += 4) if (((i / 4) % 200) >= 100) px.set(verde.subarray(i, i + 4), i);
  const r = Logo.procesar(px, 200, 100);
  const alfas = new Set();
  for (let i = 3; i < r.rgba.length; i += 4) alfas.add(r.rgba[i]);
  assert.deepEqual([...alfas], [255]);
});

test("el amarillo claro queda transparente salvo que sea el único color", () => {
  const px = imagen(300, 100, BLANCO, [255, 230, 0, 255], { x: 0, y: 0, ancho: 300, alto: 100 });
  // Un borde azul oscuro alrededor de un relleno amarillo (como Mercado Libre).
  const conBorde = imagen(300, 100, BLANCO, [45, 50, 119, 255], { x: 10, y: 10, ancho: 280, alto: 80 });
  const relleno = imagen(300, 100, BLANCO, [255, 230, 0, 255], { x: 20, y: 20, ancho: 260, alto: 60 });
  for (let y = 20; y < 80; y++) for (let x = 20; x < 280; x++) conBorde.set(relleno.subarray((y * 300 + x) * 4, (y * 300 + x) * 4 + 4), (y * 300 + x) * 4);
  const r = Logo.procesar(conBorde, 300, 100);
  const centro = ((r.alto / 2) * r.ancho + r.ancho / 2) * 4 + 3;
  assert.equal(r.rgba[centro], 0);
  // Sin borde, el amarillo es el logo: tiene que verse.
  const soloAmarillo = imagen(300, 100, BLANCO, [255, 230, 0, 255], { x: 50, y: 25, ancho: 200, alto: 50 });
  assert.ok(!Logo.procesar(soloAmarillo, 300, 100).error);
  assert.ok(px);
});

const alfa = (r, x, y) => r.rgba[(y * r.ancho + x) * 4 + 3];

test("con menos zoom el logo queda más chico, centrado y con margen transparente", () => {
  const px = imagen(400, 300, BLANCO, [20, 20, 120, 255], { x: 50, y: 100, ancho: 300, alto: 60 });
  const r = Logo.procesar(px, 400, 300, { zoom: 0.5, centro: { x: 0, y: 0 } }); // al achicar, centro no cuenta
  assert.equal(r.ancho, 600); // el cuadro es el mismo que con zoom 1
  assert.equal(r.alto, 120);
  // El logo, de 300 × 60, en el medio; el resto, transparente.
  for (let y = 0; y < r.alto; y++) {
    for (let x = 0; x < r.ancho; x++) {
      assert.equal(alfa(r, x, y), x >= 150 && x < 450 && y >= 30 && y < 90 ? 255 : 0);
    }
  }
  const sinZoom = Logo.procesar(px, 400, 300);
  assert.deepEqual(Logo.procesar(px, 400, 300, { zoom: 1, centro: { x: 0, y: 1 } }).rgba, sinZoom.rgba);
});

test("con más zoom el logo se agranda y el centro elige qué parte queda", () => {
  // Un rectángulo de 200 × 100 con un hueco arriba a la izquierda (x de 10 a 50, y de 10 a 30).
  const px = imagen(400, 200, BLANCO, [0, 0, 0, 255], { x: 100, y: 50, ancho: 200, alto: 100 });
  for (let y = 60; y < 80; y++) for (let x = 110; x < 150; x++) px.set(BLANCO, (y * 400 + x) * 4);
  const arriba = Logo.procesar(px, 400, 200, { zoom: 2, centro: { x: 0, y: 0 } });
  assert.equal(arriba.ancho, 240);
  // Se ve el cuarto de arriba a la izquierda, 2,4 veces más grande: el hueco va de x 24 a 120.
  assert.equal(alfa(arriba, 60, 48), 0);
  assert.equal(alfa(arriba, 5, 5), 255);
  assert.equal(alfa(arriba, 200, 100), 255);
  // El cuarto de abajo a la derecha no tiene hueco.
  const abajo = Logo.procesar(px, 400, 200, { zoom: 2, centro: { x: 1, y: 1 } });
  for (let i = 3; i < abajo.rgba.length; i += 4) assert.equal(abajo.rgba[i], 255);
});

test("nada visible devuelve un error", () => {
  const px = imagen(50, 50, BLANCO, BLANCO, { x: 0, y: 0, ancho: 0, alto: 0 });
  assert.ok(Logo.procesar(px, 50, 50).error);
});

test("reescalar conserva el promedio al achicar", () => {
  const datos = new Float32Array([0, 1, 0, 1, 0, 1, 0, 1]);
  const r = Logo.reescalar(datos, 8, 1, 2, 1);
  assert.deepEqual([...r], [0.5, 0.5]);
});
