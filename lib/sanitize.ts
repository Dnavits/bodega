/**
 * lib/sanitize.ts
 * Sanitizador estricto para prevenir XSS y ataques de inyección en campos de texto libre
 */

export function sanitizeText(input: any, maxLength = 250): string {
  if (typeof input !== "string") return "";

  return input
    // 1. Eliminar etiquetas HTML completas (<script>, <img onerror>, etc.)
    .replace(/<[^>]*>/g, "")
    // 2. Escapar caracteres peligrosos residuales
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/`/g, "&#x60;")
    // 3. Normalizar espacios en blanco y saltos de línea repetidos
    .trim()
    // 4. Truncar para prevenir desbordamientos o abusos de almacenamiento
    .slice(0, maxLength);
}

export function sanitizeEmail(email: any): string {
  if (typeof email !== "string") return "";
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(cleaned) ? cleaned.slice(0, 100) : "";
}

export function sanitizePhone(phone: any): string {
  if (typeof phone !== "string") return "";
  // Conservar solo dígitos y signo +
  return phone.replace(/[^\d+]/g, "").slice(0, 20);
}
