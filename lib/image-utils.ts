/**
 * Helper client-side image processing utility.
 * Resizes and compresses images to the recommended dimensions.
 */

export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  keepAspect?: boolean;
}

export const IMAGE_SPECS = {
  producto: {
    label: "Foto de Producto",
    recommended: "800 x 800 px (Cuadrado 1:1, máx 2MB)",
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
  },
  logo: {
    label: "Logo de la Tienda",
    recommended: "400 x 120 px (Horizontal, transparente, máx 1MB)",
    maxWidth: 400,
    maxHeight: 120,
    quality: 0.9,
    keepAspect: true,
  },
  favicon: {
    label: "Favicon / Ícono",
    recommended: "64 x 64 px (Cuadrado 1:1, máx 500KB)",
    maxWidth: 64,
    maxHeight: 64,
    quality: 0.9,
  },
} as const;

export function processImageFile(
  file: File,
  spec: { maxWidth: number; maxHeight: number; quality?: number; keepAspect?: boolean }
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("El archivo seleccionado no es una imagen válida."));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let targetWidth = spec.maxWidth;
        let targetHeight = spec.maxHeight;

        if (spec.keepAspect) {
          const ratio = Math.min(spec.maxWidth / img.width, spec.maxHeight / img.height);
          targetWidth = Math.round(img.width * ratio);
          targetHeight = Math.round(img.height * ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo procesar el lienzo de la imagen."));

        // Fondo transparente para PNG o blanco para JPEG
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Exportar a WebP si es compatible, o JPEG/PNG
        const outputFormat = file.type === "image/png" ? "image/png" : "image/webp";
        const dataUrl = canvas.toDataURL(outputFormat, spec.quality || 0.85);

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Error al leer la imagen."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al abrir el archivo."));
    reader.readAsDataURL(file);
  });
}
