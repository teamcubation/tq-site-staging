const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const Cambios = require("../src/cambios.js");

const lista = [
  { slug: "mercado-libre", nombre: "Mercado Libre", home: true },
  { slug: "visa", nombre: "Visa", home: true },
  { slug: "strix", nombre: "Strix", home: false },
];
const copia = () => lista.map((c) => ({ ...c }));

test("formatear escribe la lista igual que src/data/clientes.json", () => {
  const archivo = readFileSync(join(__dirname, "../../src/data/clientes.json"), "utf8");
  assert.equal(Cambios.formatear(JSON.parse(archivo)), archivo);
});

test("slugPara saca acentos y evita repetidos", () => {
  assert.equal(Cambios.slugPara("Plaza Logística", new Set()), "plaza-logistica");
  assert.equal(Cambios.slugPara("Itaú Unibanco S.A.", new Set()), "itau-unibanco-s-a");
  assert.equal(Cambios.slugPara("Visa", new Set(["visa", "visa-2"])), "visa-3");
  assert.equal(Cambios.slugPara("!!!", new Set()), "cliente");
});

test("validar encuentra nombres vacíos, repetidos y logos faltantes", () => {
  assert.deepEqual(Cambios.validar(lista, () => true), []);
  const mal = copia();
  mal[1].nombre = " mercado libre ";
  mal[2].nombre = "  ";
  assert.deepEqual(Cambios.validar(mal, (slug) => slug !== "visa"), [
    "mercado libre está dos veces.",
    "mercado libre no tiene logo.",
    "El cliente 3 no tiene nombre.",
  ]);
  assert.deepEqual(Cambios.validar([], () => true), ["La lista de clientes está vacía."]);
});

test("comparar detecta cada tipo de cambio", () => {
  const despues = copia();
  despues.splice(2, 1); // quita Strix
  despues.push({ slug: "itau", nombre: "Itaú", home: false });
  despues[0].home = false;
  despues[1].nombre = "Visa Inc.";
  const r = Cambios.comparar(lista, despues, ["mercado-libre", "itau"]);
  assert.deepEqual(r, {
    agregados: ["Itaú"], quitados: ["Strix"], renombrados: [{ de: "Visa", a: "Visa Inc." }],
    logos: ["Mercado Libre"], zoom: [], aLaHome: [], fueraDeLaHome: ["Mercado Libre"], orden: false,
  });
  assert.equal(Cambios.hayCambios(r), true);
});

test("el orden cambia solo si cambia el orden relativo de los que siguen", () => {
  const sinStrix = copia().slice(0, 2);
  assert.equal(Cambios.comparar(lista, sinStrix, []).orden, false);
  const invertida = copia().reverse();
  assert.equal(Cambios.comparar(lista, invertida, []).orden, true);
  assert.equal(Cambios.hayCambios(Cambios.comparar(lista, copia(), [])), false);
});

test("mensaje del commit", () => {
  const despues = copia();
  despues.push({ slug: "itau", nombre: "Itaú", home: true });
  [despues[0], despues[1]] = [despues[1], despues[0]];
  const m = Cambios.mensaje(Cambios.comparar(lista, despues, []), "ana@teamcubation.com");
  assert.equal(m, "Clients: add Itaú; reorder\n\n- Add Itaú.\n- Reorder.\n\nPublished from the client editor by ana@teamcubation.com.\n");
  const muchos = Cambios.comparar(lista, [{ slug: "a", nombre: "Una empresa con nombre largo", home: true }], []);
  const titulo = Cambios.mensaje(muchos, "x@y").split("\n")[0];
  assert.ok(titulo.length <= 72, titulo);
  assert.equal(titulo, "Clients: add 1, remove 3");
  const conPunto = Cambios.comparar(lista, [{ ...lista[0] }, { ...lista[1] }, { ...lista[2], nombre: "Strix S.A." }], []);
  assert.match(Cambios.mensaje(conPunto, "x@y"), /^- Rename Strix to Strix S\.A\.$/m);
});

test("el zoom va en la lista solo si no es 100 %, y se valida", () => {
  const conZoom = copia();
  conZoom[0].zoom = 1.35;
  conZoom[1].zoom = 1;
  assert.equal(Cambios.formatear(conZoom), [
    "[",
    '  { "slug": "mercado-libre", "nombre": "Mercado Libre", "home": true, "zoom": 1.35 },',
    '  { "slug": "visa", "nombre": "Visa", "home": true },',
    '  { "slug": "strix", "nombre": "Strix", "home": false }',
    "]",
    "",
  ].join("\n"));
  assert.deepEqual(Cambios.validar(conZoom, () => true), []);
  const mal = copia();
  mal[0].zoom = 2.5;
  mal[1].zoom = "1.2";
  assert.deepEqual(Cambios.validar(mal, () => true), [
    "Mercado Libre: el zoom tiene que ir de 50 a 200 %.",
    "Visa: el zoom tiene que ir de 50 a 200 %.",
  ]);
});

test("comparar y el mensaje cuentan los cambios de zoom", () => {
  const despues = copia();
  despues[1].zoom = 1.5;
  despues[2].zoom = 1; // igual que sin zoom
  const r = Cambios.comparar(lista, despues, []);
  assert.deepEqual(r.zoom, ["Visa"]);
  assert.equal(Cambios.hayCambios(r), true);
  assert.equal(Cambios.mensaje(r, "x@y").split("\n")[0], "Clients: logo size for Visa");
  const vuelta = Cambios.comparar(despues, copia(), ["strix"]);
  assert.deepEqual(vuelta.zoom, ["Visa"]);
  assert.equal(Cambios.mensaje(vuelta, "x@y").split("\n")[0], "Clients: new logo for Strix; logo size for Visa");
});

test("formatearAjustes: un cliente por línea, en el orden de la lista", () => {
  const ajustes = { strix: { invertir: true }, "mercado-libre": { detalle: 64, invertir: false }, otro: { detalle: 3 } };
  assert.equal(Cambios.formatearAjustes(ajustes, lista), [
    "{",
    '  "mercado-libre": { "detalle": 64, "invertir": false },',
    '  "strix": { "invertir": true }',
    "}",
    "",
  ].join("\n"));
  assert.deepEqual(JSON.parse(Cambios.formatearAjustes(ajustes, lista)), { "mercado-libre": { detalle: 64, invertir: false }, strix: { invertir: true } });
  assert.equal(Cambios.formatearAjustes({}, lista), null);
});
