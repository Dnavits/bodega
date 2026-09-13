"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { PaletteIcon, PlusIcon, TrashIcon } from "@/components/Icons";
import { processImageFile, IMAGE_SPECS } from "@/lib/image-utils";


function formatearHora12h(hora24: string): string {
  if (!hora24) return "";
  const [hStr, mStr] = hora24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return hora24;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

function generarTextoDias(dias: string[]): string {
  if (!dias || dias.length === 0) return "Cerrado temporalmente";
  const ordenSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const diasOrdenados = ordenSemana.filter((d) => dias.includes(d));

  if (diasOrdenados.length === 7) return "Lunes a Domingo";
  if (diasOrdenados.length === 6 && !diasOrdenados.includes("Domingo")) return "Lunes a Sábado";
  if (diasOrdenados.length === 5 && !diasOrdenados.includes("Sábado") && !diasOrdenados.includes("Domingo")) return "Lunes a Viernes";
  if (diasOrdenados.length === 2 && diasOrdenados.includes("Sábado") && diasOrdenados.includes("Domingo")) return "Sábados y Domingos";

  const indices = diasOrdenados.map((d) => ordenSemana.indexOf(d));
  let esContinuo = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      esContinuo = false;
      break;
    }
  }

  if (esContinuo && diasOrdenados.length >= 3) {
    return `${diasOrdenados[0]} a ${diasOrdenados[diasOrdenados.length - 1]}`;
  }

  if (diasOrdenados.length === 1) return `Solo ${diasOrdenados[0]}`;
  if (diasOrdenados.length === 2) return `${diasOrdenados[0]} y ${diasOrdenados[1]}`;

  return diasOrdenados.join(", ");
}

function calcularHorarioDescriptivo(dias: string[], inicio: string, fin: string): string {
  const textoDias = generarTextoDias(dias);
  if (dias.length === 0) return textoDias;
  if (!inicio || !fin) return textoDias;
  const horaInicio12 = formatearHora12h(inicio);
  const horaFin12 = formatearHora12h(fin);
  return `${textoDias}: ${horaInicio12} - ${horaFin12}`;
}

export default function AdminPersonalizacion() {
  const supabase = createClient();
  const [configId, setConfigId] = useState<any>(null);

  // Identidad
  const [nombreBodega, setNombreBodega] = useState("Bodega Dnavits");
  const [subtituloBodega, setSubtituloBodega] = useState("Licores & Bebidas Heladas");
  const [tituloPestana, setTituloPestana] = useState("");
  const [bannerAnuncio, setBannerAnuncio] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Hero Portada
  const [heroBadge, setHeroBadge] = useState("DOMICILIOS EXPRESS · MEDELLÍN");
  const [heroTitulo, setHeroTitulo] = useState("Tus bebidas heladas,");
  const [heroSubtituloRainbow, setHeroSubtituloRainbow] = useState("en minutos");
  const [heroDescripcion, setHeroDescripcion] = useState(
    "Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta. Precios directos, sin intermediarios, siempre fríos."
  );
  const [heroFeatures, setHeroFeatures] = useState<string[]>([
    "⚡ Entrega en <45 min",
    "❄️ Siempre frío",
    "💳 Nequi · Efectivo · Transferencia",
  ]);
  const [nuevaFeature, setNuevaFeature] = useState("");

  // WhatsApp Flotante
  const [mostrarWhatsappFlotante, setMostrarWhatsappFlotante] = useState(true);

  // Horario
  const [horarioTexto, setHorarioTexto] = useState("Lunes a Domingo: 9:00 AM - 11:00 PM");
  const [horarioInicio, setHorarioInicio] = useState("09:00");
  const [horarioFin, setHorarioFin] = useState("23:00");
  const [horarioDias, setHorarioDias] = useState<string[]>(["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]);

  // Estados UI
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  async function cargarDatos() {
    try {
      const { data: config } = await supabase
        .from("configuracion")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (config) {
        setConfigId(config.id);
        if (config.nombre_bodega) setNombreBodega(config.nombre_bodega);
        if (config.subtitulo_bodega) setSubtituloBodega(config.subtitulo_bodega);
        if (config.titulo_pestana) setTituloPestana(config.titulo_pestana);
        if (config.banner_anuncio) setBannerAnuncio(config.banner_anuncio);
        if (config.logo_url) setLogoUrl(config.logo_url);
        if (config.favicon_url) setFaviconUrl(config.favicon_url);

        if (config.hero_badge) setHeroBadge(config.hero_badge);
        if (config.hero_titulo) setHeroTitulo(config.hero_titulo);
        if (config.hero_subtitulo_rainbow) setHeroSubtituloRainbow(config.hero_subtitulo_rainbow);
        if (config.hero_descripcion) setHeroDescripcion(config.hero_descripcion);

        if (Array.isArray(config.hero_features) && config.hero_features.length > 0) {
          setHeroFeatures(config.hero_features);
        }

        if (config.mostrar_whatsapp_flotante !== undefined) {
          setMostrarWhatsappFlotante(config.mostrar_whatsapp_flotante !== false);
        }
        if (config.horario_texto) setHorarioTexto(config.horario_texto);
        if (config.horario_inicio) setHorarioInicio(config.horario_inicio);
        if (config.horario_fin) setHorarioFin(config.horario_fin);
        if (config.horario_dias) setHorarioDias(config.horario_dias);
      }
    } catch (err: any) {
      console.error("Error al cargar personalización:", err);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejo de archivo para Logo
  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processImageFile(file, IMAGE_SPECS.logo);
      setLogoUrl(processed);
      setMensaje("✓ Logo cargado. Haz clic en Guardar Cambios para aplicar.");
    } catch (err: any) {
      setError(err.message || "Error al procesar el logo.");
    }
  }

  // Manejo de archivo para Favicon
  async function handleFaviconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processImageFile(file, IMAGE_SPECS.favicon);
      setFaviconUrl(processed);
      setMensaje("✓ Favicon cargado a 64x64 px. Haz clic en Guardar Cambios para aplicar.");
    } catch (err: any) {
      setError(err.message || "Error al procesar el favicon.");
    }
  }

  // Agregar feature pill
  function agregarFeature() {
    if (!nuevaFeature.trim()) return;
    setHeroFeatures([...heroFeatures, nuevaFeature.trim()]);
    setNuevaFeature("");
  }

  // Eliminar feature pill
  function eliminarFeature(index: number) {
    setHeroFeatures(heroFeatures.filter((_, i) => i !== index));
  }

  // Manejadores reactivos para cálculo automático del horario
  function handleCambioHoraInicio(nuevoInicio: string) {
    setHorarioInicio(nuevoInicio);
    setHorarioTexto(calcularHorarioDescriptivo(horarioDias, nuevoInicio, horarioFin));
  }

  function handleCambioHoraFin(nuevoFin: string) {
    setHorarioFin(nuevoFin);
    setHorarioTexto(calcularHorarioDescriptivo(horarioDias, horarioInicio, nuevoFin));
  }

  function handleToggleDia(dia: string) {
    const nuevosDias = horarioDias.includes(dia)
      ? horarioDias.filter((d) => d !== dia)
      : [...horarioDias, dia];
    setHorarioDias(nuevosDias);
    setHorarioTexto(calcularHorarioDescriptivo(nuevosDias, horarioInicio, horarioFin));
  }

  function regenerarHorarioAuto() {
    setHorarioTexto(calcularHorarioDescriptivo(horarioDias, horarioInicio, horarioFin));
  }

  async function guardarPersonalizacion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    // Obtener ID actual de la fila para usar UPDATE (permitido por RLS)
    let targetId = configId;
    if (targetId === null || targetId === undefined) {
      const { data: cur } = await supabase
        .from("configuracion")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (cur) {
        targetId = cur.id;
        setConfigId(cur.id);
      }
    }

    const payload: any = {
      nombre_bodega: nombreBodega.trim() || "Bodega Dnavits",
      subtitulo_bodega: subtituloBodega.trim() || "Licores & Bebidas Heladas",
      titulo_pestana: tituloPestana.trim() || null,
      banner_anuncio: bannerAnuncio.trim() || null,
      logo_url: logoUrl.trim() || null,
      favicon_url: faviconUrl.trim() || null,
      hero_badge: heroBadge.trim() || "DOMICILIOS EXPRESS · MEDELLÍN",
      hero_titulo: heroTitulo.trim() || "Tus bebidas heladas,",
      hero_subtitulo_rainbow: heroSubtituloRainbow.trim() || "en minutos",
      hero_descripcion: heroDescripcion.trim() || "",
      hero_features: heroFeatures,
      mostrar_whatsapp_flotante: mostrarWhatsappFlotante,
      horario_texto: horarioTexto.trim() || "Lunes a Domingo: 9:00 AM - 11:00 PM",
      horario_inicio: horarioInicio.trim() || "09:00",
      horario_fin: horarioFin.trim() || "23:00",
      horario_dias: horarioDias,
    };

    let updateError: any = null;

    if (targetId !== null && targetId !== undefined) {
      const res = await supabase
        .from("configuracion")
        .update(payload)
        .eq("id", targetId);
      updateError = res.error;

      // Si falla por columnas que aún no existen en la base de datos, reintentar sin las columnas nuevas
      if (updateError && updateError.message?.includes("column")) {
        const fallback = { ...payload };
        delete fallback.horario_texto;
        delete fallback.horario_inicio;
        delete fallback.horario_fin;
        delete fallback.horario_dias;
        const retry = await supabase.from("configuracion").update(fallback).eq("id", targetId);
        updateError = retry.error;
      }
    } else {
      // Si la fila aún no existe, insertar
      const res = await supabase.from("configuracion").insert(payload).select().single();
      updateError = res.error;
      if (res.data) setConfigId(res.data.id);
    }

    setGuardando(false);

    if (updateError) {
      setError("No se pudo guardar la personalización: " + updateError.message);
      return;
    }

    setMensaje("✓ ¡Personalización guardada con éxito! Los cambios ya son visibles en la tienda.");
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Encabezado */}
      <div>
        <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
          Diseño &amp; Apariencia
        </span>
        <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
          Personalización de la Tienda
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Modifica los títulos, textos de portada, etiquetas del hero y visibilidad de botones en tiempo real.
        </p>
      </div>



      <form onSubmit={guardarPersonalizacion} className="space-y-8">
        {/* BLOQUE 1: IDENTIDAD Y PESTAÑA DEL NAVEGADOR */}
        <div className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center gap-3 border-b border-divider pb-4">
            <div className="w-10 h-10 rounded-card bg-sky text-accent flex items-center justify-center font-bold">
              <PaletteIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-inter font-bold text-base text-ink">
                1. Identidad de Marca &amp; Pestaña del Navegador
              </h2>
              <p className="text-xs text-ink-muted">
                Controla el nombre visible, el título SEO de la pestaña y el banner superior.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre de la Bodega */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Nombre de la Bodega (Barra de Navegación y Footer)
              </label>
              <input
                type="text"
                value={nombreBodega}
                onChange={(e) => setNombreBodega(e.target.value)}
                placeholder="Ej: Postobón Supia"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
              />
            </div>

            {/* Subtítulo bajo el Nombre de la Bodega */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Subtítulo / Lema (Bajo el nombre en la barra superior)
              </label>
              <input
                type="text"
                value={subtituloBodega}
                onChange={(e) => setSubtituloBodega(e.target.value)}
                placeholder="Ej: Licores & Bebidas Heladas"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
              />
            </div>

            {/* Título de la Pestaña */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Título Completo de la Pestaña del Navegador (SEO)
              </label>
              <input
                type="text"
                value={tituloPestana}
                onChange={(e) => setTituloPestana(e.target.value)}
                placeholder="Ej: Postobón Supia | Bebidas frías a domicilio"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                Si lo dejas vacío, se genera automáticamente: &quot;[Nombre] | Gaseosas, Cervezas, Aguas...&quot;
              </p>
            </div>

            {/* Banner de Anuncio Superior */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Texto del Banner de Anuncio Superior (Barra negra superior)
              </label>
              <input
                type="text"
                value={bannerAnuncio}
                onChange={(e) => setBannerAnuncio(e.target.value)}
                placeholder="Ej: 🍻 Envíos fríos en menos de 45 min en Medellín · Bebidas heladas"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
              />
            </div>

            {/* Logo de la Tienda */}
            <div className="p-4 bg-surface border border-hairline rounded-card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-eyebrow text-ink">
                    Logo de la Tienda
                  </label>
                  <p className="text-[10px] text-accent font-semibold">
                    {IMAGE_SPECS.logo.recommended}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="bg-canvas border border-hairline text-ink text-xs font-bold px-3 py-1.5 rounded-btn shadow-subtle hover:bg-surface"
                >
                  📁 Subir Archivo
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFile}
                  className="hidden"
                />
              </div>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="O pega URL (https://...)"
                className="w-full bg-canvas border border-hairline rounded-input px-3 py-1.5 text-xs text-ink outline-none"
              />
              {logoUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <img src={logoUrl} alt="Logo" className="h-8 max-w-[140px] object-contain rounded" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="text-[11px] text-danger hover:underline"
                  >
                    Quitar logo
                  </button>
                </div>
              )}
            </div>

            {/* Favicon de la Página */}
            <div className="p-4 bg-surface border border-hairline rounded-card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-eyebrow text-ink">
                    Favicon (Ícono de la Pestaña)
                  </label>
                  <p className="text-[10px] text-accent font-semibold">
                    {IMAGE_SPECS.favicon.recommended}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  className="bg-canvas border border-hairline text-ink text-xs font-bold px-3 py-1.5 rounded-btn shadow-subtle hover:bg-surface"
                >
                  📁 Subir Archivo
                </button>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconFile}
                  className="hidden"
                />
              </div>
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="O pega URL (https://...)"
                className="w-full bg-canvas border border-hairline rounded-input px-3 py-1.5 text-xs text-ink outline-none"
              />
              {faviconUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <img src={faviconUrl} alt="Favicon" className="w-6 h-6 object-contain rounded" />
                  <button
                    type="button"
                    onClick={() => setFaviconUrl("")}
                    className="text-[11px] text-danger hover:underline"
                  >
                    Quitar favicon
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BLOQUE 2: HERO Y TEXTOS PRINCIPALES DE LA PORTADA */}
        <div className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center gap-3 border-b border-divider pb-4">
            <div className="w-10 h-10 rounded-card bg-sky text-accent flex items-center justify-center font-bold">
              <span className="text-base">🚀</span>
            </div>
            <div>
              <h2 className="font-inter font-bold text-base text-ink">
                2. Textos Principales del Hero (Portada)
              </h2>
              <p className="text-xs text-ink-muted">
                Modifica el titular, la palabra con gradiente arcoíris, la descripción y las etiquetas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Eyebrow Badge */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Insignia Superior del Hero
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                placeholder="Ej: DOMICILIOS EXPRESS · MEDELLÍN"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
              />
            </div>

            {/* Titular Principal & Palabra Rainbow */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                  Titular Principal
                </label>
                <input
                  type="text"
                  value={heroTitulo}
                  onChange={(e) => setHeroTitulo(e.target.value)}
                  placeholder="Ej: Tus bebidas heladas,"
                  className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-accent mb-1.5">
                  Palabra / Frase Destacada (Arcoíris)
                </label>
                <input
                  type="text"
                  value={heroSubtituloRainbow}
                  onChange={(e) => setHeroSubtituloRainbow(e.target.value)}
                  placeholder="Ej: en minutos"
                  className="w-full bg-canvas border border-accent rounded-input px-4 py-2.5 text-sm text-ink font-bold outline-none"
                />
              </div>
            </div>

            {/* Descripción del Hero */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Descripción / Subtítulo del Hero
              </label>
              <textarea
                rows={2}
                value={heroDescripcion}
                onChange={(e) => setHeroDescripcion(e.target.value)}
                placeholder="Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta..."
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2 text-xs sm:text-sm text-ink outline-none resize-none"
              />
            </div>

            {/* Feature Pills (Modificar, Eliminar o Agregar Nuevos) */}
            <div className="p-4 bg-surface border border-hairline rounded-card space-y-3">
              <label className="block text-xs font-bold uppercase tracking-eyebrow text-ink">
                Etiquetas de Confianza / Características (Pills)
              </label>
              <p className="text-[11px] text-ink-faint">
                Puedes agregar, editar o eliminar los distintivos que aparecen debajo de la descripción.
              </p>

              {/* Lista actual de pills */}
              <div className="space-y-2">
                {heroFeatures.map((feat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...heroFeatures];
                        updated[index] = e.target.value;
                        setHeroFeatures(updated);
                      }}
                      className="flex-1 bg-canvas border border-hairline rounded-input px-3 py-1.5 text-xs text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarFeature(index)}
                      className="p-1.5 text-danger hover:bg-danger-soft rounded-lg transition-colors"
                      title="Eliminar etiqueta"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulario para agregar nuevo pill */}
              <div className="flex gap-2 pt-2 border-t border-divider">
                <input
                  type="text"
                  placeholder="Ej: 🚀 Entregas en Supia y alrededores"
                  value={nuevaFeature}
                  onChange={(e) => setNuevaFeature(e.target.value)}
                  className="flex-1 bg-canvas border border-hairline rounded-input px-3 py-1.5 text-xs text-ink outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarFeature();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={agregarFeature}
                  className="bg-ink hover:bg-ink-light text-white text-xs font-bold px-3.5 py-1.5 rounded-btn shadow-portrait flex items-center gap-1 transition-all"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE: HORARIO DE ATENCION */}
        <div className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center gap-3 border-b border-divider pb-4">
            <div className="w-10 h-10 rounded-card bg-sky text-accent flex items-center justify-center font-bold">
              <span className="text-base">⏰</span>
            </div>
            <div>
              <h2 className="font-inter font-bold text-base text-ink">
                Horario de Atención
              </h2>
              <p className="text-xs text-ink-muted">
                Configura los días y horas de servicio. El texto descriptivo se genera automáticamente al cambiar las horas o los días.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Hora de apertura
              </label>
              <input
                type="time"
                value={horarioInicio}
                onChange={(e) => handleCambioHoraInicio(e.target.value)}
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Hora de cierre
              </label>
              <input
                type="time"
                value={horarioFin}
                onChange={(e) => handleCambioHoraFin(e.target.value)}
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted">
                  Días de atención
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const todos = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
                      setHorarioDias(todos);
                      setHorarioTexto(calcularHorarioDescriptivo(todos, horarioInicio, horarioFin));
                    }}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    Todos los días
                  </button>
                  <span className="text-ink-faint">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      const lunVie = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
                      setHorarioDias(lunVie);
                      setHorarioTexto(calcularHorarioDescriptivo(lunVie, horarioInicio, horarioFin));
                    }}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    Lunes a Viernes
                  </button>
                  <span className="text-ink-faint">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      const fines = ["Viernes","Sábado","Domingo"];
                      setHorarioDias(fines);
                      setHorarioTexto(calcularHorarioDescriptivo(fines, horarioInicio, horarioFin));
                    }}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    Fines de semana
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((dia) => {
                  const seleccionado = horarioDias.includes(dia);
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => handleToggleDia(dia)}
                      className={`px-3.5 py-1.5 rounded-btn text-xs font-semibold transition-all border ${
                        seleccionado
                          ? "bg-ink text-white border-ink shadow-subtle"
                          : "bg-surface text-ink-muted border-hairline hover:bg-canvas hover:text-ink"
                      }`}
                    >
                      {seleccionado ? `✓ ${dia}` : dia}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 pt-2 border-t border-divider">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted">
                  Texto descriptivo del horario (Visible en el pie de página)
                </label>
                <button
                  type="button"
                  onClick={regenerarHorarioAuto}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                  title="Recalcular texto automáticamente según las horas y días seleccionados"
                >
                  <span>✨ Regenerar texto automático</span>
                </button>
              </div>
              <input
                type="text"
                value={horarioTexto}
                onChange={(e) => setHorarioTexto(e.target.value)}
                placeholder="Ej: Lunes a Domingo: 9:00 AM - 11:00 PM"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
              />
              <p className="text-[11px] text-ink-faint mt-1">
                Se sincroniza en tiempo real según las horas y días elegidos. Si lo deseas, también puedes personalizar el texto directamente.
              </p>
            </div>

            {/* Vista previa en vivo del pie de página */}
            <div className="md:col-span-2 p-3.5 bg-surface border border-hairline rounded-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🕒</span>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-eyebrow">
                    Vista previa en el Footer
                  </p>
                  <p className="text-xs font-bold text-ink">
                    {horarioTexto || "Sin horario configurado"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-[10px] font-bold bg-mint text-emerald border border-emerald/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                Sincronizado
              </span>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: BOTONES Y CANALES FLOTANTES */}
        <div className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-divider pb-4">
            <div className="w-10 h-10 rounded-card bg-emerald-soft text-emerald flex items-center justify-center font-bold">
              <span className="text-base">💬</span>
            </div>
            <div>
              <h2 className="font-inter font-bold text-base text-ink">
                3. Canales de Contacto Flotantes
              </h2>
              <p className="text-xs text-ink-muted">
                Controla la visibilidad de los botones fijados en pantalla.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-surface border border-hairline rounded-card">
            <div>
              <p className="text-xs font-bold text-ink">Botón Flotante de Pedir por WhatsApp</p>
              <p className="text-[11px] text-ink-faint">
                El botón verde que aparece fijo en la esquina inferior derecha de la pantalla.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarWhatsappFlotante}
                onChange={(e) => setMostrarWhatsappFlotante(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald"></div>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-card text-danger text-xs font-medium">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3.5 bg-emerald-soft border border-emerald/20 rounded-card text-emerald text-xs font-medium">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="px-8 py-3.5 bg-ink hover:bg-ink-light text-white font-bold rounded-btn text-sm shadow-portrait transition-all active:scale-95 disabled:opacity-60"
        >
          {guardando ? "Guardando Cambios..." : "Guardar Personalización en Vivo"}
        </button>
      </form>
    </div>
  );
}
