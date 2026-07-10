import { daysUntilExam } from "./constants";
import type { OnboardingState } from "./types";

export function getContextualFeedback(
  step: number,
  state: OnboardingState,
  value?: string,
): string | null {
  switch (step) {
    case 2:
      return null;
    case 3:
      if (value === "Universidad") {
        return "Perfecto, vamos a armar un plan a nivel universitario.";
      }
      if (value === "Secundario") {
        return "Genial, adaptamos el plan a tu nivel de secundaria.";
      }
      return null;
    case 5:
      if (state.subjectName?.trim()) {
        return `${state.subjectName.trim()} — buena elección, las materias con mucha práctica son ideales para un plan de estudio.`;
      }
      return null;
    case 7:
      if (state.examDate) {
        const days = daysUntilExam(state.examDate);
        if (days < 3) {
          return `Te quedan ${days} días. Activamos recomendaciones de Modo emergencia.`;
        }
        return `Te quedan ${days} días. Es tiempo suficiente si arrancamos hoy.`;
      }
      return null;
    case 8:
      if (value === "9" || value === "10") {
        return "Ambicioso. Vamos a subir la exigencia de los quizzes.";
      }
      if (value === "aprobar") {
        return "Enfocamos el plan en lo esencial para aprobar.";
      }
      return null;
    case 9:
      if (state.availableMinutesPerDay === 120) {
        return "Con 2 horas por día podemos cubrir mucho terreno.";
      }
      if (state.availableMinutesPerDay === 20) {
        return "Con sesiones cortas pero constantes también se avanza.";
      }
      return null;
    case 11:
      if (value === "No empecé") {
        return "Tranquilo, el plan arranca desde cero.";
      }
      if (value === "Solo necesito practicar") {
        return "Perfecto, vamos directo a ejercicios y simulacros.";
      }
      return null;
    default:
      return null;
  }
}

export function getStepTitle(step: number, state: OnboardingState): string {
  switch (step) {
    case 5:
      return "¿Qué materia vas a rendir?";
    case 7:
      return state.subjectName
        ? `¿Cuándo rendís ${state.subjectName}?`
        : "¿Cuándo rendís?";
    default:
      return "";
  }
}
