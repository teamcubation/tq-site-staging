# Editor de clientes

Web app de Google Apps Script con la que el equipo edita los clientes del sitio sin tocar código:
agregar (con logo), quitar, renombrar, cambiar el logo, ordenar y elegir cuáles van en la tira de
la home. La pueden abrir las cuentas de teamcubation.com que estén en el grupo
**web@teamcubation.com** (y quien es dueño del script).

**Dirección:** https://script.google.com/a/macros/teamcubation.com/s/AKfycbzcMfCOljOoWa2YHijDv4-SGYDN0AwS6X5kYWBdNYmthuFadZ_JBy_gyGAz8ayOICLP/exec

## Cómo funciona

- La lista vive en `src/data/clientes.json` (un cliente por línea: `slug`, `nombre`, `home`) y cada
  logo en `src/assets/clientes/<slug>.png`. La usan la página de Clientes (todos), la tira de la
  home (los de `home: true`, en el mismo orden) y `llms.txt`. El build falla si un cliente no tiene
  logo o está repetido (`src/data/clientes.ts`).
- El editor lee la lista del repo de staging y, al publicar, hace **un commit en staging y otro en
  producción** (`teamcubation/teamcubation.github.io`) para que los dos queden iguales; si a
  producción le falta un logo, lo copia de staging. El commit lleva como autor a quien publicó.
- Cada push a `main` dispara `.github/workflows/deploy.yml`: build, GitHub Pages y limpieza de la
  caché de CloudFront. El editor sigue esas ejecuciones y avisa cuando ya se ve (unos 2 minutos).
- Si mientras alguien edita otra persona publica cambios en los clientes, el editor no pisa nada:
  pide recargar. Los commits de código en el medio no molestan.
- Los logos se convierten en el navegador (`src/logo.js`) al estilo de los demás: un solo gris
  (#929292) con transparencia, recortados y de 120 px de alto. El servidor rechaza cualquier PNG
  que no tenga 120 px de alto.
- Al quitar un cliente que aparece nombrado en los textos del sitio (`src/content/`), avisa: ese
  texto no cambia solo.

Si hace falta, la lista también se puede editar a mano en `src/data/clientes.json`, con el logo
en `src/assets/clientes/` (mismo formato).

## Archivos

| | |
|---|---|
| `src/Codigo.js` | Servidor: acceso, `cargar`, `publicar`, `estadoDespliegue` y la configuración de la GitHub App. |
| `src/github.js` | Cliente mínimo de la API de GitHub (sincrónico, como Apps Script). |
| `src/cambios.js` | Validar y comparar listas, el formato del JSON y el mensaje del commit (navegador y servidor). |
| `src/logo.js` | Conversión de logos (navegador y pruebas). |
| `src/editor.html`, `estilos.css`, `editor.js` | La página; `construir.mjs` la arma en un solo HTML en `dist/`. |
| `src/aviso.html`, `configuracion.html` | Páginas de "sin acceso" y de configuración. |
| `local/servidor.mjs` | Corre el editor en local contra GitHub, sin Apps Script. |
| `pruebas/` | Pruebas de `cambios.js` y `logo.js` (`npm run probar`). |

## Desarrollo

```sh
cd editor-clientes
npm run probar        # pruebas
npm run local         # http://localhost:8790, publica con tu token de gh
```

`npm run local` ejecuta el mismo `Codigo.js` en Node con reemplazos de los servicios de Apps
Script y publica **de verdad** en GitHub, en la rama `prueba-editor-clientes` de los dos repos
(créala desde `main` antes; `RAMA=otra` para usar otra). Esa rama no dispara deploys.

## Subir cambios a Apps Script

El proyecto de Apps Script ("Editor de clientes del sitio", en el Drive de su dueño) está en
`.clasp.json`, y el ID de la implementación de la web app, en el script `publicar` de
`package.json`: al publicar se actualiza esa misma implementación, así que la dirección no cambia.
Hace falta haber hecho una vez
`npx -y @google/clasp@3 login` con la cuenta dueña y tener activada la "Google Apps Script API" en
https://script.google.com/home/usersettings.

```sh
cd editor-clientes
npm run subir         # construye dist/ y lo sube (clasp push)
npm run publicar      # además actualiza la web app a esa versión
```

## Configuración (una sola vez)

Con la cuenta dueña, abrir la web app agregando `?configurar` al final de la dirección:

1. **Crear la GitHub App**: GitHub la crea en la organización `teamcubation` con permiso para
   escribir contenido y leer las ejecuciones de Actions, y le devuelve la clave al script, que la
   guarda en sus propiedades (no pasa por ningún otro lado).
2. **Instalarla** solo en `teamcubation/tq-site-staging` y `teamcubation/teamcubation.github.io`.

Propiedades del script (Configuración del proyecto → Propiedades de la secuencia de comandos):

| | |
|---|---|
| `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_SLUG`, `GITHUB_APP_CLAVE`, `GITHUB_INSTALACION` | Las guarda la configuración. |
| `RAMA` | Opcional: publica en esa rama en lugar de `main` (para probar; el editor lo avisa arriba). |
| `GITHUB_TOKEN` | Opcional: un token que reemplaza a la App (p. ej. para probar). |

Para cambiar la clave, crear otra App desde `?configurar` (reemplaza a la anterior), instalarla y
después borrar la vieja en GitHub (Settings → Developer settings → GitHub Apps de la organización).
