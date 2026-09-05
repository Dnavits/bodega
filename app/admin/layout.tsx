import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/admin-auth";
import {
  BeerIcon,
  PackageIcon,
  TrendingUpIcon,
  SettingsIcon,
  ShieldAdminIcon,
  LogOutIcon,
  UserIcon
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no ha iniciado sesión, enviarlo al login con retorno
  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Verificar si el usuario está en la lista blanca de administradores o tiene rol admin
  const hasAdminAccess = await getAdminAccess(user.email, user.id);

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-vault-950 flex items-center justify-center p-6 text-foam">
        <div className="max-w-md w-full bg-vault-900 border border-vault-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAdminIcon className="w-7 h-7" />
          </div>
          <h1 className="font-roboto font-black text-2xl text-foam mb-2">
            Acceso Restringido
          </h1>
          <p className="text-xs text-vault-100/70 mb-4 leading-relaxed">
            El correo <strong className="text-amber-light">{user.email}</strong> no se encuentra en la <strong>lista blanca de administradores</strong> autorizados para la Bodega Dnavits.
          </p>
          <div className="p-3.5 bg-vault-950 border border-vault-800 rounded-2xl text-[11px] text-vault-100/50 mb-6 text-left space-y-1">
            <p>💡 <strong>¿Cómo autorizar este correo?</strong></p>
            <p>1. Ve a Supabase &gt; Table Editor &gt; <code className="text-amber">admin_whitelist</code>.</p>
            <p>2. Agrega una fila con tu correo exacto y <code className="text-emerald-light">activo = true</code>.</p>
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="block w-full py-3 bg-vault-850 hover:bg-vault-800 border border-vault-700 text-foam text-xs font-bold rounded-xl transition-colors"
            >
              Volver a la Tienda Principal
            </Link>
            <Link
              href="/login"
              className="block w-full py-2.5 text-xs text-vault-100/50 hover:text-amber-light transition-colors"
            >
              Iniciar sesión con otra cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-950 text-foam flex flex-col md:flex-row">
      {/* Sidebar Lateral Estilo Shopify */}
      <aside className="w-full md:w-64 bg-vault-900 border-b md:border-b-0 md:border-r border-vault-800 flex flex-col shrink-0">
        {/* Header del Sidebar */}
        <div className="p-5 border-b border-vault-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber flex items-center justify-center text-vault-950 font-black">
              <BeerIcon className="w-5 h-5 text-vault-950" />
            </div>
            <div>
              <span className="font-roboto font-black text-sm text-foam block leading-tight">
                BODEGA DNAVITS
              </span>
              <span className="text-[10px] text-amber-light font-bold uppercase tracking-wider">
                Panel Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Menú de Navegación del Panel */}
        <nav className="p-4 space-y-1.5 flex-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-vault-100/80 hover:text-foam hover:bg-vault-850 transition-colors"
          >
            <TrendingUpIcon className="w-4 h-4 text-amber" />
            <span>Dashboard & Ventas</span>
          </Link>

          <Link
            href="/admin/productos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-vault-100/80 hover:text-foam hover:bg-vault-850 transition-colors"
          >
            <PackageIcon className="w-4 h-4 text-emerald-light" />
            <span>Inventario & Productos</span>
          </Link>

          <Link
            href="/admin/configuracion"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-vault-100/80 hover:text-foam hover:bg-vault-850 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-ice" />
            <span>Ajustes & Lista Blanca</span>
          </Link>
        </nav>

        {/* Footer del Sidebar con datos del Admin logueado */}
        <div className="p-4 border-t border-vault-800 bg-vault-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald/20 border border-emerald/40 text-emerald-light flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user.email?.[0] || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foam truncate">{user.email}</p>
                <span className="text-[10px] text-emerald-light font-semibold uppercase tracking-wider block">
                  Admin Autorizado
                </span>
              </div>
            </div>
            <Link
              href="/"
              title="Ir a la tienda"
              className="text-xs text-vault-100/50 hover:text-foam p-1"
            >
              Tienda ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* Área de Trabajo Principal */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
