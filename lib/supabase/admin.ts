import { createServiceClient } from "./server";

/** Alias para webhooks y jobs que requieren bypass de RLS. */
export function createAdminClient() {
  return createServiceClient();
}
