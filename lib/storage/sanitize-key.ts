/**
 * Sanitiza nombres de archivo para claves de Supabase Storage.
 * Evita "Invalid key" por tildes, espacios, barras o caracteres especiales.
 */
export function sanitizeStorageFileName(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop() ?? "file";
  const withoutAccents = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const safe = withoutAccents
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);

  return safe || "file";
}

export function buildStudyMaterialStoragePath(
  userId: string,
  examId: string,
  fileName: string,
  subfolder?: string,
): string {
  const safeName = sanitizeStorageFileName(fileName);
  const prefix = subfolder ? `${subfolder}/` : "";
  return `${userId}/${examId}/${prefix}${Date.now()}-${safeName}`;
}
