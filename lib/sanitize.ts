/**
 * lib/sanitize.ts
 * Motor estricto de sanitización para prevenir XSS (Cross-Site Scripting),
 * inyecciones de scripts, esquemas javascript: maliciosos y desbordamientos.
 */

// 1. Sanitizador para texto público (elimina HTML y escapa entidades)
export function sanitizeText(input: any, maxLength = 250): string {
  if (typeof input !== "string") return "";

  return input
    // Eliminar etiquetas HTML completas (<script>, <img onerror>, etc.)
    .replace(/<[^>]*>/g, "")
    // Escapar caracteres peligrosos residuales
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/`/g, "&#x60;")
    .trim()
    .slice(0, maxLength);
}

// 2. Sanitizador para textos de catálogo y panel administrativo:
// Elimina cualquier etiqueta HTML, scripts o manejadores de eventos (onload, onclick),
// pero conserva comillas y acentos naturales ("Pack x 6", Cerveza, etc.)
export function stripHtml(input: any, maxLength = 1000): string {
  if (typeof input !== "string") return "";

  return input
    // Eliminar todas las etiquetas HTML <tag ...>
    .replace(/<[^>]*>/g, "")
    // Neutralizar esquemas de ejecución javascript: o vbscript:
    .replace(/(javascript|vbscript|data):/gi, "")
    // Neutralizar manejadores de eventos DOM inyectados (onmouseover=, onerror=, etc.)
    .replace(/\bon\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLength);
}

// 3. Sanitizador estricto de URLs para imágenes, logos, favicons y enlaces
// Solo permite protocolos seguros https://, http:// o rutas relativas /...
export function sanitizeUrl(url: any): string {
  if (typeof url !== "string") return "";
  const cleaned = url.trim();
  if (!cleaned) return "";

  // Bloquear de raíz javascript:, vbscript:, data:
  if (/^(javascript|vbscript|data):/i.test(cleaned)) {
    return "";
  }

  // Permitir URLs https://, http:// o relativas que inicien con /
  if (/^(https?:\/\/|\/)/i.test(cleaned)) {
    return cleaned.slice(0, 500);
  }

  return "";
}

// 4. Sanitizador de correos electrónicos
export function sanitizeEmail(email: any): string {
  if (typeof email !== "string") return "";
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(cleaned) ? cleaned.slice(0, 100) : "";
}

// 5. Sanitizador de teléfonos
export function sanitizePhone(phone: any): string {
  if (typeof phone !== "string") return "";
  // Conservar solo dígitos, espacios, guiones y signo +
  return phone.replace(/[^\d+\s-]/g, "").slice(0, 25);
}
