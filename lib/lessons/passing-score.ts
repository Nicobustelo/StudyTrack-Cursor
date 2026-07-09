/** Threshold de aprobación — spec 14: 70% default, 80% si nota objetivo 9/10. */
export function getPassingScore(targetGrade: string | null | undefined): number {
  if (targetGrade === "9" || targetGrade === "10") return 80;
  return 70;
}

export function computeScorePercent(
  correct: number,
  total: number,
  skipped = 0,
): number {
  if (total === 0) return 0;
  const answered = total - skipped;
  if (answered === 0) return 0;
  return Math.round((correct / answered) * 100);
}

export function didPass(
  scorePercent: number,
  targetGrade: string | null | undefined,
): boolean {
  return scorePercent >= getPassingScore(targetGrade);
}

/** XP simple: base por aprobar + bonus por score. */
export function computeXp(scorePercent: number, passed: boolean): number {
  if (!passed) return Math.max(5, Math.round(scorePercent / 10));
  return 20 + Math.round(scorePercent / 5);
}
