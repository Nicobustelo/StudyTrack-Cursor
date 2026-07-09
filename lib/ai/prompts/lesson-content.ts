export const LESSON_CONTENT_OUTPUT_SCHEMA = `{
  "title": "string",
  "summary": "string corto para preview",
  "content": "string en markdown breve, párrafos cortos, sin walls of text"
}`;

export function buildLessonContentPrompts(input: {
  subjectName: string;
  topicTitle: string;
  lessonTitle: string;
  lessonType: string;
  sourceChunks: string[];
  targetGrade: string | null;
}): { system: string; user: string } {
  const system = `Sos un tutor de StudyTrack. Generás el contenido de una lección breve y clara en español.
No garantices qué va a entrar en el examen. Usá lenguaje motivador y directo.
Máximo 400 palabras en content.

Schema de salida:
${LESSON_CONTENT_OUTPUT_SCHEMA}`;

  const user = `Materia: ${input.subjectName}
Tema: ${input.topicTitle}
Lección: ${input.lessonTitle}
Tipo: ${input.lessonType}
Nota objetivo: ${input.targetGrade ?? "no especificada"}

Material de referencia:
${input.sourceChunks.map((c, i) => `--- ${i + 1} ---\n${c}`).join("\n\n")}`;

  return { system, user };
}
