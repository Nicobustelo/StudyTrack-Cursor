import { createAdminClient } from "@/lib/supabase/admin";

import type { PlanType } from "./payments/plans";

/** Unidades 1 y 2 son gratis; 3+ requieren premium (spec 17.1 / 29). */
export const FREE_UNIT_NUMBERS = new Set([1, 2]);

export type PremiumFeature =
  | "unit"
  | "mock_exam"
  | "emergency_mode"
  | "advanced_readiness"
  | "calibrated_tests";

export interface AccessCheckContext {
  userId: string;
  examId: string;
  unitNumber?: number;
  feature?: PremiumFeature;
}

interface ActiveAccessRow {
  id: string;
  exam_id: string | null;
  plan_type: string | null;
  status: string | null;
  starts_at: string | null;
  expires_at: string | null;
}

function isAccessRowActive(row: ActiveAccessRow, now = new Date()): boolean {
  if (row.status !== "active") return false;

  if (row.starts_at) {
    const startsAt = new Date(row.starts_at);
    if (startsAt > now) return false;
  }

  if (row.expires_at) {
    const expiresAt = new Date(row.expires_at);
    if (expiresAt <= now) return false;
  }

  return true;
}

function rowCoversExam(row: ActiveAccessRow, examId: string): boolean {
  if (row.plan_type === "semester") {
    return true;
  }

  return row.exam_id === examId;
}

async function fetchActiveAccessRows(
  userId: string,
): Promise<ActiveAccessRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("access_purchases")
    .select("id, exam_id, plan_type, status, starts_at, expires_at")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(`Failed to load access purchases: ${error.message}`);
  }

  return (data ?? []).filter((row) => isAccessRowActive(row));
}

/**
 * Verifica si el usuario tiene acceso premium activo para un examen.
 */
export async function hasExamPremiumAccess(
  userId: string,
  examId: string,
): Promise<boolean> {
  const rows = await fetchActiveAccessRows(userId);
  return rows.some((row) => rowCoversExam(row, examId));
}

/**
 * Verifica acceso a una unidad por número (1-based).
 */
export async function canAccessUnit(
  userId: string,
  examId: string,
  unitNumber: number,
): Promise<boolean> {
  if (FREE_UNIT_NUMBERS.has(unitNumber)) {
    return true;
  }

  return hasExamPremiumAccess(userId, examId);
}

/**
 * Verifica acceso a features premium del examen.
 */
export async function canAccessPremiumFeature(
  userId: string,
  examId: string,
  feature: PremiumFeature,
): Promise<boolean> {
  switch (feature) {
    case "unit":
      return true;
    case "mock_exam":
    case "emergency_mode":
    case "advanced_readiness":
    case "calibrated_tests":
      return hasExamPremiumAccess(userId, examId);
    default:
      return false;
  }
}

/**
 * Chequeo unificado server-side para rutas y componentes.
 */
export async function checkAccess(
  context: AccessCheckContext,
): Promise<{ allowed: boolean; reason?: string }> {
  const { userId, examId, unitNumber, feature } = context;

  if (unitNumber !== undefined) {
    const allowed = await canAccessUnit(userId, examId, unitNumber);
    if (!allowed) {
      return {
        allowed: false,
        reason: "Esta unidad requiere el plan premium.",
      };
    }
    return { allowed: true };
  }

  if (feature) {
    const allowed = await canAccessPremiumFeature(userId, examId, feature);
    if (!allowed) {
      return {
        allowed: false,
        reason: "Esta función requiere el plan premium.",
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function isFreeUnit(unitNumber: number): boolean {
  return FREE_UNIT_NUMBERS.has(unitNumber);
}

export function requiresPremiumUnit(unitNumber: number): boolean {
  return !isFreeUnit(unitNumber);
}

/** Duración del pack semestre en meses. */
export const SEMESTER_DURATION_MONTHS = 6;

export function computeAccessExpiry(planType: PlanType): string | null {
  if (planType !== "semester") {
    return null;
  }

  const expires = new Date();
  expires.setMonth(expires.getMonth() + SEMESTER_DURATION_MONTHS);
  return expires.toISOString();
}
