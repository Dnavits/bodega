"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SettingsIcon, PlusIcon, ShieldAdminIcon, PaletteIcon } from "@/components/Icons";

type WhitelistUser = {
  id: string;
  email: string;
  nombre?: string;
  activo: boolean;
  created_at: string;
};

const SQL_MIGRATION_SCRIPT = `-- ==============================================================================
-- BODEGA DNAVITS: SOLUCIÓN INTEGRAL DE BASE DE DATOS Y PERMISOS RLS
-- ==============================================================================

-- 1. TABLA ADMIN WHITELIST
create table if not exists public.admin_whitelist (
  email text primary key,
  nombre text,
  activo boolean default true,
  created_at timestamptz default now()
);
alter table public.admin_whitelist enable row level security;
drop policy if exists "Lectura admin_whitelist" on public.admin_whitelist;
create policy "Lectura admin_whitelist" on public.admin_whitelist for select using (true);
insert into public.admin_whitelist (email, nombre, activo)
values ('terrorgm1@gmail.com', 'Dnavits Administrador', true)
on conflict (email) do update set activo = true;

-- 2. TABLA PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nombre text,
  avatar_url text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Lectura publica o propia de perfiles" on public.profiles;
drop policy if exists "Actualizacion del propio perfil" on public.profiles;
drop policy if exists "Insertar perfiles" on public.profiles;
create policy "Lectura publica o propia de perfiles" on public.profiles for select using (true);
create policy "Actualizacion del propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Insertar perfiles" on public.profiles for insert with check (true);

-- 3. TRIGGER SEGURO PARA NUEVOS USUARIOS
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_is_admin boolean := false;
  v_nombre text;
  v_avatar text;
begin
  begin
    select exists (
      select 1 from public.admin_whitelist 
      where lower(email) = lower(new.email) and activo = true
    ) into v_is_admin;
  exception when others then
    v_is_admin := false;
  end;

  v_nombre := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'nombre',
    split_part(new.email, '@', 1)
  );

  v_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  begin
    insert into public.profiles (id, email, nombre, avatar_url, role)
    values (
      new.id,
      new.email,
      v_nombre,
      v_avatar,
      case when v_is_admin then 'admin' else 'cliente' end
    )
    on conflict (id) do update set
      email = excluded.email,
      nombre = coalesce(excluded.nombre, public.profiles.nombre),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      role = case when v_is_admin then 'admin' else public.profiles.role end;
  exception when others then
    null;
  end;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. COLUMNAS Y RLS CONFIGURACION
alter table public.configuracion add column if not exists banner_anuncio text default '🍻 Bebidas heladas a domicilio en Medellín';
alter table public.configuracion add column if not exists nombre_bodega text default 'Bodega Dnavits';
alter table public.configuracion add column if not exists subtitulo_bodega text default 'Licores & Bebidas Heladas';
alter table public.configuracion add column if not exists telefono_contacto text default '3019519391';
alter table public.configuracion add column if not exists whatsapp_pedidos text default '573019519391';
alter table public.configuracion add column if not exists direccion_bodega text default 'Medellín, Antioquia';
alter table public.configuracion add column if not exists costo_domicilio integer default 5000;
alter table public.configuracion add column if not exists pedido_minimo integer default 20000;
alter table public.configuracion add column if not exists favicon_url text;
alter table public.configuracion add column if not exists logo_url text;
alter table public.configuracion add column if not exists titulo_pestana text;
alter table public.configuracion add column if not exists hero_badge text default 'DOMICILIOS EXPRESS · MEDELLÍN';
alter table public.configuracion add column if not exists hero_titulo text default 'Tus bebidas heladas,';
alter table public.configuracion add column if not exists hero_subtitulo_rainbow text default 'en minutos';
alter table public.configuracion add column if not exists hero_descripcion text default 'Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta. Precios directos, sin intermediarios, siempre fríos.';
alter table public.configuracion add column if not exists hero_features text[] default '{"⚡ Entrega en 1-2 días hábiles", "❄️ Siempre frío", "💳 Nequi · Efectivo · Transferencia"}';
alter table public.configuracion add column if not exists mostrar_whatsapp_flotante boolean default true;
alter table public.configuracion add column if not exists horario_texto text default 'Lunes a Domingo: 9:00 AM - 11:00 PM';
alter table public.configuracion add column if not exists horario_inicio time default '09:00';
alter table public.configuracion add column if not exists horario_fin time default '23:00';
alter table public.configuracion add column if not exists horario_dias text[] default '{"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"}';

alter table public.configuracion enable row level security;
drop policy if exists "Lectura publica configuracion" on public.configuracion;
drop policy if exists "Solo admin edita configuracion" on public.configuracion;
drop policy if exists "Solo admin modifica configuracion" on public.configuracion;
create policy "Lectura publica configuracion" on public.configuracion for select using (true);
create policy "Solo admin modifica configuracion" on public.configuracion for all using (
  exists (select 1 from public.admin_whitelist where email = (auth.jwt()->>'email') and activo = true)
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.admin_whitelist where email = (auth.jwt()->>'email') and activo = true)
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 5. COLUMNAS Y RLS PEDIDOS
alter table public.pedidos add column if not exists metodo_pago text default 'efectivo';
alter table public.pedidos add column if not exists notas text;
alter table public.pedidos add column if not exists detalle_direccion text;
alter table public.pedidos add column if not exists barrio text default '';
alter table public.pedidos add column if not exists ciudad text default 'Medellín';
alter table public.pedidos add column if not exists email text;
alter table public.pedidos add column if not exists numero_orden serial;

alter table public.pedidos enable row level security;
drop policy if exists "Clientes ven sus pedidos" on public.pedidos;
drop policy if exists "Clientes insertan pedidos" on public.pedidos;
drop policy if exists "Solo admin gestiona pedidos" on public.pedidos;
create policy "Clientes ven sus pedidos" on public.pedidos for select using (true);
create policy "Clientes insertan pedidos" on public.pedidos for insert with check (true);
create policy "Solo admin gestiona pedidos" on public.pedidos for all using (
  exists (select 1 from public.admin_whitelist where email = (auth.jwt()->>'email') and activo = true)
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 6. TABLA PEDIDO ITEMS
create table if not exists public.pedido_items (
  id uuid default gen_random_uuid() primary key,
  pedido_id uuid references public.pedidos on delete cascade not null,
  producto_id uuid,
  cantidad integer not null check (cantidad > 0),
  precio_unitario integer not null check (precio_unitario >= 0),
  created_at timestamptz default now()
);
alter table public.pedido_items enable row level security;
drop policy if exists "Lectura pedido_items" on public.pedido_items;
drop policy if exists "Insertar pedido_items" on public.pedido_items;
create policy "Lectura pedido_items" on public.pedido_items for select using (true);
create policy "Insertar pedido_items" on public.pedido_items for insert with check (true);

-- 7. TABLA PRODUCTOS
alter table public.productos add column if not exists descripcion text;
alter table public.productos add column if not exists precio_comparacion integer;
alter table public.productos add column if not exists sku text;
alter table public.productos add column if not exists destacado boolean default false;
alter table public.productos enable row level security;
drop policy if exists "Cualquiera puede ver productos activos" on public.productos;
drop policy if exists "Solo admin modifica productos" on public.productos;
create policy "Cualquiera puede ver productos activos" on public.productos for select using (true);
create policy "Solo admin modifica productos" on public.productos for all using (
  exists (select 1 from public.admin_whitelist where email = (auth.jwt()->>'email') and activo = true)
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 8. RECARGAR MEMORIA SUPABASE
notify pgrst, 'reload schema';`;

export default function AdminConfiguracion() {
  const supabase = createClient();
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
  const [necesitaSql, setNecesitaSql] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [configId, setConfigId] = useState<any>(null);

  async function cargarDatos() {
    try {
      const { data: config } = await supabase
        .from("configuracion")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (config) {
        setConfigId(config.id);
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
    } catch (err: any) {
      console.error("Error al cargar configuración:", err);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function guardarConfiguracion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setNecesitaSql(false);
    setGuardando(true);

    let targetId = configId;
    if (targetId === null || targetId === undefined) {
      const { data: cur } = await supabase
        .from("configuracion")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (cur) targetId = cur.id;
    }

    const payload: any = {
      telefono_contacto: telefonoContacto.trim() || null,
      whatsapp_pedidos: whatsappPedidos.trim() || null,
      direccion_bodega: direccionBodega.trim() || null,
      costo_domicilio: parseInt(costoDomicilio, 10) || 0,
      pedido_minimo: parseInt(pedidoMinimo, 10) || 0,
    };

    let updateError: any = null;

    if (targetId !== null && targetId !== undefined) {
      const res = await supabase
        .from("configuracion")
        .update(payload)
        .eq("id", targetId);
      updateError = res.error;
    } else {
      const res = await supabase
        .from("configuracion")
        .insert([payload]);
      updateError = res.error;
    }

    setGuardando(false);

    if (updateError) {
      setError("No se pudo guardar la configuración: " + updateError.message);
      return;
    }

    setMensaje("✓ Ajustes operativos guardados con éxito.");
  }

  function handleCopiarSql() {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  async function agregarAdminWhitelist(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoEmail.trim()) return;

    const { error: insertError } = await supabase
      .from("admin_whitelist")
      .insert([
        {
          email: nuevoEmail.trim().toLowerCase(),
          nombre: nuevoNombre.trim() || "Administrador",
          activo: true,
        },
      ]);

    if (insertError) {
      alert("Error al agregar admin: " + insertError.message);
    } else {
      setNuevoEmail("");
      setNuevoNombre("");
      cargarDatos();
    }
  }

  async function eliminarAdminWhitelist(id: string, email: string) {
    if (!confirm(`¿Deseas retirar a ${email} de los administradores?`)) return;

    const { error: delError } = await supabase
      .from("admin_whitelist")
      .delete()
      .eq("email", email);

    if (delError) {
      alert("Error al eliminar: " + delError.message);
    } else {
      cargarDatos();
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Encabezado */}
      <div>
        <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
          Operación &amp; Accesos
        </span>
        <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
          Configuración del Negocio
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Administra los datos operativos de contacto, reglas de domicilio y los accesos de administradores.
        </p>
      </div>

      {/* Banner de redirección a Personalización */}
      <div className="bg-canvas border border-accent/30 rounded-card p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky text-accent flex items-center justify-center shrink-0">
            <PaletteIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">¿Buscas cambiar el nombre, logo, portada u horario?</h2>
            <p className="text-xs text-ink-muted">
              Toda la identidad de marca y diseño visual de la tienda se gestiona exclusivamente en Personalización.
            </p>
          </div>
        </div>
        <Link
          href="/admin/personalizacion"
          className="inline-flex items-center gap-2 bg-ink hover:bg-ink-light text-white text-xs font-bold px-4 py-2.5 rounded-btn shadow-portrait transition-all active:scale-95 shrink-0"
        >
          <span>Ir a Personalización</span>
          <span>→</span>
        </Link>
      </div>

      {/* Script SQL si lo necesita */}
      {necesitaSql && (
        <div className="bg-sky/60 border-2 border-accent/40 rounded-card p-6 shadow-card animate-fade-in-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-inter font-bold text-sm text-ink flex items-center gap-2">
                <span>⚡ Habilitar Columnas en Supabase</span>
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Para sincronizar completamente las columnas de tu base de datos, copia y ejecuta este script en el SQL Editor de Supabase:
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopiarSql}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-btn shadow-portrait transition-all active:scale-95 shrink-0"
            >
              {copiado ? "✓ ¡Copiado!" : "Copiar Código SQL"}
            </button>
          </div>
          <pre className="mt-3 p-3.5 bg-canvas border border-hairline rounded-input text-[11px] text-ink font-mono overflow-x-auto max-h-40">
            {SQL_MIGRATION_SCRIPT}
          </pre>
        </div>
      )}

      {/* SECCIÓN 1: AJUSTES OPERATIVOS Y DOMICILIOS */}
      <form
        onSubmit={guardarConfiguracion}
        className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-divider pb-4">
          <div className="w-10 h-10 rounded-card bg-sky text-accent flex items-center justify-center font-bold">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-inter font-bold text-base text-ink">
              Operación, Contacto &amp; Domicilios
            </h2>
            <p className="text-xs text-ink-muted">
              Valores numéricos de entrega y canales a donde los clientes enviarán sus pedidos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WhatsApp de Pedidos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              WhatsApp para Recibir Pedidos (con código de país)
            </label>
            <input
              type="text"
              value={whatsappPedidos}
              onChange={(e) => setWhatsappPedidos(e.target.value)}
              placeholder="573019519391"
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
            />
            <p className="text-[11px] text-ink-faint mt-1">
              A este número llegará el mensaje predeterminado cuando un cliente elija confirmar por WhatsApp.
            </p>
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
            <p className="text-[11px] text-ink-faint mt-1">
              Se muestra en el pie de página para llamadas directas.
            </p>
          </div>

          {/* Dirección de la Bodega */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Dirección Física o Zona de Cobertura
            </label>
            <input
              type="text"
              value={direccionBodega}
              onChange={(e) => setDireccionBodega(e.target.value)}
              placeholder="Medellín, Antioquia (Valle de Aburrá)"
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
          {guardando ? "Guardando..." : "Guardar Ajustes Operativos"}
        </button>
      </form>

      {/* SECCIÓN 2: LISTA BLANCA DE CORREOS (ADMINS) */}
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
              Los usuarios que inicien sesión con estos correos tendrán acceso al panel administrativo.
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
                  <tr key={admin.id || admin.email} className="hover:bg-surface transition-colors">
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
    </div>
  );
}
