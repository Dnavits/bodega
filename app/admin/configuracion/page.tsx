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
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerAnuncio, setBannerAnuncio] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [whatsappPedidos, setWhatsappPedidos] = useState("");

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
      setLogoUrl(config.logo_url || "");
      setBannerAnuncio(config.banner_anuncio || "");
      setTelefonoContacto(config.telefono_contacto || "");
      setWhatsappPedidos(config.whatsapp_pedidos || "");
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
        logo_url: logoUrl.trim() || null,
        banner_anuncio: bannerAnuncio.trim() || null,
        telefono_contacto: telefonoContacto.trim() || null,
        whatsapp_pedidos: whatsappPedidos.trim() || null,
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
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-light">
          Seguridad & Configuración
        </span>
        <h1 className="font-roboto font-black text-2xl sm:text-3xl text-foam mt-1">
          Ajustes de Bodega & Lista Blanca de Admins
        </h1>
        <p className="text-xs text-vault-100/60 mt-1">
          Controla qué correos tienen permiso de acceder al panel y modifica los banners de la tienda pública.
        </p>
      </div>

      {/* SECCIÓN 1: LISTA BLANCA DE CORREOS PARA EL DASHBOARD */}
      <div className="bg-vault-900 border border-vault-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
            <ShieldAdminIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-roboto font-bold text-lg text-foam">
              Lista Blanca de Administradores (Whitelist)
            </h2>
            <p className="text-xs text-vault-100/50">
              Solo los usuarios que inicien sesión con estos correos (sea con Google o correo) podrán entrar a modificar la página.
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
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foam placeholder-vault-100/30 outline-none"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Nombre o Rol (Ej: Gerente, Bodeguero)"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foam placeholder-vault-100/30 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Autorizar</span>
            </button>
          </div>
        </form>

        {/* Tabla de Administradores Autorizados */}
        <div className="overflow-x-auto border border-vault-800/80 rounded-2xl bg-vault-950">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-vault-800 text-vault-100/50 uppercase tracking-wider bg-vault-900/60">
                <th className="p-3.5">Correo Electrónico</th>
                <th className="p-3.5">Nombre / Rol</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-800/60">
              {whitelist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-vault-100/40">
                    No hay correos en la lista blanca aún. Agrega el tuyo arriba.
                  </td>
                </tr>
              ) : (
                whitelist.map((admin) => (
                  <tr key={admin.id} className="hover:bg-vault-900/40 transition-colors">
                    <td className="p-3.5 font-bold text-foam font-mono">
                      {admin.email}
                    </td>
                    <td className="p-3.5 text-vault-100/70">{admin.nombre || "Admin"}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald/20 text-emerald-light border border-emerald/30">
                        Acceso Total
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => eliminarAdminWhitelist(admin.id, admin.email)}
                        className="px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
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
        className="bg-vault-900 border border-vault-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-vault-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-light flex items-center justify-center font-bold">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-roboto font-bold text-lg text-foam">
              Ajustes de la Tienda Pública
            </h2>
            <p className="text-xs text-vault-100/50">
              Modifica los textos informativos y enlaces de atención.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Banner Superior */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Texto del Banner de Anuncio Superior
            </label>
            <input
              type="text"
              value={bannerAnuncio}
              onChange={(e) => setBannerAnuncio(e.target.value)}
              placeholder="Ej: 🍻 Envíos fríos en menos de 45 min en Medellín · Bebidas heladas"
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none"
            />
          </div>

          {/* WhatsApp de Pedidos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Número de WhatsApp para Pedidos (con código de país)
            </label>
            <input
              type="text"
              value={whatsappPedidos}
              onChange={(e) => setWhatsappPedidos(e.target.value)}
              placeholder="573019519391"
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none"
            />
          </div>

          {/* Teléfono de Contacto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Teléfono de Llamadas / Contacto
            </label>
            <input
              type="text"
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              placeholder="3019519391"
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none"
            />
          </div>

          {/* URL del Logo */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              URL del Logo Personalizado (Opcional)
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none"
            />
            {logoUrl && (
              <div className="mt-3 p-3 bg-vault-950 border border-vault-800 rounded-xl inline-block">
                <span className="text-[10px] text-vault-100/40 block mb-1">Vista Previa:</span>
                <img src={logoUrl} alt="Vista previa logo" className="h-10 w-auto rounded" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-60 shadow-lg"
        >
          {guardando ? "Guardando..." : "Guardar Ajustes de la Tienda"}
        </button>
      </form>
    </div>
  );
}
