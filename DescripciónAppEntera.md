# MASTER PROMPT — StudyTrack

Quiero construir una aplicación web production-ready llamada **StudyTrack**.

> **IMPORTANTE — Leer antes de escribir una sola línea de código:**
>
> 1. Leé completa la sección **41. Lecciones aprendidas y errores conocidos**. Este prompt ya se usó una vez para construir la app y ahí están documentados todos los errores que se cometieron. No repetirlos.
> 2. Usá las skills de diseño **impeccable design** y **taste skill** para toda la UI.
> 3. El **track/camino vertical** es la parte de diseño más importante de la aplicación: tiene que estar siempre perfecto y **nunca puede verse roto** (ver secciones 5.1, 6.6 y 41).
> 4. Para OpenAI, usar un modelo **barato y rápido** (familia mini), NO el más nuevo/caro (ver sección 4.1).

La aplicación es un entrenador de estudio para estudiantes que tienen que rendir un examen. El usuario sube sus apuntes, PDFs, resúmenes, fotos o materiales de estudio; indica qué materia va a rendir, cuándo rinde, qué nota quiere sacarse, cuánto tiempo puede estudiar por día, qué días no puede estudiar, qué tipo de examen va a tener y, opcionalmente, sube exámenes anteriores/parciales/finales viejos de esa misma materia.

Con toda esa información, la app debe crear automáticamente un camino de aprendizaje diario, estilo “learning path gamificado”, con unidades, lecciones cortas, ejercicios textuales, quizzes, retos diarios, repasos, tests de unidad, simulacros y una métrica de preparación del 0 al 100%.

El objetivo del producto es que el usuario pase de tener apuntes desordenados a tener un camino claro para aprobar el examen.

La frase principal del producto es:

**“Duolingo para aprobar tus exámenes.”**

Pero la app NO debe usar mascotas, logos, personajes ni assets de Duolingo. Tampoco debe mencionar Duolingo dentro de la interfaz. La inspiración es la mecánica: camino vertical, unidades desbloqueables, lecciones cortas, feedback inmediato, progreso, streak, gamificación y visual mobile-first muy pulido. El diseño debe ser propio de StudyTrack, pero con el mismo nivel de claridad, simplicidad, redondez, color, ritmo visual y adicción de una app educativa gamificada de primer nivel.

---

# 1. Objetivo central del producto

El producto debe resolver este problema:

> “Tengo que rendir una materia, tengo muchos apuntes y no sé exactamente qué estudiar cada día para llegar bien.”

La app debe hacer que el usuario sienta:

1. Que tiene un camino claro.
2. Que sabe qué estudiar hoy.
3. Que sabe cuánto le falta.
4. Que está practicando de una forma parecida al examen real.
5. Que su progreso es medible.
6. Que puede llegar a su nota objetivo si sigue el plan.
7. Que no está simplemente leyendo PDFs, sino entrenando activamente.

La aplicación no es un simple chat con PDFs.  
La aplicación no es solo un generador de flashcards.  
La aplicación no es solo un calendario de estudio.

La aplicación es un **coach de preparación para exámenes**, con una experiencia gamificada, estructurada y accionable.

---

# 2. Nombre del producto

Nombre principal:

**StudyTrack**

Subtítulo:

**Tu camino personalizado para aprobar exámenes.**

Claims posibles para landing:

- “Subí tus apuntes. Poné la fecha del examen. Recibí tu camino para aprobar.”
- “De apuntes desordenados a un plan diario de estudio.”
- “Practicá como probablemente te van a tomar.”
- “Sabé qué estudiar hoy, qué repasar mañana y qué tan preparado estás.”
- “El track de estudio personalizado para llegar a tu nota objetivo.”
- “Prepará parciales, finales y globales con un camino guiado desde tus propios materiales.”

---

# 3. Usuario objetivo

El usuario principal es un estudiante que está por rendir un examen.

Tipos de usuario:

1. Estudiante universitario.
2. Estudiante secundario.
3. Estudiante de tecnicatura.
4. Estudiante de curso/certificación.
5. Persona preparando un final, parcial, recuperatorio o examen global.

Casos de uso principales:

- Tiene un parcial en 7 días.
- Tiene un final en 14 días.
- Tiene un global y no sabe cómo organizar todos los temas.
- Tiene apuntes largos y desordenados.
- Tiene PDFs de cátedra.
- Tiene resúmenes propios.
- Tiene fotos de carpeta.
- Tiene exámenes anteriores y quiere practicar de forma parecida.
- Quiere saber si está llegando.
- Quiere una nota específica, no solo aprobar.

---

# 4. Stack técnico obligatorio

Construir con:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- OpenAI API server-side.
- PostHog para analytics.
- Mercado Pago Checkout Pro.
- Vercel deploy.
- Server Actions/API routes para acciones backend.
- Estructura lista para producción.

La app debe estar preparada para deploy en Vercel.

La API key de OpenAI nunca debe exponerse al cliente.

Los uploads deben guardarse en Supabase Storage.

La metadata, progreso, ejercicios, temas, unidades, pagos y scores deben persistirse en Supabase Postgres.

## 4.1 Elección del modelo de OpenAI

**Regla obligatoria: NO usar el modelo más nuevo/potente de OpenAI.**

- Usar un modelo **barato y rápido**, de la familia "mini" (por ejemplo `gpt-4o-mini`, `gpt-5-mini` o el equivalente mini más reciente disponible).
- Antes de hardcodear el modelo, verificar contra `/v1/models` cuál es el mini disponible en la cuenta.
- Motivos:
  - El pipeline genera muchas llamadas (topic map, análisis de exámenes anteriores, ~13+ lecciones × 2 llamadas cada una). Con un modelo caro el costo se dispara.
  - Los modelos mini son suficientes para generar lecciones, ejercicios y quizzes con JSON estructurado.
  - La velocidad importa: el onboarding ya tarda 5–8 minutos con un mini; con un modelo grande sería inaceptable.
- Configurar el nombre del modelo como variable de entorno (`OPENAI_MODEL`) para poder cambiarlo sin tocar código.

---

# 5. Principios de producto

## 5.1 El track es el producto

La pantalla principal no debe ser un dashboard genérico de tarjetas.

La pantalla principal debe ser un camino vertical gamificado, mobile-first, con nodos circulares, unidades, líneas de progreso, lecciones desbloqueadas y bloqueadas, retos diarios, tests de unidad, repasos y simulacros.

El usuario tiene que abrir la app y entender instantáneamente:

- Dónde está.
- Qué le toca hacer ahora.
- Qué tiene bloqueado.
- Cuánto falta para el examen.
- Qué tan preparado está.
- Qué parte es gratis.
- Qué parte requiere pagar.

**El track es la parte de diseño más importante de la aplicación y NUNCA puede estar roto.**

Esto significa:

- La línea/camino entre nodos tiene que estar siempre conectada, sin cortes, sin nodos flotando sueltos, sin desalineaciones entre el path y los nodos.
- El estado de los nodos tiene que ser siempre coherente: siempre debe existir exactamente un nodo "current" claro y clickeable. Nunca puede pasar que ningún nodo esté disponible (track trabado) ni que el orden de desbloqueo sea ambiguo.
- Ningún elemento fijo (bottom nav, header sticky) puede tapar nodos ni interceptar sus clicks.
- El track debe verse perfecto en mobile (probar en viewport 390×844) y en desktop.
- Si un nodo apunta a contenido que falló al generarse, el track debe degradar con gracia (permitir saltar/reintentar), nunca mostrar un nodo muerto que rompa el camino.

Si hay que elegir dónde invertir tiempo de polish visual, siempre es en el track.

## 5.2 El usuario no debe pensar demasiado

La app debe reducir ansiedad y decisión.

Cada pantalla debe tener una acción principal clara.

Ejemplos:

- “Continuar mi track.”
- “Hacer reto diario.”
- “Repetir esta lección.”
- “Desbloquear plan completo.”
- “Subir exámenes anteriores.”
- “Ver temas débiles.”

## 5.3 Personalización visible

El onboarding debe hacer sentir que el plan es específico para el usuario.

No alcanza con preguntar “materia y fecha”. Hay que capturar:

- Edad/rango.
- Nivel educativo.
- Carrera.
- Materia.
- Tipo de examen.
- Fecha.
- Nota objetivo.
- Tiempo disponible.
- Días no disponibles.
- Nivel actual.
- Estilo del profesor.
- Materiales.
- Exámenes anteriores.
- Qué tan representativos son esos exámenes anteriores.

## 5.4 Nada de diagnóstico inicial separado

No crear un paso obligatorio de diagnóstico inicial antes de entrar al track.

Después de subir materiales, el usuario debe ir directo al track generado.

Si se quiere calibrar el nivel, hacerlo dentro de la primera unidad o primeras lecciones, de forma invisible, sin llamarlo diagnóstico.

## 5.5 Ejercicios solamente textuales

No incluir voz, audio, grabaciones, speech-to-text ni actividades orales.

Todos los ejercicios deben poder resolverse con texto, botones, selección, ordenamiento, matching o input corto.

---

# 6. Diseño visual

**Obligatorio: usar las skills de diseño disponibles en el entorno del agente, en particular la skill de "impeccable design" y la "taste skill".** Leerlas y aplicarlas antes de diseñar cualquier pantalla. Toda la UI (landing, onboarding, track, lecciones, paywall) debe pasar por el criterio de esas skills.

La app debe ser mobile-first, muy pulida, alegre, clara, gamificada y de alta calidad.

No debe sentirse como SaaS B2B, Notion template, dashboard corporativo ni app gris de productividad.

Debe sentirse como una app educativa moderna, adictiva y extremadamente simple.

## 6.1 Estilo visual general

Dirección visual:

- Mobile-first.
- Fondo claro.
- Mucho blanco.
- Colores vivos.
- Bordes muy redondeados.
- Botones grandes.
- Cards suaves.
- Sombras sutiles.
- Iconografía simple.
- Microinteracciones visuales.
- Jerarquía clara.
- Sensación de progreso.
- UI divertida pero no infantil.
- Debe sentirse motivadora, no académicamente fría.

## 6.2 Paleta propia de StudyTrack

Usar una identidad visual propia, inspirada en apps educativas gamificadas, sin usar assets protegidos de ninguna marca.

Paleta propuesta:

- Primary green: `#37C871`
- Primary green dark: `#199B50`
- Primary green light: `#DDFBEA`
- Accent blue: `#2F80ED`
- Accent purple: `#8B5CF6`
- Accent yellow: `#FFD166`
- Accent orange: `#FF8A3D`
- Error red: `#EF4444`
- Success green: `#22C55E`
- Background: `#F7FAF8`
- Surface: `#FFFFFF`
- Text primary: `#16251C`
- Text secondary: `#5F6F66`
- Muted border: `#E3ECE6`
- Locked gray: `#D1D8D3`

## 6.3 Tipografía

Usar una tipografía redondeada, moderna y legible.

Opciones:

- Inter.
- Nunito.
- Plus Jakarta Sans.
- Manrope.

Preferencia:

- Headings: Plus Jakarta Sans, font-bold.
- Body: Inter o Nunito.
- Botones: font-bold.

La UI debe tener headings grandes, textos cortos y lenguaje amigable.

## 6.4 Botones

Botones principales:

- Grandes.
- Altura mínima 52px.
- Bordes 16px.
- Texto bold.
- Sombra inferior suave, como botón físico.
- Estado active con transform translate-y pequeño.
- Estado disabled gris claro.

Ejemplo visual:

- Botón primary verde.
- Sombra verde más oscura.
- Texto blanco.
- Borde inferior visual para dar sensación táctil.

## 6.5 Cards

Cards con:

- Fondo blanco.
- Border `#E3ECE6`.
- Border radius 24px.
- Padding generoso.
- Sombras suaves.
- Títulos claros.
- Iconos circulares.

## 6.6 Camino vertical

El track debe ser la UI más cuidada de toda la app. **Es la parte de diseño más importante de la aplicación y no puede estar roto nunca** (ver sección 5.1).

Requisitos de robustez visual (no negociables):

- El path (línea/curva) debe conectar todos los nodos sin cortes ni desalineaciones, en cualquier alto de pantalla y con cualquier cantidad de nodos.
- Los nodos alternados izquierda/centro/derecha deben quedar siempre sobre la línea, nunca flotando al costado.
- El nodo "current" debe existir siempre y ser inconfundible.
- El bottom nav y el header sticky nunca deben tapar nodos ni robar clicks (dejar padding inferior generoso, mínimo `pb-32`).
- Los headers sticky deben tener fondo 100% opaco para que el contenido no se vea "fantasma" detrás.
- Probar el track completo scrolleando de punta a punta en mobile antes de dar por terminada la pantalla.

Debe tener:

- Unidades separadas por banners.
- Nodos circulares grandes.
- Línea vertical o camino curvo entre nodos.
- Nodos alternados izquierda/centro/derecha para generar sensación de camino.
- Nodos completados con check.
- Nodo actual destacado con glow/pulse.
- Nodos bloqueados en gris con candado.
- Nodos premium con candado dorado o violeta.
- Tests de unidad como nodos especiales más grandes.
- Simulacros como nodos especiales con ícono de documento/examen.
- Repasos como nodos con ícono de refresh.
- Reto diario como nodo destacado.

## 6.7 Sin mascota

No crear búho, mascota, animal ni personaje principal.

Se puede usar iconografía abstracta:

- Rayo.
- Libro.
- Check.
- Cerebro.
- Lápiz.
- Trofeo.
- Fuego/streak.
- Candado.
- Estrella.
- Target.
- Cronómetro.
- Documento.

Pero nada que imite una mascota de otra marca.

---

# 7. Arquitectura de rutas

Crear estas rutas:

## Públicas

- `/`
- `/pricing`
- `/login`
- `/signup`

## Onboarding

- `/onboarding`
- `/onboarding/age`
- `/onboarding/education`
- `/onboarding/career`
- `/onboarding/subject`
- `/onboarding/exam-type`
- `/onboarding/exam-date`
- `/onboarding/target-grade`
- `/onboarding/availability`
- `/onboarding/current-level`
- `/onboarding/professor-style`
- `/onboarding/upload-materials`
- `/onboarding/upload-past-exams`
- `/onboarding/analyzing`
- `/onboarding/complete`

También se puede implementar como un único route `/onboarding` con step state interno.

## App privada

- `/dashboard`
- `/exams`
- `/exams/new`
- `/exams/[id]`
- `/exams/[id]/track`
- `/exams/[id]/lesson/[lessonId]`
- `/exams/[id]/quiz/[quizId]`
- `/exams/[id]/review`
- `/exams/[id]/mock-exams`
- `/exams/[id]/progress`
- `/exams/[id]/materials`
- `/exams/[id]/past-exams`
- `/exams/[id]/settings`
- `/checkout/success`
- `/checkout/failure`
- `/checkout/pending`

## API routes/server actions

- Crear examen.
- Subir materiales.
- Subir exámenes anteriores.
- Procesar materiales.
- Generar topic map.
- Generar track.
- Generar lecciones.
- Generar quizzes.
- Evaluar respuestas.
- Actualizar progreso.
- Calcular readiness score.
- Crear preferencia de Mercado Pago.
- Webhook de Mercado Pago.
- Enviar eventos a PostHog.

---

# 8. Landing page

La landing debe ser clara, visual, mobile-first y centrada en el dolor del estudiante.

## 8.1 Hero

Título:

**Convertí tus apuntes en un camino para aprobar.**

Subtítulo:

**Subí tus materiales, indicá cuándo rendís y StudyTrack te arma un track diario con lecciones, ejercicios, repasos y simulacros para llegar a tu nota objetivo.**

CTA principal:

**Crear mi track**

CTA secundario:

**Ver demo**

Elementos visuales del hero:

- Mockup de teléfono mostrando el camino vertical.
- Readiness score visible.
- Un nodo actual “Reto diario”.
- Un contador “Faltan 8 días”.
- Una tarjeta “Preparación: 42%”.
- Una tarjeta “Próximo paso: Completar definiciones clave”.

## 8.2 Sección problema

Título:

**Estudiar no debería ser adivinar qué hacer.**

Bullets:

- Tenés PDFs, apuntes y resúmenes por todos lados.
- No sabés qué temas priorizar.
- No sabés si estás listo.
- Releés mucho, pero practicás poco.
- Te cuesta organizarte hasta la fecha del examen.

## 8.3 Sección solución

Título:

**StudyTrack te da un camino.**

Tres pasos:

1. **Subí tus apuntes**  
PDFs, fotos, resúmenes, textos o guías.
2. **Agregá la fecha y tu nota objetivo**  
Decinos cuánto tiempo tenés y qué querés lograr.
3. **Seguís tu track diario**  
Lecciones cortas, ejercicios, repasos y tests hasta llegar preparado.

## 8.4 Sección exámenes anteriores

Título:

**Practicá como probablemente te van a tomar.**

Texto:

**Si tenés parciales o finales anteriores, subilos. StudyTrack detecta patrones, temas repetidos y estilos de pregunta para crear quizzes y simulacros más parecidos al examen real.**

Mostrar card:

- “Parcial 2024 — parecido estimado: 8/10”
- “Mismo profesor”
- “Formato mixto”
- “Alta coincidencia de temas”

## 8.5 Sección track

Título:

**Un camino claro hasta el examen.**

Mostrar mockup con:

- Unidad 1 desbloqueada.
- Unidad 2 desbloqueada.
- Unidad 3 premium bloqueada.
- Simulacro final bloqueado.
- Reto diario destacado.

## 8.6 Sección readiness score

Título:

**Sabé qué tan preparado estás.**

Texto:

**Tu nivel de preparación combina avance, resultados en quizzes, dificultad, temas cubiertos, repasos y tiempo restante. No es solo una barra de progreso: es una señal de qué tan cerca estás de tu objetivo.**

## 8.7 Pricing preview

Planes:

- 1 examen.
- 3 exámenes.
- Semestre.

CTA:

**Empezar gratis**

---

# 9. Onboarding detallado

El onboarding debe tener una pregunta por pantalla, con UI simple, botones grandes y sensación de avance.

Debe mostrar una barra de progreso arriba.

Debe permitir volver al paso anterior.

Debe guardar cada respuesta en estado local y luego persistir al crear el examen.

## 9.0 Slides animadas y personalización reactiva (obligatorio)

Las slides del onboarding NO pueden ser solo "llenar un campo y pasar a la siguiente". Cada paso debe sentirse vivo y personalizado:

- **Animaciones de entrada/salida**: cada slide entra con una transición suave (slide/fade/scale). Las opciones aparecen con un pequeño stagger. Al seleccionar una opción hay feedback visual inmediato (bounce, check animado, cambio de color).
- **Reacciones específicas a la respuesta**: después de responder, mostrar un micro-mensaje o animación contextual que dependa de lo que eligió el usuario, para que sienta que la app lo está escuchando. Ejemplos:
  - Elige "Universidad" → "Perfecto, vamos a armar un plan a nivel universitario."
  - Escribe la materia (ej: "Análisis Matemático 2") → "Análisis Matemático 2 📐 — buena elección, las materias con mucha práctica son ideales para un track."
  - Elige la fecha → contador animado "Te quedan **12 días**. Es tiempo suficiente si arrancamos hoy."
  - Elige nota objetivo "9+" → "Ambicioso. Vamos a subir la exigencia de los quizzes."
  - Elige "2 horas por día" → "Con 2 horas por día podemos cubrir mucho terreno."
  - Elige días no disponibles → mini calendario que se pinta en vivo mostrando los días de estudio.
  - Elige "No empecé" → "Tranquilo, el track arranca desde cero."
- **Elementos visuales que se construyen en vivo**: a medida que avanza el onboarding, se puede mostrar un preview parcial que se va armando (ej: una tarjeta resumen que suma la materia, la fecha, la nota objetivo), reforzando la sensación de que el plan se construye con sus respuestas.
- **Textos dinámicos que usan las respuestas anteriores**: los títulos y subtítulos de pasos posteriores deben incorporar respuestas previas (ej: "¿Cuándo rendís **Análisis Matemático 2**?").
- Las animaciones deben ser rápidas (200–400 ms), no bloquear el avance, y respetar `prefers-reduced-motion`.

El objetivo es que el onboarding parezca una conversación personalizada, no un formulario.

## 9.1 Step 1 — Bienvenida

Título:

**Vamos a armar tu camino para aprobar.**

Subtítulo:

**Te vamos a hacer algunas preguntas rápidas para crear un track específico para tu examen.**

Botón:

**Empezar**

Visual:

- Ícono de target o camino.
- Fondo claro.
- Card central.

## 9.2 Step 2 — Edad

Título:

**¿Cuántos años tenés?**

Opciones:

- Menos de 18
- 18–22
- 23–29
- 30+

Campo en DB:

`age_range`

Esta pregunta sirve para ajustar tono y contexto, pero no debe sentirse invasiva.

## 9.3 Step 3 — Nivel educativo

Título:

**¿Qué estás estudiando?**

Opciones:

- Secundario
- Universidad
- Tecnicatura
- Curso o certificación
- Otro

Campo:

`education_level`

## 9.4 Step 4 — Carrera

Título:

**¿Qué carrera o área estás estudiando?**

Input libre con placeholder:

“Ej: Ingeniería, Ciencias de la Computación, Medicina, Psicología…”

Campo:

`career`

Debe poder saltearse con “No aplica”.

## 9.5 Step 5 — Materia

Título:

**¿Qué materia vas a rendir?**

Input:

“Ej: Análisis Matemático 2, Sistemas Operativos, Física 1…”

Campo:

`subject_name`

Esta es una de las preguntas más importantes.

## 9.6 Step 6 — Tipo de examen

Título:

**¿Qué tipo de examen vas a rendir?**

Selección múltiple:

- Parcial
- Final
- Global
- Recuperatorio
- Multiple choice
- Desarrollo
- Práctico
- Mixto

Campo:

`exam_type[]`

Si elige “Global”, esto debe influir en el plan: más integración, más repaso acumulativo, más simulacros generales.

Si elige “Parcial”, foco en unidades específicas.

Si elige “Final”, foco en relación entre temas y preguntas integradoras.

## 9.7 Step 7 — Fecha del examen

Título:

**¿Cuándo rendís?**

Date picker.

Mostrar debajo:

**Te quedan X días.**

Campo:

`exam_date`

Si quedan menos de 3 días, activar recomendación de “Modo emergencia”.

## 9.8 Step 8 — Nota objetivo

Título:

**¿A qué nota querés llegar?**

Opciones:

- Solo quiero aprobar
- 7+
- 8+
- 9+
- 10

Campo:

`target_grade`

Internamente mapear:

- Aprobar = 6 o nota mínima configurable.
- 7+ = 7.
- 8+ = 8.
- 9+ = 9.
- 10 = 10.

Esto debe influir en intensidad y profundidad.

## 9.9 Step 9 — Tiempo disponible

Título:

**¿Cuánto podés estudiar por día?**

Opciones:

- 20 minutos
- 45 minutos
- 1 hora
- 2 horas
- 3 horas o más

Campo:

`available_minutes_per_day`

## 9.10 Step 10 — Días no disponibles

Título:

**¿Qué días no podés estudiar?**

Selector semanal:

- Lunes
- Martes
- Miércoles
- Jueves
- Viernes
- Sábado
- Domingo

Campo:

`unavailable_days[]`

Debe permitir “Puedo todos los días”.

## 9.11 Step 11 — Nivel actual

Título:

**¿Cómo venís con la materia?**

Opciones:

- No empecé
- Sé algo
- Vengo bien
- Solo necesito practicar

Campo:

`current_level`

Mapeo:

- No empecé = bajo.
- Sé algo = medio-bajo.
- Vengo bien = medio-alto.
- Solo necesito practicar = alto.

## 9.12 Step 12 — Estilo del profesor

Título:

**¿Cómo suele tomar el profesor?**

Subtítulo:

**Elegí todo lo que aplique. Si no sabés, no pasa nada.**

Opciones:

- Memorístico
- Conceptual
- Casos
- Fórmulas
- Definiciones
- Preguntas trampa
- Mucho detalle
- No sé

Campo:

`professor_style[]`

Esto debe influir en los tipos de ejercicios generados.

## 9.13 Step 13 — Subir materiales

Título:

**Subí tus apuntes y materiales.**

Subtítulo:

**Podés subir PDFs, fotos, resúmenes, guías o pegar texto.**

Debe permitir mínimo 5 archivos en el plan gratis.

Tipos aceptados para MVP:

- PDF.
- TXT.
- Markdown.
- Imágenes, si se implementa OCR.
- DOCX opcional.
- Texto pegado manualmente.

UI:

- Dropzone grande.
- Botón “Elegir archivos”.
- Lista de archivos subidos.
- Estado de subida.
- Opción “Pegar texto en vez de subir archivo”.
- Mensaje: “Mientras mejor sea el material, mejor va a ser tu track.”

Campo/tablas:

- `study_sources`
- `source_chunks`

## 9.14 Step 14 — Subir exámenes anteriores

Título:

**¿Tenés parciales o finales anteriores?**

Subtítulo:

**Si los subís, vamos a generar ejercicios y simulacros más parecidos a cómo suelen tomar.**

Opciones:

- Sí, subir exámenes.
- No tengo.
- Los agrego después.

Si el usuario sube exámenes anteriores, para cada uno pedir metadata.

### Metadata por examen anterior

Campos:

1. Nombre:
  - Placeholder: “Parcial 1 - 2024”
2. Tipo:
  - Parcial
  - Final
  - Global
  - Recuperatorio
  - Multiple choice
  - Desarrollo
  - Mixto
3. Profesor/cátedra:
  - Mismo profesor
  - Misma cátedra
  - Otro profesor
  - No sé
4. Alcance:
  - Mismos temas
  - Algunos temas
  - Otros temas
  - No sé
5. Formato:
  - Igual al que voy a rendir
  - Parecido
  - Distinto
  - No sé
6. Año o fecha aproximada:
  - Input opcional.
7. Dificultad percibida:
  - Fácil
  - Media
  - Difícil
  - No sé
8. Similaridad percibida:
  - Slider 1 a 10.
  - Pregunta exacta:  
  **“¿Qué tan parecido creés que va a ser tu examen a este?”**

### Ayuda para el slider

Mostrar debajo del slider:

- 1–3: “Casi no se parece, pero puede servir como práctica general.”
- 4–6: “Referencia útil, pero no exactamente igual.”
- 7–8: “Bastante parecido.”
- 9–10: “Muy parecido: mismo profesor, formato y temas.”

### Campo de aclaración

Agregar textarea opcional:

**“¿Querés aclarar algo sobre este examen?”**

Placeholder:

- “Era de otro profesor.”
- “Estos eran parciales, pero ahora rindo global.”
- “El formato cambió este año.”
- “El profesor suele repetir ejercicios parecidos.”
- “Solo tengo una parte del examen.”

Campo:

`user_notes`

## 9.15 Step 15 — Análisis

Pantalla de carga muy cuidada.

Título:

**Estamos creando tu camino personalizado.**

Subtítulo dinámico:

- “Leyendo tus apuntes…”
- “Detectando temas importantes…”
- “Comparando exámenes anteriores…”
- “Estimando dificultad…”
- “Priorizando lo que más puede entrar…”
- “Creando ejercicios…”
- “Armando tu track diario…”

Debe tener animación visual simple:

- Barra de progreso.
- Cards que aparecen.
- Íconos.
- Mensajes rotativos.

No debe tardar infinitamente. Si el procesamiento real tarda, usar jobs async y mostrar un estado. Para MVP, se puede simular progreso mientras se generan datos.

## 9.16 Step 16 — Resultado

Después del análisis, llevar directamente a:

`/exams/[id]/track`

Mostrar una primera modal/card:

Título:

**Tu track está listo.**

Subtítulo:

**Te armamos un camino hasta el examen según tus apuntes, tiempo disponible y nota objetivo.**

Datos visibles:

- Materia.
- Días restantes.
- Nota objetivo.
- Unidades generadas.
- Primer reto diario.
- Readiness inicial estimado.

CTA:

**Empezar Unidad 1**

---

# 10. Módulo de exámenes anteriores

Este módulo es extremadamente importante.

Los exámenes anteriores deben impactar la generación de:

- Temas prioritarios.
- Tipos de preguntas.
- Dificultad.
- Simulacros.
- Ejercicios premium.
- Readiness score.
- Recomendaciones de estudio.

## 10.1 Similarity Score

Cada examen anterior debe tener:

1. `user_similarity_score`
2. `ai_similarity_score`
3. `final_relevance_score`

### User similarity score

Lo define el usuario con slider 1–10.

Pregunta:

**“¿Qué tan parecido creés que va a ser tu examen a este?”**

### AI similarity score

La app lo calcula según:

- Mismo profesor.
- Misma cátedra.
- Mismo tipo de examen.
- Mismo formato.
- Mismo alcance de temas.
- Año reciente.
- Coincidencia semántica con materiales actuales.
- Coincidencia con tipo de evaluación declarado.
- Cantidad de temas compartidos.
- Estilo de preguntas.

### Fórmula sugerida

Para MVP:

```txt
ai_similarity_score =
teacher_match_score * 0.20 +
exam_type_match_score * 0.20 +
scope_match_score * 0.20 +
format_match_score * 0.15 +
recency_score * 0.10 +
semantic_overlap_score * 0.15

```

Cada subscore va de 0 a 10.

Final:

```txt
final_relevance_score =
user_similarity_score * 0.4 +
ai_similarity_score * 0.6

```

Si la IA no puede calcular bien, usar:

```txt
final_relevance_score = user_similarity_score

```

## 10.2 Mensajes según caso

### Mismo profesor, mismo formato, mismos temas

Mostrar:

**Parecido estimado: 9/10**

Texto:

**Este examen parece una referencia muy fuerte porque coincide en profesor, formato y temas. Vamos a darle mucho peso para generar ejercicios y simulacros.**

### Otro profesor, misma materia

Mostrar:

**Parecido estimado: 5/10**

Texto:

**Este examen puede servir como referencia general, pero al ser de otro profesor no necesariamente representa el estilo del examen actual. Lo vamos a usar con peso medio.**

### Parciales anteriores, ahora rinde global

Mostrar:

**Parecido estimado: 6/10**

Texto:

**Estos parciales ayudan a entender temas y estilo, pero ahora vas a rendir un global. Vamos a usarlos como referencia parcial y crear simulacros más integradores.**

### Formato distinto

Mostrar:

**Parecido estimado: 4/10**

Texto:

**El contenido puede ser útil, pero el formato cambió. Vamos a usar estos exámenes para detectar temas importantes, no para copiar exactamente el estilo de preguntas.**

### Examen viejo

Mostrar:

**Parecido estimado: 4/10**

Texto:

**Puede servir como práctica general, pero al ser antiguo podría no reflejar el enfoque actual de la materia.**

## 10.3 Análisis de patrones

La app debe detectar:

- Temas repetidos.
- Palabras clave frecuentes.
- Tipos de pregunta.
- Profundidad requerida.
- Nivel de detalle.
- Cantidad de preguntas por tema.
- Presencia de casos.
- Presencia de definiciones.
- Presencia de verdadero/falso.
- Presencia de multiple choice.
- Presencia de ejercicios de relación.
- Presencia de preguntas integradoras.

## 10.4 Uso en generación

Si un tema aparece mucho en exámenes anteriores, aumentar:

- `topic.importance`
- frecuencia de repasos.
- cantidad de ejercicios.
- peso en simulacros.
- prioridad en Modo Emergencia.

Si un tipo de pregunta aparece mucho, generar más ejercicios de ese tipo.

Ejemplo:

Si los exámenes anteriores tienen muchas preguntas de “definir concepto”, crear más:

- completar definición.
- multiple choice conceptual.
- matching concepto-definición.
- elegir definición incorrecta.

Si tienen muchos casos, crear más:

- caso corto.
- aplicar concepto.
- clasificar situación.
- elegir solución correcta.

---

# 11. Learning Track

La pantalla `/exams/[id]/track` es la pantalla principal.

Debe ser mobile-first.

## 11.1 Header del track

Arriba debe mostrar:

- Nombre de la materia.
- Días restantes.
- Readiness score.
- Streak.
- Ícono de fuego/streak.
- Botón de settings o menú.

Ejemplo:

```txt
Análisis Matemático 2
Faltan 8 días · Objetivo: 8+

Preparación
42%

```

Visual:

- Header sticky.
- Fondo claro.
- Score en pill.
- Countdown en texto secundario.

## 11.2 Estructura del camino

El camino debe tener unidades.

Cada unidad tiene:

- Nombre.
- Descripción corta.
- Estado.
- Cantidad de lecciones.
- Test de unidad.
- Nodos.

Ejemplo:

```txt
Unidad 1 — Funciones de varias variables
Aprendé los conceptos mínimos para arrancar.

Nodo 1: Lección — Dominio e imagen en varias variables
Nodo 2: Completar — Conceptos clave
Nodo 3: Matching — Definiciones y propiedades
Nodo 4: Quiz — Mini test de unidad

```

## 11.3 Estados de nodos

Cada nodo puede estar:

- Completed.
- Current.
- Available.
- Locked.
- Premium locked.
- Failed/retry.
- Review due.

### Completed

- Verde.
- Check.
- Pequeña animación o glow.
- Muestra score obtenido.

### Current

- Color primario.
- Más grande.
- Pulse suave.
- CTA principal.
- Texto “Continuar”.

### Available

- Verde claro o azul.
- Sin candado.

### Locked

- Gris.
- Candado.
- Texto: “Completá la lección anterior”.

### Premium locked

- Violeta/dorado.
- Candado.
- Texto: “Desbloquear plan completo”.

### Failed/retry

- Naranja.
- Ícono refresh.
- Texto: “Reintentar”.

### Review due

- Azul.
- Ícono refresh.
- Texto: “Repaso”.

## 11.4 Tipos de nodos

1. Lesson node.
2. Practice node.
3. Matching node.
4. Fill blank node.
5. Review node.
6. Daily challenge node.
7. Unit test node.
8. Mock exam node.
9. Premium locked node.
10. Emergency sprint node.

## 11.5 Unidad premium

La app debe mostrar el track completo, pero bloquear desde cierta parte.

Regla MVP:

- Unidad 1 gratis.
- Unidad 2 gratis.
- Unidad 3 en adelante premium.
- Simulacros premium.
- Exámenes calibrados con exámenes anteriores premium.
- Readiness avanzado premium.
- Modo Emergencia premium.

Al llegar a la Unidad 3, mostrar paywall.

---

# 12. Ejercicios textuales

Todos los ejercicios deben ser textuales y fáciles de implementar.

## 12.1 Multiple choice

Estructura:

- Prompt.
- 4 opciones.
- Una correcta.
- Explicación.
- Referencia al material.

Ejemplo:

**¿Cuál es la derivada parcial respecto de x de f(x, y) = x²y?**

Opciones:

A. x²  
B. 2xy  
C. 2x  
D. y²

Correcta: B.

## 12.2 Completar palabra

Estructura:

- Frase con blank.
- Opciones.
- Correcta.
- Explicación.

Ejemplo:

**Una función f(x, y) es continua en un punto si el ____ de la función en ese punto existe y coincide con el valor de la función.**

Opciones:

- límite
- dominio
- gradiente
- máximo

## 12.3 Completar frase

Estructura:

- Texto incompleto.
- Opciones para completar.
- Feedback.

## 12.4 Matching

Estructura:

- Lista A.
- Lista B.
- Pares correctos.
- UI drag/drop o tap-to-match.

Ejemplo:

- Gradiente → Vector de derivadas parciales primeras.
- Matriz Hessiana → Derivadas parciales segundas.
- Derivada direccional → Tasa de cambio en una dirección dada.

## 12.5 Ordenar pasos

Estructura:

- Lista desordenada.
- Usuario ordena.
- Validación.

Ejemplo:

**Ordená los pasos para encontrar y clasificar los extremos de una función de dos variables.**

## 12.6 Verdadero/falso

Estructura:

- Statement.
- Botones verdadero/falso.
- Explicación obligatoria después.

## 12.7 Elegir afirmación incorrecta

Muy útil para estudio fino.

Estructura:

- 4 afirmaciones.
- Una incorrecta.
- Explicación.

## 12.8 Clasificar

Estructura:

- Items.
- Categorías.
- Usuario asigna cada item.

Ejemplo:

Categorías:

- Máximo local.
- Mínimo local.
- Punto silla.

## 12.9 Caso corto

Estructura:

- Mini caso.
- Pregunta.
- Opciones.
- Explicación.

Ejemplo:

**Una empresa quiere minimizar el costo del material de una caja rectangular sin tapa con volumen fijo. ¿Qué técnica de Análisis Matemático 2 conviene usar?**

## 12.10 Respuesta corta

Opcional.

Estructura:

- Prompt.
- Input de texto.
- Corrección por IA.
- Feedback corto.
- Score.

Esta actividad puede estar limitada o premium por costo.

---

# 13. Lección

La pantalla de lección debe ser simple, mobile-first y muy enfocada.

Ruta:

`/exams/[id]/lesson/[lessonId]`

Estructura:

1. Header:
  - X para salir.
  - Barra de progreso.
  - Vidas o intentos, opcional.
2. Contenido:
  - Explicación corta.
  - Tarjeta visual.
  - Conceptos clave.
  - Ejemplo.
3. Ejercicios:
  - 3 a 8 ejercicios por lección.
  - Feedback inmediato.
  - Botón continuar.
4. Resultado:
  - Score.
  - XP ganado.
  - Conceptos dominados.
  - Errores.
  - CTA siguiente.

La lección no debe ser larga. Debe sentirse rápida.

Tiempo estimado:

- 5 a 12 minutos.

---

# 14. Quiz y desbloqueo

Cada lección/unidad tiene un quiz.

Para desbloquear el siguiente nodo:

- El usuario debe aprobar con al menos 70%.
- Si objetivo de nota es 9 o 10, el threshold puede ser 80%.
- Si falla, no desbloquea el siguiente nodo.
- Se genera un retry con explicación más simple.

## 14.1 Feedback al fallar

Mensaje:

**Todavía no desbloqueaste el siguiente paso.**

Subtexto:

**Fallaste sobre todo en estos conceptos. Te preparamos una explicación más simple y un nuevo intento.**

CTA:

**Reintentar**

## 14.2 Feedback al aprobar

Mensaje:

**Lección completada.**

Subtexto:

**Desbloqueaste el siguiente paso del track.**

Mostrar:

- Score.
- XP.
- Readiness +X%.
- Próximo nodo.

---

# 15. Readiness Score

El readiness score es una métrica de 0 a 100.

No debe ser solo porcentaje de tareas completadas.

Debe combinar:

- Dominio por tema.
- Cobertura del material.
- Rendimiento en quizzes.
- Rendimiento en tests de unidad.
- Rendimiento en simulacros.
- Recencia de repasos.
- Consistencia.
- Tiempo restante.
- Importancia de temas según apuntes y exámenes anteriores.

## 15.1 Fórmula MVP

```txt
readiness_score =
weighted_topic_mastery * 0.35 +
coverage_score * 0.20 +
quiz_performance_score * 0.15 +
recency_score * 0.10 +
consistency_score * 0.10 +
time_risk_score * 0.10

```

## 15.2 Topic mastery

```txt
topic_mastery =
accuracy * 0.50 +
difficulty_weight * 0.20 +
recency * 0.20 +
confidence_or_attempt_quality * 0.10

```

Si no hay datos suficientes, usar estimación basada en:

- Nivel actual declarado.
- Material cubierto.
- Lecciones completadas.
- Resultados iniciales.

## 15.3 UI del readiness

Mostrar:

- Número grande: `42%`
- Label: “Preparación estimada”
- Color según rango:

```txt
0–30: rojo/naranja
31–60: amarillo
61–80: azul/verde
81–100: verde

```

Mostrar explicación:

**Tu preparación está en 42% porque completaste 2 de 5 unidades, todavía no hiciste simulacros y los temas más importantes tienen poca práctica.**

## 15.4 Premium readiness

Gratis:

- Score básico.

Premium:

- Desglose por tema.
- Riesgo por tema.
- Predicción para nota objetivo.
- Recomendaciones.
- Comparación con exámenes anteriores.
- Simulacros.

---

# 16. Modo Emergencia

Si faltan 72 horas o menos, activar:

**Modo Emergencia**

Mensaje:

**Te queda poco tiempo. Vamos a priorizar lo que más impacto puede tener.**

Este modo debe:

- Priorizar temas más importantes.
- Usar patrones de exámenes anteriores.
- Reducir contenido largo.
- Enfocarse en práctica.
- Crear sesiones intensivas.
- Marcar temas que conviene abandonar.
- Crear simulacros cortos.

Ejemplo:

```txt
Plan de emergencia:
1. Estudiá estos 3 temas sí o sí.
2. Practicá estas 20 preguntas.
3. Hacé este simulacro corto.
4. Repasá errores.
5. No pierdas tiempo con temas de baja probabilidad.

```

Modo Emergencia debe ser premium.

---

# 17. Monetización

Modelo principal:

**Pago por examen.**

No usar suscripción como único modelo.

## 17.1 Plan gratis

Gratis incluye:

- Crear 1 examen.
- Subir mínimo 5 archivos.
- Subir exámenes anteriores.
- Generar track completo visible.
- Completar Unidad 1.
- Completar Unidad 2.
- Ver readiness score básico.
- Ver unidades bloqueadas.
- Ver simulacros bloqueados.

## 17.2 Paywall

Aparece:

- Al intentar entrar a Unidad 3.
- Al intentar hacer simulacro.
- Al intentar usar Modo Emergencia.
- Al intentar ver readiness avanzado.
- Al intentar generar tests calibrados con exámenes anteriores avanzados.

## 17.3 Copy del paywall

Título:

**Desbloqueá tu plan completo para este examen.**

Subtítulo:

**Ya creamos tu track. Desbloqueá todas las unidades, repasos, simulacros y ejercicios calibrados con tus exámenes anteriores.**

Mostrar beneficios:

- Todas las unidades.
- Simulacros.
- Ejercicios tipo examen.
- Readiness avanzado.
- Modo Emergencia.
- Repasos personalizados.
- Tests calibrados con parciales anteriores.

CTA:

**Desbloquear este examen**

Planes:

1. **1 examen**
  - Para preparar una materia puntual.
2. **3 exámenes**
  - Para época de parciales/finales.
3. **Pack semestre**
  - Para preparar varias materias durante el semestre.

## 17.4 Mercado Pago Checkout Pro

Implementar Checkout Pro.

Flujo:

1. Usuario elige plan.
2. Backend crea preferencia de pago.
3. Se guarda payment record en Supabase con status `pending`.
4. Usuario es redirigido a Mercado Pago.
5. Mercado Pago vuelve a:
  - `/checkout/success`
  - `/checkout/failure`
  - `/checkout/pending`
6. Webhook actualiza estado real del pago.
7. Si pago aprobado, desbloquear acceso.

Tablas:

- `payments`
- `access_purchases`

Estados:

- pending
- approved
- rejected
- cancelled
- refunded

---

# 18. Supabase Database Schema

Crear esquema completo.

## profiles

```sql
id uuid primary key references auth.users(id)
email text
full_name text
age_range text
education_level text
career text
created_at timestamp
updated_at timestamp

```

## exams

```sql
id uuid primary key
user_id uuid references profiles(id)
subject_name text not null
exam_date date not null
target_grade text
available_minutes_per_day integer
unavailable_days text[]
current_level text
exam_types text[]
professor_styles text[]
status text default 'draft'
readiness_score numeric default 0
is_emergency_mode boolean default false
created_at timestamp
updated_at timestamp

```

## study_sources

```sql
id uuid primary key
exam_id uuid references exams(id)
user_id uuid references profiles(id)
file_name text
file_type text
storage_path text
raw_text text
source_kind text -- notes, pdf, photo, pasted_text
processing_status text default 'pending'
created_at timestamp
updated_at timestamp

```

## source_chunks

```sql
id uuid primary key
source_id uuid references study_sources(id)
exam_id uuid references exams(id)
chunk_index integer
content text
summary text
embedding vector optional
created_at timestamp

```

## past_exams

```sql
id uuid primary key
exam_id uuid references exams(id)
source_id uuid references study_sources(id)
title text
past_exam_kind text
teacher_match text
scope_match text
format_match text
year text
difficulty_perceived text
user_similarity_score integer
ai_similarity_score numeric
final_relevance_score numeric
user_notes text
analysis_summary text
created_at timestamp
updated_at timestamp

```

## past_exam_questions

```sql
id uuid primary key
past_exam_id uuid references past_exams(id)
exam_id uuid references exams(id)
question_text text
question_type text
detected_topic_title text
topic_id uuid optional
difficulty numeric
expected_answer text
created_at timestamp

```

## topics

```sql
id uuid primary key
exam_id uuid references exams(id)
title text
summary text
importance numeric
difficulty numeric
estimated_minutes integer
source_references jsonb
past_exam_frequency integer default 0
mastery_score numeric default 0
created_at timestamp
updated_at timestamp

```

## study_units

```sql
id uuid primary key
exam_id uuid references exams(id)
title text
description text
order_index integer
is_premium boolean default false
unlock_condition jsonb
created_at timestamp
updated_at timestamp

```

## lessons

```sql
id uuid primary key
exam_id uuid references exams(id)
unit_id uuid references study_units(id)
topic_id uuid references topics(id)
title text
summary text
content text
order_index integer
estimated_minutes integer
lesson_type text
is_premium boolean default false
status text default 'locked'
created_at timestamp
updated_at timestamp

```

## quizzes

```sql
id uuid primary key
exam_id uuid references exams(id)
lesson_id uuid references lessons(id)
unit_id uuid references study_units(id)
title text
quiz_type text
passing_score numeric default 70
is_premium boolean default false
created_at timestamp
updated_at timestamp

```

## questions

```sql
id uuid primary key
quiz_id uuid references quizzes(id)
exam_id uuid references exams(id)
topic_id uuid references topics(id)
question_type text
prompt text
options jsonb
correct_answer jsonb
explanation text
difficulty numeric
source_reference text
past_exam_influence_score numeric
created_at timestamp

```

## answers

```sql
id uuid primary key
user_id uuid references profiles(id)
exam_id uuid references exams(id)
quiz_id uuid references quizzes(id)
question_id uuid references questions(id)
answer jsonb
is_correct boolean
score numeric
feedback text
created_at timestamp

```

## lesson_progress

```sql
id uuid primary key
user_id uuid references profiles(id)
exam_id uuid references exams(id)
lesson_id uuid references lessons(id)
status text -- locked, available, current, completed, failed
best_score numeric
attempts integer default 0
completed_at timestamp
created_at timestamp
updated_at timestamp

```

## readiness_scores

```sql
id uuid primary key
exam_id uuid references exams(id)
user_id uuid references profiles(id)
score numeric
topic_mastery_score numeric
coverage_score numeric
quiz_performance_score numeric
recency_score numeric
consistency_score numeric
time_risk_score numeric
explanation text
created_at timestamp

```

## payments

```sql
id uuid primary key
user_id uuid references profiles(id)
exam_id uuid references exams(id)
plan_type text -- one_exam, three_exams, semester
provider text default 'mercadopago'
provider_payment_id text
provider_preference_id text
status text
amount numeric
currency text default 'ARS'
created_at timestamp
updated_at timestamp

```

## access_purchases

```sql
id uuid primary key
user_id uuid references profiles(id)
exam_id uuid references exams(id)
plan_type text
status text
starts_at timestamp
expires_at timestamp
created_at timestamp
updated_at timestamp

```

## posthog_events optional local mirror

```sql
id uuid primary key
user_id uuid
event_name text
properties jsonb
created_at timestamp

```

---

# 19. AI generation pipeline

Usar OpenAI API server-side.

Las generaciones deben devolver JSON estructurado siempre que sea posible.

## 19.1 Pipeline general

1. Extract text from uploaded files.
2. Chunk content.
3. Summarize sources.
4. Analyze previous exams.
5. Generate topic map.
6. Calculate topic importance.
7. Generate study units.
8. Generate lessons.
9. Generate exercises.
10. Generate quizzes.
11. Generate track nodes.
12. Calculate initial readiness score.

## 19.2 Source analysis prompt

Input:

- Subject.
- Exam type.
- Target grade.
- Exam date.
- User level.
- Professor style.
- Material text chunks.

Output JSON:

```json
{
  "summary": "...",
  "main_topics": [
    {
      "title": "...",
      "summary": "...",
      "importance": 8,
      "difficulty": 6,
      "estimated_minutes": 45,
      "source_references": ["..."]
    }
  ],
  "missing_information": ["..."],
  "suggested_focus": ["..."]
}

```

## 19.3 Past exam analysis prompt

Input:

- Current exam metadata.
- Past exam metadata.
- Past exam text.
- User similarity score.
- User notes.

Output JSON:

```json
{
  "ai_similarity_score": 7.5,
  "final_relevance_reasoning": "...",
  "detected_question_types": ["multiple_choice", "definition", "case"],
  "repeated_topics": ["..."],
  "difficulty": 6,
  "style_summary": "...",
  "questions": [
    {
      "question_text": "...",
      "question_type": "definition",
      "detected_topic_title": "...",
      "difficulty": 5,
      "expected_answer": "..."
    }
  ],
  "recommendations": [
    "Generate more case-based questions",
    "Prioritize topic X"
  ]
}

```

## 19.4 Track generation prompt

Input:

- Exam metadata.
- Topic map.
- Available days.
- Minutes per day.
- Target grade.
- Current level.
- Past exam analysis.
- Free/premium rules.

Output JSON:

```json
{
  "units": [
    {
      "title": "...",
      "description": "...",
      "order_index": 1,
      "is_premium": false,
      "lessons": [
        {
          "title": "...",
          "lesson_type": "concept",
          "topic_title": "...",
          "estimated_minutes": 8,
          "is_premium": false,
          "exercises": [
            {
              "type": "multiple_choice",
              "prompt": "...",
              "options": ["...", "...", "...", "..."],
              "correct_answer": "...",
              "explanation": "...",
              "difficulty": 4,
              "source_reference": "..."
            }
          ]
        }
      ]
    }
  ]
}

```

## 19.5 Exercise generation rules

When generating exercises:

- Prefer exercises aligned with past exams if available.
- Use uploaded material as source.
- Avoid hallucinating unsupported claims.
- Include source reference where possible.
- Keep explanations short.
- Avoid huge paragraphs.
- Make exercises quick.
- Mix question types.
- Increase difficulty gradually.
- Generate retry explanations for failed concepts.

## 19.6 Safety/correctness rules

The app should never claim certainty that a topic will appear in the exam.

Use language like:

- “Alta prioridad.”
- “Probablemente importante.”
- “Aparece seguido en exámenes anteriores.”
- “Conviene practicarlo.”
- “Puede ser representativo.”

Avoid:

- “Esto seguro entra.”
- “Este será el examen.”
- “Estudiá solo esto.”

---

# 20. Analytics con PostHog

Integrar PostHog.

Eventos obligatorios:

```txt
landing_viewed
cta_clicked
signup_started
signup_completed
onboarding_started
onboarding_step_completed
onboarding_completed
exam_created
study_material_uploaded
study_material_upload_failed
past_exam_uploaded
past_exam_metadata_completed
past_exam_similarity_set
analysis_started
analysis_completed
analysis_failed
track_generated
track_viewed
lesson_started
lesson_completed
quiz_started
quiz_completed
quiz_failed
quiz_passed
unit_completed
paywall_seen
paywall_cta_clicked
checkout_started
checkout_success
checkout_failure
checkout_pending
premium_unlocked
readiness_score_viewed
mock_exam_started
mock_exam_completed
emergency_mode_viewed
emergency_mode_started

```

Propiedades importantes:

```txt
exam_id
subject_name
exam_type
days_until_exam
target_grade
available_minutes_per_day
has_past_exams
number_of_files
number_of_past_exams
readiness_score
current_unit
is_premium
plan_type

```

Métricas clave:

1. Visitor to onboarding start.
2. Onboarding completion.
3. Upload completion.
4. Track generated.
5. First lesson completed.
6. Unit 1 completed.
7. Unit 2 completed.
8. Paywall view.
9. Checkout start.
10. Checkout conversion.
11. D1 retention.
12. D3 retention.

---

# 21. Seed demo obligatorio

Crear datos demo para que la app se vea completa apenas se abre.

Demo exam:

```txt
Materia: Análisis Matemático 2
Tipo: Parcial
Fecha: 10 días desde hoy
Nota objetivo: 8+
Nivel actual: medio
Tiempo disponible: 1 hora por día
Días no disponibles: domingo
Estilo profesor: fórmulas, conceptual, mucho detalle, preguntas trampa
Materiales: mock notes
Exámenes anteriores: 2 parciales mock
Readiness inicial: 42%

```

## Demo topics

1. Funciones de varias variables.
2. Límites y continuidad en varias variables.
3. Derivadas parciales y gradiente.
4. Diferenciabilidad y plano tangente.
5. Extremos libres y multiplicadores de Lagrange.
6. Integrales múltiples.
7. Ecuaciones diferenciales de primer orden.

## Demo units

### Unidad 1 — Funciones de varias variables

Gratis.

- Lección 1: Dominio, imagen y curvas de nivel.
- Lección 2: Límites y continuidad.
- Lección 3: Completar conceptos clave.
- Test de unidad.

### Unidad 2 — Derivadas parciales

Gratis.

- Lección 1: Derivadas parciales.
- Lección 2: Gradiente y derivada direccional.
- Lección 3: Plano tangente.
- Matching de definiciones.
- Test de unidad.

### Unidad 3 — Extremos y optimización

Premium locked.

- Lección 1.
- Ejercicios de clasificación de puntos críticos.
- Preguntas trampa.
- Test de unidad.

### Unidad 4 — Integrales múltiples

Premium locked.

- Integrales dobles.
- Cambio de variables y coordenadas polares.
- Ejercicios aplicados.

### Unidad 5 — Simulacro parcial

Premium locked.

- Simulacro calibrado con exámenes anteriores.

---

# 22. Componentes UI necesarios

Crear componentes reutilizables:

## Layout

- `AppShell`
- `MobileShell`
- `BottomNav`
- `StickyHeader`
- `PageContainer`

## Onboarding

- `OnboardingLayout`
- `ProgressBar`
- `OptionCard`
- `MultiSelectOption`
- `DateStep`
- `FileUploadStep`
- `PastExamUploadStep`
- `SimilaritySlider`
- `AnalyzingScreen`

## Track

- `LearningPath`
- `PathUnit`
- `PathNode`
- `LessonNode`
- `QuizNode`
- `ReviewNode`
- `MockExamNode`
- `PremiumNode`
- `DailyChallengeNode`
- `ReadinessBadge`
- `CountdownBadge`
- `StreakBadge`

## Lessons

- `LessonScreen`
- `ExerciseRenderer`
- `MultipleChoiceExercise`
- `FillBlankExercise`
- `MatchingExercise`
- `OrderingExercise`
- `TrueFalseExercise`
- `ClassificationExercise`
- `ShortCaseExercise`
- `LessonResult`

## Monetization

- `PaywallModal`
- `PricingCard`
- `CheckoutButton`
- `PremiumBadge`

## Progress

- `ReadinessScoreCard`
- `TopicMasteryList`
- `WeakTopicsCard`
- `ProgressHistory`
- `StudyStats`

---

# 23. Design details for main track

The main track should look polished and highly intentional.

## Track screen structure

Top sticky header:

```txt
[Materia]                              [🔥 3]
Faltan 8 días · Objetivo 8+            [42%]

```

Below:

Card:

```txt
Reto diario
Completá 8 preguntas de derivadas parciales.
+15 XP · 7 min
[Empezar]

```

Then vertical path.

Unit banner:

```txt
Unidad 1
Funciones de varias variables

```

Nodes:

- Circle 64px.
- Connected by path line.
- Alternating horizontal alignment.
- Current node 76px.
- Completed nodes with check.
- Locked nodes gray.
- Premium nodes with lock and small “PRO”.

At bottom:

Fixed bottom nav:

- Track.
- Repaso.
- Simulacros.
- Progreso.
- Perfil.

---

# 24. Repaso

Ruta:

`/exams/[id]/review`

Mostrar:

- Temas para repasar hoy.
- Errores recientes.
- Preguntas falladas.
- Conceptos débiles.
- Repaso rápido de 5 minutos.
- Repaso completo.

El repaso se genera según:

- Fallos.
- Recencia.
- Importancia.
- Exámenes anteriores.
- Proximidad al examen.

---

# 25. Simulacros

Ruta:

`/exams/[id]/mock-exams`

Los simulacros son premium.

Tipos:

1. Simulacro rápido.
2. Simulacro completo.
3. Simulacro calibrado con exámenes anteriores.
4. Simulacro de temas débiles.
5. Simulacro Modo Emergencia.

Cada simulacro debe mostrar:

- Cantidad de preguntas.
- Tiempo estimado.
- Parecido con examen real.
- Temas incluidos.
- Score final.
- Recomendaciones.

---

# 26. Progress page

Ruta:

`/exams/[id]/progress`

Mostrar:

- Readiness score.
- Desglose por tema.
- Unidades completadas.
- Quizzes aprobados.
- Racha.
- Tiempo estudiado.
- Temas fuertes.
- Temas débiles.
- Recomendaciones.

Copy ejemplo:

```txt
Vas bien, pero todavía estás flojo en Multiplicadores de Lagrange.
Ese tema aparece con frecuencia en los exámenes anteriores, así que te conviene reforzarlo hoy.

```

---

# 27. Materials page

Ruta:

`/exams/[id]/materials`

Mostrar:

- Archivos subidos.
- Estado de procesamiento.
- Tipo.
- Fecha.
- Botón para agregar más.
- Botón para eliminar.
- Calidad estimada del material.

Calidad estimada:

- Alta.
- Media.
- Baja.

Si baja:

```txt
Este material parece incompleto o difícil de leer. Podés subir más apuntes para mejorar tu track.

```

---

# 28. Past exams page

Ruta:

`/exams/[id]/past-exams`

Mostrar:

- Lista de exámenes anteriores.
- Similaridad usuario.
- Similaridad IA.
- Relevancia final.
- Tipo.
- Profesor.
- Formato.
- Temas detectados.
- Preguntas extraídas.
- Botón agregar otro.

Card ejemplo:

```txt
Parcial 2024
Relevancia: 8/10

Mismo profesor · Formato mixto · Temas parecidos

Detectamos:
- 12 preguntas
- 4 temas repetidos
- mucho foco en definiciones y casos

```

---

# 29. Access control

Implementar lógica de acceso:

Gratis:

- Puede crear examen.
- Puede subir 5 archivos.
- Puede generar track.
- Puede ver todo el track.
- Puede completar Unidad 1 y Unidad 2.
- No puede acceder a Unidad 3+.
- No puede acceder a simulacros.
- No puede acceder a Modo Emergencia.
- No puede acceder a readiness avanzado.

Premium:

- Acceso completo para ese examen.
- O acceso para 3 exámenes.
- O acceso por semestre.

Tabla `access_purchases` define acceso.

Middleware o server-side checks deben proteger rutas premium.

---

# 30. Estados vacíos

Crear estados vacíos lindos.

## Sin examen

Título:

**Todavía no tenés ningún track.**

Subtítulo:

**Creá tu primer examen y convertí tus apuntes en un camino de estudio.**

CTA:

**Crear track**

## Sin materiales

Título:

**Tu track necesita materiales.**

Subtítulo:

**Subí apuntes, PDFs o resúmenes para crear tus lecciones y ejercicios.**

CTA:

**Subir materiales**

## Sin exámenes anteriores

Título:

**No agregaste exámenes anteriores.**

Subtítulo:

**No es obligatorio, pero si los tenés podemos crear simulacros más parecidos a cómo suelen tomar.**

CTA:

**Agregar examen anterior**

---

# 31. Estados de error

Errores importantes:

- Falló upload.
- Archivo no soportado.
- PDF sin texto.
- Falló análisis IA.
- Falló generación del track.
- Falló pago.
- Webhook pendiente.
- Sesión expirada.

Los errores deben ser claros y humanos.

Ejemplo:

```txt
No pudimos leer este archivo.
Probá subirlo como PDF con texto seleccionable o pegá el contenido manualmente.

```

---

# 32. Performance y costos IA

No generar todo innecesariamente.

Estrategia:

1. Generar topic map.
2. Generar track structure.
3. Generar primeras unidades completas.
4. Generar unidades premium on-demand o al desbloquear.
5. Cachear ejercicios.
6. Guardar todo en Supabase.
7. No llamar IA en cada render.

Para demo/MVP, se puede generar todo upfront si el tamaño es razonable.

---

# 33. Copywriting general

Tono:

- Motivador.
- Claro.
- Directo.
- Joven.
- No excesivamente infantil.
- No académico aburrido.
- No demasiado formal.

Ejemplos:

- “Hoy te toca esto.”
- “Vas bien.”
- “Este tema está flojo.”
- “Este ejercicio se parece bastante a los parciales que subiste.”
- “Desbloqueaste la siguiente unidad.”
- “Te quedan 8 días. Vamos a priorizar.”
- “No hace falta estudiar todo igual. Hay temas que pesan más.”

Evitar:

- “Estimado usuario.”
- “Sistema de aprendizaje adaptativo basado en inteligencia artificial.”
- “Optimización curricular algorítmica.”
- Jerga innecesaria.

---

# 34. Legal/product disclaimers

Incluir disclaimer discreto:

```txt
StudyTrack te ayuda a organizar y practicar tu estudio, pero no garantiza una nota específica. Los resultados dependen de tu preparación, materiales y desempeño real en el examen.

```

En exámenes anteriores:

```txt
La similitud es una estimación. Usá los exámenes anteriores como referencia, no como predicción exacta.

```

---

# 35. Acceptance criteria

La app está bien construida si:

1. El usuario puede registrarse.
2. El usuario puede completar onboarding.
3. El usuario puede crear un examen.
4. El usuario puede subir al menos 5 archivos.
5. El usuario puede subir exámenes anteriores.
6. El usuario puede asignar similarity score 1–10 a cada examen anterior.
7. La app genera un track visual completo.
8. El track tiene unidades, nodos y estados.
9. Unidad 1 y Unidad 2 son gratis.
10. Unidad 3+ está bloqueada como premium.
11. El usuario puede hacer lecciones textuales.
12. El usuario recibe feedback inmediato.
13. El usuario debe aprobar para desbloquear el siguiente nodo.
14. Si falla, ve retry.
15. El readiness score aparece en el track.
16. Existe paywall.
17. Mercado Pago Checkout Pro crea una preferencia.
18. El pago aprobado desbloquea premium.
19. PostHog registra eventos clave.
20. El deploy funciona en Vercel.
21. La UI se ve mobile-first y muy pulida.
22. No hay mascota.
23. No hay logo ni assets de terceros.
24. La app se siente como un learning path gamificado, no como dashboard SaaS.

---

# 36. Non-goals para MVP

No construir ahora:

- App mobile nativa.
- Voz.
- Audio.
- Speech-to-text.
- Comunidad.
- Ranking social.
- Profesores.
- Panel institucional.
- Marketplace de apuntes.
- Integración Google Calendar.
- WhatsApp reminders.
- Notificaciones push.
- OCR perfecto avanzado.
- Editor colaborativo.
- Chat complejo con PDFs.
- Modo grupos.
- Biblioteca pública de materias.

Todo eso puede venir después.

---

# 37. Prioridad de implementación

Orden recomendado:

## Fase 1 — Base

1. Next.js project.
2. Tailwind/shadcn.
3. Supabase.
4. Auth.
5. DB schema.
6. Landing.
7. Onboarding.
8. Upload.

## Fase 2 — Track

1. Crear examen.
2. Procesar mock materials.
3. Generar track demo.
4. Learning path UI.
5. Estados de nodos.
6. Lecciones.
7. Ejercicios.
8. Quiz.
9. Unlock logic.

## Fase 3 — AI

1. Extract text.
2. Topic map.
3. Past exam analysis.
4. Track generation.
5. Exercise generation.
6. Readiness score.

## Fase 4 — Monetización

1. Paywall.
2. Pricing.
3. Mercado Pago Checkout Pro.
4. Webhooks.
5. Access control.

## Fase 5 — Analytics y polish

1. PostHog.
2. Empty states.
3. Error states.
4. Loading states.
5. Mobile polish.
6. Seed demo.
7. Deploy.

---

# 38. Agent breakdown para orquestador

Dividir agentes así:

## Agent 1 — Product Architect

Responsable de:

- Revisar alcance.
- Definir entidades.
- Asegurar que el flujo sea coherente.
- Mantener foco en MVP.
- Evitar features innecesarias.

## Agent 2 — Database/Supabase

Responsable de:

- Crear schema.
- RLS policies.
- Storage buckets.
- Auth profiles.
- Access control.
- Seed data.

## Agent 3 — UI/Design System

Responsable de:

- Paleta.
- Componentes base.
- Botones.
- Cards.
- Track nodes.
- Mobile shell.
- Onboarding UI.
- Paywall UI.

## Agent 4 — Onboarding

Responsable de:

- Flujo paso a paso.
- Validaciones.
- Estado.
- Persistencia.
- Upload materials.
- Upload past exams.
- Similarity slider.

## Agent 5 — Learning Track

Responsable de:

- Pantalla principal.
- Units.
- Nodes.
- Locked/unlocked.
- Daily challenge.
- Premium nodes.
- Progress.

## Agent 6 — Exercises

Responsable de:

- Renderizador de ejercicios.
- Multiple choice.
- Fill blank.
- Matching.
- Ordering.
- True/false.
- Classification.
- Short case.
- Feedback.
- Quiz result.

## Agent 7 — AI Pipeline

Responsable de:

- Prompts estructurados.
- Source analysis.
- Past exam analysis.
- Topic generation.
- Track generation.
- Exercise generation.
- Readiness score.

## Agent 8 — Payments

Responsable de:

- Mercado Pago Checkout Pro.
- Create preference.
- Success/failure/pending pages.
- Webhook.
- Access purchase.
- Paywall unlock.

## Agent 9 — Analytics

Responsable de:

- PostHog setup.
- Event tracking.
- Funnels.
- Properties.
- Debug.

## Agent 10 — QA/Polish

Responsable de:

- Mobile testing.
- Empty states.
- Error states.
- Loading states.
- Design consistency.
- Broken flows.
- Final deploy readiness.

---

# 39. Final product feeling

La app tiene que sentirse así:

El usuario entra con ansiedad porque tiene un examen.

Sube sus materiales.

Sube exámenes anteriores si tiene.

La app analiza todo.

En vez de darle un documento largo, le da un camino visual.

El usuario ve:

- “Hoy hacé esto.”
- “Después desbloqueás esto.”
- “Estos temas importan más.”
- “Tu preparación está en 42%.”
- “Este simulacro se parece bastante a los parciales anteriores.”
- “Te quedan 8 días.”
- “Si querés el plan completo, desbloquealo para este examen.”

La app debe sentirse como un entrenador que te lleva de la mano hasta rendir.

No debe sentirse como una herramienta pasiva.

Debe tener una experiencia adictiva, simple y visual, donde estudiar sea una secuencia clara de pasos.

El usuario no debería preguntarse “¿qué hago ahora?”.

Siempre debe haber un próximo paso evidente.

---

# 40. Resumen final

Construir **StudyTrack**, una app web mobile-first para preparar exámenes desde materiales propios.

Core:

- Onboarding personalizado.
- Upload de apuntes.
- Upload opcional de exámenes anteriores.
- Similarity score 1–10 por examen anterior.
- Análisis IA de materiales.
- Análisis IA de patrones de exámenes anteriores.
- Track vertical gamificado.
- Unidades, lecciones, quizzes y repasos.
- Ejercicios solo textuales.
- Desbloqueo por aprobación.
- Readiness score 0–100.
- Unidad 1 y 2 gratis.
- Unidad 3+ premium.
- Pago por examen con Mercado Pago.
- Supabase DB/Auth/Storage.
- PostHog analytics.
- Deploy Vercel.
- OpenAI server-side.

La prioridad absoluta es que la experiencia principal sea el camino de aprendizaje. Todo lo demás existe para alimentar, personalizar y monetizar ese camino.

---

# 41. Lecciones aprendidas y errores conocidos (OBLIGATORIO LEER ANTES DE CONSTRUIR)

Esta app ya se construyó una vez con este mismo prompt. Durante ese build y en producción aparecieron todos los errores listados abajo. **Cada uno de estos puntos es una regla a aplicar desde el día 1, no algo a descubrir de nuevo.**

## 41.1 OpenAI y pipeline de IA (la mayor fuente de errores)

- **Usar un modelo mini (barato y rápido), nunca el más nuevo/caro.** Ver sección 4.1. Verificar el modelo disponible contra `/v1/models` y configurarlo vía env var `OPENAI_MODEL`.
- **El modelo devuelve JSON malformado o texto plano con frecuencia.** Aunque se use `json_schema strict`, hubo que encadenar varios fixes en producción. Implementar desde el inicio:
  - `response_format: json_object` para generación de lecciones (más confiable que `json_schema strict` con schemas grandes).
  - Un parser tolerante (`parseModelJson()`): intentar `JSON.parse` directo, luego extraer bloques ```json fenced```, luego extraer el primer `{...}` balanceado.
  - Retry automático ante `SyntaxError`/JSON inválido (al menos 1 reintento).
  - Instrucción explícita en el prompt: "Respondé ÚNICAMENTE con JSON válido, sin texto adicional".
- **Respetar `maxDuration: 60` de Vercel.** Generar 21 lecciones en un solo request excede el límite siempre. Diseñar el pipeline para **una unidad de trabajo por request**: el endpoint genera 1 lección y devuelve `hasMore: true`; el cliente (pantalla "Analizando") hace loop hasta `hasMore: false`. Nunca usar `Promise.all` masivo dentro de un request.
- **Dividir la generación de cada lección en 2 llamadas separadas:** una para el contenido de texto (`content` + `summary`) y otra para los ejercicios. Un solo JSON gigante con todo falla mucho más.
- **Limitar la cantidad de ejercicios por generación:** daily challenge 4–5 ejercicios (no 8), mock exam 6–8 (no 10–15). JSONs grandes fallan más.
- **BUG BLOQUEANTE que llegó a producción — shapes de ejercicios interactivos:** el prompt le decía al modelo que `matching`/`classification` usaran `options` como array plano de strings, pero el renderer esperaba `{left, right}` para matching y `{items, categories}` para classification. Resultado: ejercicios con instrucciones visibles pero sin ítems clickeables, imposibles de completar, que **rompían el track** (no se podía desbloquear el siguiente nodo). Reglas:
  - El contrato de shapes JSON entre prompt de IA ↔ schema ↔ parser ↔ renderer ↔ evaluador debe ser **una única fuente de verdad** (tipos compartidos en TypeScript).
  - El prompt debe incluir **ejemplos JSON completos y obligatorios por cada tipo de ejercicio**.
  - Implementar un **validador server-side por tipo de ejercicio** (`validate-exercise.ts`) que corra antes de persistir: nunca guardar un ejercicio inválido en la DB. Si falla la validación, 1 retry; si vuelve a fallar, descartar ese ejercicio.
  - Fallback de UI: si a pesar de todo un ejercicio llega roto, mostrar "Este ejercicio no se pudo cargar" con botón **Saltar**, para que el track nunca quede trabado.
- **`correct_answer` debe tener un wrapper tipado** `{ kind, data }` consistente entre prompt y evaluador, no tipos sueltos por ejercicio.
- **Ejercicios sin `options` (fill_blank, fill_sentence, short_case):** el renderer debe tener fallback a `<input type="text">` + botón Confirmar cuando no hay opciones. En el primer build quedaron botones vacíos imposibles de responder.
- **Si la IA no detecta temas**, devolver error 400 claro ("No se detectaron temas en tus materiales"), no un OK vacío.
- **El onboarding con IA real tarda 5–8 minutos.** Mostrar progreso por lección en la pantalla de análisis, no un spinner genérico.
- **Instrumentar los fallos del pipeline server-side** (evento `analysis_failed` / `capturePipelineFailure` en los catch de los route handlers) para tener visibilidad en PostHog cuando la IA falla.

## 41.2 Supabase

- **El texto pegado (sin archivo) debe procesarse desde `raw_text` directamente.** En producción, el pipeline exigía `storage_path` y el flujo "Pegar texto" fallaba con "No hay chunks procesados". Solo ir a Storage si hay `storage_path`.
- **Nunca sobrescribir `raw_text` con mensajes de error.** El catch de errores pisaba el material del usuario con `"ERROR: <mensaje>"`, perdiéndolo. Usar `processing_status` + log separado para errores; el contenido del usuario es intocable.
- **Permitir reprocesar fuentes con chunks inválidos:** detectar chunks corruptos (que empiezan con "ERROR:" o son demasiado cortos, <50 chars) y reprocesar fuentes marcadas `completed` que no tengan chunks válidos, y fuentes en `error` que tengan `raw_text` usable.
- **RLS en tablas hijas sin `user_id` directo** (`past_exam_questions`, `source_chunks`): usar policies con `EXISTS` vía join a `exams`, con `(select auth.uid())`. Validar con los security advisors de Supabase.
- **Revocar `EXECUTE` a `anon`/`authenticated` en funciones `SECURITY DEFINER`** (`handle_new_user()`, etc.). Los advisors lo marcan como vulnerabilidad.
- **El seed debe respetar el schema real:** no asumir `user_id` en tablas hijas (borrar por `exam_id` primero) y usar **fechas locales** (no `toISOString()` que es UTC) para `daily_activity`, o el streak sale mal (mostraba 2 en vez de 3).
- **En el seed demo, marcar el daily challenge como `completed`** en `lesson_progress`, o su estado pendiente bloquea el nodo "current" del track y el camino queda trabado.

## 41.3 Track vertical (UI crítica)

- **El bottom nav tapaba los nodos inferiores del track e interceptaba sus clicks.** Usar padding inferior generoso en la página del track (mínimo `pb-32`, no `pb-24`).
- **La lógica de desbloqueo debe garantizar siempre exactamente un nodo "current" claro.** El daily challenge pendiente competía con la lección siguiente y dejaba el track sin nodo actual.
- **Headers sticky con fondo 100% opaco.** Un header semi-transparente hacía que el contenido scrolleable se viera "fantasma" por detrás.
- **Probar el track completo end-to-end** (scrollear de punta a punta, clickear cada tipo de nodo, completar una lección y verificar que se desbloquea el siguiente nodo) en viewport mobile 390×844 antes de dar por terminado.
- **El track nunca puede quedar trabado por contenido roto:** ver validación de ejercicios en 41.1 y el fallback de "Saltar".

## 41.4 Mercado Pago

- **`auto_return: "approved"` solo funciona con `back_urls` HTTPS.** En localhost, Mercado Pago devuelve error y el checkout da 500. Incluir `auto_return` solo si `APP_URL.startsWith("https://")`.
- **El webhook no puede disparar la generación de contenido premium server-side** porque los endpoints de generación requieren cookie de sesión. Solución: generación lazy/on-demand desde `/checkout/success` (client-side, con polling del status del pago y loader "Estamos generando tus unidades premium…").
- **Validación de firma del webhook:** no hacer `Buffer.from(v1, "hex")` (falla con el formato real de MP); comparar strings directamente con `timingSafeEqual`.
- **Actualizar `NEXT_PUBLIC_APP_URL` a la URL real de Vercel después del primer deploy** (el alias real puede ser distinto al nombre del proyecto, ej: `studytrack-lemon.vercel.app`). Es crítico para `back_urls` y `notification_url`.
- El webhook con pago real aprobado quedó sin verificar al 100% en el primer build: dejarlo probado con un pago de prueba real si es posible.

## 41.5 Build, deploy y entorno (Windows + Vercel)

- **Excluir `remotion/` (o cualquier subproyecto) del typecheck de Next** en `tsconfig.json` (`"exclude": ["node_modules", "remotion"]`), o el build de Vercel falla.
- **`create-next-app` no corre en un directorio no vacío:** scaffoldear en carpeta temporal y mergear al root preservando los archivos existentes.
- **CLI de shadcn: usar flags no interactivos** (`--yes`, etc.); el prompt interactivo cuelga al agente.
- **Next.js 16: el file convention `middleware` está deprecado; usar `proxy`.** Leer la documentación en `node_modules/next/dist/docs/` antes de escribir código.
- **En Windows/PowerShell:** no usar HEREDOC bash para commits (usar comillas simples de PowerShell); cargar env vars de Vercel de a una con `cmd /c vercel env add ... --yes --force`, no en batch de PowerShell; verificar el scope/team correcto de Vercel (`vercel teams ls`) antes de `vercel link`.
- **Hydration mismatch:** el año dinámico `new Date().getFullYear()` en el footer causa mismatch SSR/cliente; usar `suppressHydrationWarning` o valor estático.
- **No renderizar dos composiciones de Remotion en paralelo en Windows** (CPU thrashing); render secuencial.
- **Mantener `env.example` completo y sincronizado** con todas las variables reales: Supabase, OpenAI (`OPENAI_API_KEY`, `OPENAI_MODEL`), Mercado Pago (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_NOTIFICATION_URL`), PostHog (`NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`), `NEXT_PUBLIC_APP_URL`, feature flags.

## 41.6 PostHog

- Configurar el **proxy `/ingest`** en `next.config.ts` (rewrites a `us.i.posthog.com` + `skipTrailingSlashRedirect: true`).
- **Verificar que `onboarding_completed` realmente se dispare** en el flujo completo de producción (en el primer build nunca llegó — gap de instrumentación en el paso final).
- Instrumentar fallos del pipeline server-side (ver 41.1) y monitorear el ratio `analysis_failed` vs `analysis_completed` después del deploy.
- `checkout_success` y `premium_unlocked` solo se pueden verificar con un pago real; no considerarlo bug.

## 41.7 Checklist de QA obligatorio antes de dar por terminado

1. Onboarding completo end-to-end **con el pipeline de IA real** (no solo con seed demo), incluyendo el flujo "Pegar texto".
2. Completar una lección generada por IA con **todos los tipos de ejercicio** (especialmente matching, classification y ordering) y verificar que el siguiente nodo se desbloquea.
3. Track completo scrolleado y clickeado en viewport mobile 390×844: ningún nodo tapado, ningún nodo muerto, un solo "current" claro.
4. Checkout de Mercado Pago con redirect completo en browser (no solo la API de preferencia).
5. Eventos clave de PostHog visibles en el proyecto: `onboarding_completed`, `track_generated`, `lesson_completed`, `paywall_seen`.
6. Build de Vercel verde con `NEXT_PUBLIC_APP_URL` apuntando al alias real.
7. Security advisors de Supabase sin errores (RLS + SECURITY DEFINER).