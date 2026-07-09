import type { PlanType } from "@/lib/payments/plans";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded";

export type AccessPurchaseStatus = "active" | "expired" | "cancelled";

export interface PaymentRecord {
  id: string;
  user_id: string;
  exam_id: string | null;
  plan_type: PlanType | null;
  provider: string;
  provider_payment_id: string | null;
  provider_preference_id: string | null;
  status: PaymentStatus | null;
  amount: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AccessPurchaseRecord {
  id: string;
  user_id: string;
  exam_id: string | null;
  plan_type: PlanType | null;
  status: AccessPurchaseStatus | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutPreferenceMetadata {
  user_id: string;
  exam_id: string;
  plan_type: PlanType;
  payment_id: string;
}
