# StudyTrack

StudyTrack convierte materiales y parciales anteriores en un camino de estudio
personalizado. La aplicación combina onboarding guiado, generación de contenido
con IA, práctica, progreso, simulacros y acceso Premium por examen.

## Stack

- Next.js 16 (App Router) y React 19
- TypeScript y Tailwind CSS 4
- Supabase Auth, Postgres, Storage y RLS
- OpenAI para el pipeline de análisis y generación
- Mercado Pago para checkout y webhooks
- PostHog para analítica de producto
- Playwright para smoke tests E2E

## Desarrollo local

Requisitos: Node.js 20 o superior, npm y un proyecto Supabase.

```bash
npm install
cp .env.example .env.local
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).
En Windows PowerShell, copiá el archivo con:

```powershell
Copy-Item .env.example .env.local
```

Completá como mínimo las credenciales públicas y `service_role` de Supabase.
`OPENAI_API_KEY` es necesaria para generar planes; Mercado Pago y PostHog pueden
dejarse vacíos durante trabajo puramente visual.

## Base de datos

Las migraciones viven en `supabase/migrations`. Aplicarlas es obligatorio antes
de desplegar una versión que dependa de cambios de esquema:

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

La migración `20260716193000_add_three_exam_access_slots.sql` implementa los tres
cupos reales del pack “3 exámenes” y debe estar aplicada antes de desplegar el
código que lo consume.

## Comandos de calidad

```bash
npm run lint
npm run test:fixes
npm run build
npm run test:e2e
```

El smoke público corre sin credenciales. Para habilitar el recorrido autenticado,
configurá `STUDYTRACK_QA_EMAIL`, `STUDYTRACK_QA_PASSWORD` y
`STUDYTRACK_QA_EXAM_ID`. `STUDYTRACK_QA_CHECKOUT=1` habilita además la creación
de una preferencia real de checkout, por lo que debe usarse de forma deliberada.

## Integraciones de producción

- Configurá `NEXT_PUBLIC_APP_URL` con el dominio canónico HTTPS.
- Agregá `/auth/callback` a los redirect URLs permitidos de Supabase Auth.
- Configurá la URL de webhook de Mercado Pago en `/api/webhooks/mercadopago` y
  definí `MERCADOPAGO_WEBHOOK_SECRET`.
- Conservá `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` y los secretos de pago
  únicamente del lado servidor.

## Flujo de deploy recomendado

1. Ejecutar lint, regresiones, build y E2E público.
2. Aplicar migraciones de Supabase.
3. Desplegar la aplicación con las variables de entorno de producción.
4. Verificar registro/confirmación, generación de un examen y webhook de pago.
5. Ejecutar el smoke autenticado contra la URL desplegada.
