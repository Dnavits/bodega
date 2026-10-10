"use client";

import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { PlusIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { CATEGORIA_LABELS } from "@/lib/constants";

export type ProductoBodega = {
  id:                string;
  nombre:            string;
  descripcion?:      string;
  precio:            number;
  precio_comparacion?: number;
  imagenes:          string[];
  categoria:         string;
  stock:             number;
  activo?:           boolean;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80";

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return (
    <span className="bg-danger-soft text-danger text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
      Agotado
    </span>
  );
  if (stock <= 10) return (
    <span className="bg-warning-soft text-warning text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
      ¡Últimas {stock}!
    </span>
  );
  return (
    <span className="bg-mint text-emerald text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
      Disponible
    </span>
  );
}

/* ── Modal de detalle con galería ── */
function ProductModal({
  producto,
  onClose,
  onAdd,
  added,
}: {
  producto: ProductoBodega;
  onClose: () => void;
  onAdd: () => void;
  added: boolean;
}) {
  const imagenes = (producto.imagenes?.filter(Boolean) ?? []);
  if (imagenes.length === 0) imagenes.push(DEFAULT_IMAGE);

  const [activeIdx, setActiveIdx] = useState(0);
  const [imgError, setImgError] = useState<boolean[]>(new Array(imagenes.length).fill(false));

  const agotado = (producto.stock ?? 0) <= 0;

  const catLabel =
    CATEGORIA_LABELS[producto.categoria?.toLowerCase() as keyof typeof CATEGORIA_LABELS] ||
    producto.categoria;

  const prev = useCallback(() => setActiveIdx(i => (i - 1 + imagenes.length) % imagenes.length), [imagenes.length]);
  const next = useCallback(() => setActiveIdx(i => (i + 1) % imagenes.length), [imagenes.length]);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && imagenes.length > 1) prev();
      if (e.key === "ArrowRight" && imagenes.length > 1) next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, imagenes.length]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={producto.nombre}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-canvas rounded-2xl shadow-card-hover overflow-hidden flex flex-col sm:flex-row max-h-[92vh]">

        {/* ── Galería izquierda ── */}
        <div className="bg-surface sm:w-[44%] shrink-0 flex flex-col p-4 gap-3">

          {/* Imagen principal con bordes redondeados */}
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-canvas border border-hairline flex items-center justify-center">
            <img
              src={imgError[activeIdx] ? DEFAULT_IMAGE : imagenes[activeIdx]}
              alt={`${producto.nombre} — foto ${activeIdx + 1}`}
              onError={() => setImgError(prev => { const n = [...prev]; n[activeIdx] = true; return n; })}
              className="w-full h-full object-contain p-4 transition-opacity duration-300"
            />

            {/* Flechas de navegación (solo si hay más de 1) */}
            {imagenes.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-canvas/90 border border-hairline shadow-card flex items-center justify-center text-ink hover:bg-surface transition-colors"
                  aria-label="Foto anterior"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-canvas/90 border border-hairline shadow-card flex items-center justify-center text-ink hover:bg-surface transition-colors"
                  aria-label="Foto siguiente"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {imagenes.length > 1 && (
            <div className="flex gap-2 justify-center">
              {imagenes.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    i === activeIdx
                      ? "border-accent shadow-portrait"
                      : "border-hairline opacity-55 hover:opacity-100"
                  }`}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <img
                    src={imgError[i] ? DEFAULT_IMAGE : img}
                    alt={`Miniatura ${i + 1}`}
                    className="w-full h-full object-contain p-1 bg-surface"
                    onError={() => setImgError(prev => { const n = [...prev]; n[i] = true; return n; })}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info derecha ── */}
        <div className="flex flex-col flex-1 overflow-y-auto">

          {/* Categoría + Stock */}
          <div className="px-6 pt-6 pb-0 flex items-center gap-2 flex-wrap">
            <span className="bg-sky text-accent text-[10px] font-bold uppercase tracking-eyebrow px-2.5 py-1 rounded-tag">
              {catLabel}
            </span>
            <span className="text-ink-faint text-xs">·</span>
            <StockBadge stock={producto.stock} />
            {imagenes.length > 1 && (
              <>
                <span className="text-ink-faint text-xs">·</span>
                <span className="text-[10px] text-ink-faint font-medium">{imagenes.length} fotos</span>
              </>
            )}
          </div>

          {/* Nombre + Precio */}
          <div className="px-6 pt-3 pb-4 border-b border-divider">
            <h2 className="font-inter font-black text-xl sm:text-[22px] text-ink leading-tight mb-3">
              {producto.nombre}
            </h2>
            <div className="flex items-baseline gap-2.5">
              <span className="font-inter font-black text-2xl text-ink">
                ${producto.precio.toLocaleString("es-CO")}
              </span>
              {producto.precio_comparacion && producto.precio_comparacion > producto.precio && (
                <span className="text-sm text-ink-faint line-through font-medium">
                  ${producto.precio_comparacion.toLocaleString("es-CO")}
                </span>
              )}
              {producto.precio_comparacion && producto.precio_comparacion > producto.precio && (
                <span className="text-[11px] font-bold text-emerald bg-mint px-2 py-0.5 rounded-tag">
                  {Math.round((1 - producto.precio / producto.precio_comparacion) * 100)}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <div className="px-6 py-4 border-b border-divider">
              <p className="text-sm text-ink-muted leading-relaxed">
                {producto.descripcion}
              </p>
            </div>
          )}

          {/* Block de detalles del producto (stock info) */}
          <div className="px-6 py-4 flex-1">
            <div className="rounded-xl border border-hairline bg-surface divide-y divide-divider overflow-hidden">
              {producto.stock > 0 && (
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="w-5 h-5 rounded-full bg-emerald/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald block" />
                  </span>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    <strong className="text-ink">Stock disponible:</strong>{" "}
                    {producto.stock <= 10
                      ? `Últimas ${producto.stock} unidades disponibles.`
                      : `${producto.stock} unidades en inventario.`}
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-accent block" />
                </span>
                <p className="text-xs text-ink-muted leading-relaxed">
                  <strong className="text-ink">Categoría:</strong>{" "}
                  {catLabel}
                </p>
              </div>
              {producto.precio_comparacion && producto.precio_comparacion > producto.precio && (
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-warning block" />
                  </span>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    <strong className="text-ink">Precio especial:</strong>{" "}
                    Ahorra ${(producto.precio_comparacion - producto.precio).toLocaleString("es-CO")} en este producto.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-6 pb-6 pt-2 space-y-2 border-t border-divider">
            <button
              type="button"
              onClick={onAdd}
              disabled={agotado}
              className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                agotado
                  ? "bg-surface text-ink-faint border border-hairline"
                  : added
                  ? "bg-emerald text-white shadow-portrait"
                  : "bg-ink hover:bg-ink-light text-white shadow-portrait"
              }`}
            >
              {agotado
                ? "Sin stock disponible"
                : added
                ? "¡Agregado al carrito!"
                : <><PlusIcon className="w-4 h-4" /> Agregar al Carrito</>}
            </button>
            <button
              onClick={onClose}
              className="w-full text-xs text-ink-faint hover:text-ink transition-colors py-1"
            >
              Seguir viendo el catálogo
            </button>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-canvas border border-hairline shadow-card flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface transition-colors"
          aria-label="Cerrar"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>

  );
}

/* ── Tarjeta de producto ── */
export function ProductCard({ producto }: { producto: ProductoBodega }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const imagenes = producto.imagenes?.filter(Boolean) ?? [];
  const mainImg = imagenes[0] || DEFAULT_IMAGE;
  const [imgSrc, setImgSrc] = useState(mainImg);

  const agotado = (producto.stock ?? 0) <= 0;
  const tieneVariasImagenes = imagenes.length > 1;

  const catLabel =
    CATEGORIA_LABELS[producto.categoria?.toLowerCase() as keyof typeof CATEGORIA_LABELS] ||
    producto.categoria;

  function handleAdd() {
    if (agotado) return;
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: imgSrc,
      stock: producto.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <article className="group bg-canvas rounded-card border border-hairline shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col min-w-0 overflow-hidden">

        {/* ── Imagen (clickeable para abrir modal) ── */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="relative aspect-[4/3] bg-surface overflow-hidden flex items-center justify-center focus:outline-none"
          aria-label={`Ver fotos y detalles de ${producto.nombre}`}
        >
          <img
            src={imgSrc}
            alt={producto.nombre}
            onError={() => setImgSrc(DEFAULT_IMAGE)}
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay sutil al hover */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />

          {/* Badge "múltiples fotos" */}
          {tieneVariasImagenes && (
            <span className="absolute bottom-2.5 right-2.5 bg-ink/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-tag flex items-center gap-1">
              <span className="opacity-80">1/{imagenes.length}</span>
            </span>
          )}

          {/* Badge categoría */}
          <div className="absolute top-3 left-3">
            <span className="bg-canvas/90 backdrop-blur-sm text-ink-muted text-[10px] font-semibold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag border border-hairline">
              {catLabel}
            </span>
          </div>

          {/* Badge stock */}
          <div className="absolute top-3 right-3">
            <StockBadge stock={producto.stock} />
          </div>
        </button>

        {/* ── Cuerpo ── */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-inter font-semibold text-sm text-ink group-hover:text-accent transition-colors line-clamp-1">
              {producto.nombre}
            </h3>
            {producto.descripcion && (
              <p className="mt-0.5 text-xs text-ink-faint line-clamp-1 leading-relaxed">
                {producto.descripcion}
              </p>
            )}
          </div>

          {/* ── Precio + Botón Agregar (estilo de la imagen 3) ── */}
          <div className="mt-3 pt-3 border-t border-divider flex items-center justify-between gap-2">
            <div>
              <p className="font-inter font-black text-base text-ink leading-none">
                ${producto.precio.toLocaleString("es-CO")}
              </p>
              {producto.precio_comparacion && producto.precio_comparacion > producto.precio && (
                <p className="text-xs text-ink-faint line-through mt-0.5">
                  ${producto.precio_comparacion.toLocaleString("es-CO")}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={agotado}
              className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-btn text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed shrink-0 ${
                agotado
                  ? "bg-surface text-ink-faint border border-hairline text-[11px]"
                  : added
                  ? "bg-emerald text-white"
                  : "bg-ink hover:bg-ink-light text-white"
              }`}
            >
              {agotado
                ? "Agotado"
                : added
                ? "¡Listo!"
                : <><PlusIcon className="w-3 h-3" /> Agregar</>}
            </button>
          </div>

          {/* ── Link "Ver fotos & detalles" ── */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-2.5 w-full text-[11px] text-ink-faint hover:text-accent transition-colors font-medium text-center py-1"
          >
            Ver fotos & detalles
          </button>
        </div>
      </article>

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          producto={producto}
          onClose={() => setModalOpen(false)}
          onAdd={() => { handleAdd(); }}
          added={added}
        />
      )}
    </>
  );
}
