# StudyTrack — videos de lanzamiento (Remotion)

Subproyecto independiente (tiene su propio `package.json` y `node_modules`;
está excluido del `tsconfig.json` y del ESLint de la app Next).

## Composiciones

| ID          | Formato   | Duración | Contenido                                                                 |
| ----------- | --------- | -------- | ------------------------------------------------------------------------- |
| `Teaser916` | 1080×1920 | 20 s     | Hook → upload de apuntes → track vertical animado → readiness → CTA       |
| `Demo169`   | 1920×1080 | 40 s     | Problema → upload de materiales → track → readiness → paywall/planes → CTA |

## Uso

Instalar dependencias una vez: `npm install` (dentro de `remotion/`).

Desde la **raíz** del repo:

```bash
npm run remotion:render:teaser   # → remotion/out/studytrack-teaser-9x16.mp4
npm run remotion:render:demo     # → remotion/out/studytrack-demo-16x9.mp4
npm run remotion:render          # ambos, SECUENCIAL (no paralelizar en Windows)
npm run remotion:bundle          # solo bundle, sin render
```

Desde `remotion/`: `npm run studio` abre el editor visual de Remotion.

## Notas

- Paleta y tipografía de StudyTrack (Plus Jakarta Sans + Inter vía
  `@remotion/google-fonts`). Sin mascotas, logos ni assets de terceros.
- En Windows **no** renderizar las dos composiciones en paralelo
  (CPU thrashing); los scripts ya encadenan los renders con `&&`.
- `out/` está ignorado en git.
