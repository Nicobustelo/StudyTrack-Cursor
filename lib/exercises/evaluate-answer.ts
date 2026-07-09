import type { CorrectAnswer, Exercise } from "./types";

/** Respuesta del usuario — mismo shape discriminado que correct_answer + skipped. */
export type UserAnswer =
  | { kind: "option_index"; data: number }
  | { kind: "text"; data: string }
  | { kind: "pairs"; data: Array<{ left: number; right: number }> }
  | { kind: "order"; data: number[] }
  | { kind: "boolean"; data: boolean }
  | { kind: "assignments"; data: Array<{ item: number; category: number }> }
  | { kind: "skipped"; data: null };

export function normalizeAnswerText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function textMatches(userText: string, accepted: string[]): boolean {
  const normalized = normalizeAnswerText(userText);
  return accepted.some((a) => normalizeAnswerText(a) === normalized);
}

function pairsEqual(
  a: Array<{ left: number; right: number }>,
  b: Array<{ left: number; right: number }>,
): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.left - y.left || x.right - y.right);
  const sortedB = [...b].sort((x, y) => x.left - y.left || x.right - y.right);
  return sortedA.every(
    (p, i) => p.left === sortedB[i].left && p.right === sortedB[i].right,
  );
}

function orderEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function assignmentsEqual(
  a: Array<{ item: number; category: number }>,
  b: Array<{ item: number; category: number }>,
): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.item - y.item);
  const sortedB = [...b].sort((x, y) => x.item - y.item);
  return sortedA.every(
    (p, i) =>
      p.item === sortedB[i].item && p.category === sortedB[i].category,
  );
}

export function evaluateAnswer(
  correct: CorrectAnswer,
  user: UserAnswer,
): boolean {
  if (user.kind === "skipped") return false;

  switch (correct.kind) {
    case "option_index":
      return (
        user.kind === "option_index" && user.data === correct.data
      );
    case "text":
      return user.kind === "text" && textMatches(user.data, correct.data);
    case "pairs":
      return (
        user.kind === "pairs" && pairsEqual(user.data, correct.data)
      );
    case "order":
      return user.kind === "order" && orderEqual(user.data, correct.data);
    case "boolean":
      return user.kind === "boolean" && user.data === correct.data;
    case "assignments":
      return (
        user.kind === "assignments" &&
        assignmentsEqual(user.data, correct.data)
      );
    default:
      return false;
  }
}

export function evaluateExercise(
  exercise: Exercise,
  user: UserAnswer,
): boolean {
  return evaluateAnswer(exercise.correct_answer, user);
}
