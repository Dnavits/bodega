"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SettingsIcon, PlusIcon, TrashIcon, ShieldAdminIcon } from "@/components/Icons";

type WhitelistUser = {
  id: string;
  email: string;
  nombre?: string;
  activo: boolean;
  created_at: string;
};

export default function AdminConfiguracion() {
  const supabase = createClient();
  const [nombreBodega, setNombreBodega] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [bannerAnuncio, setBannerAnuncio] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [whatsappPedidos, setWhatsappPedidos] = useState("");
  const [direccionBodega, setDireccionBodega] = useState("");
  const [costoDomicilio, setCostoDomicilio] = useState("5000");
  const [pedidoMinimo, setPedidoMinimo] = useState("20000");

  // Lista Blanca
  const [whitelist, setWhitelist] = useState<WhitelistUser[]>([]);
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargarDatos() {
    const { data: config } = await supabase
      .from("configuracion")
      .select("*")
      .eq("id", true)
      .single();

    if (config) {
      setNombreBodega(config.nombre_bodega || "Bodega Dnavits");
      setLogoUrl(config.logo_url || "");
      setFaviconUrl(config.favicon_url || "");
      setBannerAnuncio(config.banner_anuncio || "");
      setTelefonoContacto(config.telefono_contacto || "");
      setWhatsappPedidos(config.whatsapp_pedidos || "");
      setDireccionBodega(config.direccion_bodega || "");
      setCostoDomicilio(config.costo_domicilio?.toString() || "5000");
      setPedidoMinimo(config.pedido_minimo?.toString() || "20000");
    }

    const { data: whiteData } = await supabase
      .from("admin_whitelist")
      .select("*")
      .order("created_at", { ascending: false });

    setWhitelist(whiteData || []);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function guardarConfiguracion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    const { error: updateError } = await supabase
      .from("configuracion")
      .update({
        nombre_bodega: nombreBodega.trim() || "Bodega Dnavits",
        logo_url: logoUrl.trim() || null,
        favicon_url: faviconUrl.trim() || null,
        banner_anuncio: bannerAnuncio.trim() || null,
        telefono_contacto: telefonoContacto.trim() || null,
        whatsapp_pedidos: whatsappPedidos.trim() || null,
        direccion_bodega: direccionBodega.trim() || null,
        costo_domicilio: parseInt(costoDomicilio, 10) || 0,
        pedido_minimo: parseInt(pedidoMinimo, 10) || 0,
      })
      .eq("id", true);

    setGuardando(false);

    if (updateError) {
      setError("No se pudo guardar la configuración: " + updateError.message);
      return;
    }

    setMensaje("✓ Configuración de la bodega actualizada correctamente.");
  }

  async function agregarAdminWhitelist(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoEmail.trim() || !nuevoEmail.includes("@")) {
      alert("Ingresa un correo electrónico válido.");
      return;
    }

    const { error: insertError } = await supabase
      .from("admin_whitelist")
      .insert([
        {
          email: nuevoEmail.trim().toLowerCase(),
          nombre: nuevoNombre.trim() || "Administrador Autorizado",
          activo: true,
        },
      ]);

    if (insertError) {
      alert("Error al agregar a lista blanca: " + insertError.message);
    } else {
      setNuevoEmail("");
      setNuevoNombre("");
      cargarDatos();
    }
  }

  async function eliminarAdminWhitelist(id: string, email: string) {
    if (!confirm(`¿Deseas retirar a "${email}" de la lista blanca de administradores?`)) return;

    const { error: delError } = await supabase
      .from("admin_whitelist")
      .delete()
      .eq("id", id);

    if (delError) {
      alert("Error al eliminar: " + delError.message);
    } else {
      cargarDatos();
    }
  }

  return (
    <div className="space-y-10">
      {/* Encabezado */}
      <div>
        <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
          Seguridad &amp; Configuración
        </span>
        <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
          Ajustes de Bodega &amp; Lista Blanca
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Controla qué correos tienen permiso de acceder al panel y modifica la información pública de la tienda.
        </p>
      </div>

      {/* SECCIÓN 1: LISTA BLANCA DE CORREOS PARA EL DASHBOARD */}
      <div className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-card bg-sky text-accent flex items-center justify-center font-bold">
            <ShieldAdminIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-inter font-bold text-base text-ink">
              Lista Blanca de Administradores (Whitelist)
            </h2>
            <p className="text-xs text-ink-muted">
              Los usuarios que inicien sesión con estos correos tendrán acceso completo al panel de control.
            </p>
          </div>
        </div>

        {/* Formulario para agregar correo a la lista blanca */}
        <form onSubmit={agregarAdminWhitelist} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 pt-2">
          <div className="sm:col-span-6">
            <input
              type="email"
              placeholder="correo@gmail.com del nuevo admin"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2 text-xs sm:text-sm text-ink placeholder-ink-faint outline-none"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Nombre o Rol (Ej: Gerente, Bodeguero)"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2 text-xs sm:text-sm text-ink placeholder-ink-faint outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-ink hover:bg-ink-light text-white font-bold py-2 px-4 rounded-btn text-xs transition-all flex items-center justify-center gap-1.5 shadow-portrait"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Autorizar</span>
            </button>
          </div>
        </form>

        {/* Tabla de Administradores Autorizados */}
        <div className="overflow-x-auto border border-divider rounded-card bg-canvas">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-divider text-ink-faint uppercase tracking-eyebrow bg-surface">
                <th className="p-3 font-semibold">Correo Electrónico</th>
                <th className="p-3 font-semibold">Nombre / Rol</th>
                <th className="p-3 font-semibold">Estado</th>
                <th className="p-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {whitelist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-ink-faint">
                    No hay correos en la lista blanca aún. Agrega el tuyo arriba.
                  </td>
                </tr>
              ) : (
                whitelist.map((admin) => (
                  <tr key={admin.id} className="hover:bg-surface transition-colors">
                    <td className="p-3 font-bold text-ink font-mono">
                      {admin.email}
                    </td>
                    <td className="p-3 text-ink-muted">{admin.nombre || "Admin"}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-tag text-[10px] font-bold uppercase tracking-eyebrow bg-emerald-soft text-emerald border border-emerald/20">
                        Acceso Total
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => eliminarAdminWhitelist(admin.id, admin.email)}
                        className="px-2.5 py-1 rounded-btn text-danger hover:bg-danger-soft text-xs font-semibold transition-colors"
                      >
                        Retirar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: AJUSTES DE MARCA Y BANNERS */}
      <form
        onSubmit={guardarConfiguracion}
        className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-divider pb-4">
          <div className="w-10 h-10 rounded-card bg-sky text-accent flex items-center justify-center font-bold">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-inter font-bold text-base text-ink">
              Ajustes de la Tienda Pública
            </h2>
            <p className="text-xs text-ink-muted">
              Modifica los textos informativos, datos de contacto y valores de domicilio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre Bodega */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Nombre de la Bodega
            </label>
            <input
              type="text"
              value={nombreBodega}
              onChange={(e) => setNombreBodega(e.target.value)}
              placeholder="Bodega Dnavits"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* Banner Superior */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Texto del Banner de Anuncio Superior
            </label>
            <input
              type="text"
              value={bannerAnuncio}
              onChange={(e) => setBannerAnuncio(e.target.value)}
              placeholder="Ej: 🍻 Envíos fríos en menos de 45 min en Medellín · Bebidas heladas"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* WhatsApp de Pedidos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Número de WhatsApp para Pedidos (con código de país)
            </label>
            <input
              type="text"
              value={whatsappPedidos}
              onChange={(e) => setWhatsappPedidos(e.target.value)}
              placeholder="573019519391"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* Teléfono de Contacto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Teléfono de Llamadas / Contacto
            </label>
            <input
              type="text"
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              placeholder="3019519391"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Dirección de la Bodega
            </label>
            <input
              type="text"
              value={direccionBodega}
              onChange={(e) => setDireccionBodega(e.target.value)}
              placeholder="Medellín, Antioquia"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* Costo Domicilio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Costo de Domicilio ($ COP)
            </label>
            <input
              type="number"
              value={costoDomicilio}
              onChange={(e) => setCostoDomicilio(e.target.value)}
              placeholder="5000"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* Pedido Mínimo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Pedido Mínimo ($ COP)
            </label>
            <input
              type="number"
              value={pedidoMinimo}
              onChange={(e) => setPedidoMinimo(e.target.value)}
              placeholder="20000"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* URL Favicon */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              URL del Favicon (Opcional)
            </label>
            <input
              type="text"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
          </div>

          {/* URL del Logo */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              URL del Logo Personalizado (Opcional)
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
            {logoUrl && (
              <div className="mt-3 p-3 bg-surface border border-hairline rounded-card inline-block">
                <span className="text-[10px] text-ink-faint block mb-1">Vista Previa:</span>
                <img src={logoUrl} alt="Vista previa logo" className="h-10 w-auto rounded" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-soft border border-danger/20 rounded-card text-danger text-xs font-medium">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3 bg-emerald-soft border border-emerald/20 rounded-card text-emerald text-xs font-medium">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="px-8 py-3 bg-ink hover:bg-ink-light text-white font-bold rounded-btn text-sm shadow-portrait transition-all active:scale-95 disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar Ajustes de la Tienda"}
        </button>
      </form>
    </div>
  );
}
