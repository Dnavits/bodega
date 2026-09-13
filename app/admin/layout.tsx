import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/admin-auth";
import { BeerIcon, ShieldAdminIcon, AlertCircleIcon } from "@/components/Icons";
import { AdminNav } from "@/components/AdminNav";

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
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-ink">
        <div className="max-w-md w-full bg-canvas border border-hairline rounded-card p-8 text-center shadow-card">
          <div className="w-14 h-14 rounded-card bg-danger-soft border border-danger/20 text-danger mx-auto flex items-center justify-center mb-4">
            <ShieldAdminIcon className="w-7 h-7" />
          </div>
          <h1 className="font-inter font-black text-2xl text-ink mb-2">
            Acceso Restringido
          </h1>
          <p className="text-xs text-ink-muted mb-4 leading-relaxed">
            El correo <strong className="text-accent font-semibold">{user.email}</strong> no se encuentra en la <strong>lista blanca de administradores</strong> autorizados para la Bodega Dnavits.
          </p>
          <div className="p-3.5 bg-surface border border-hairline rounded-card text-[11px] text-ink-muted mb-6 text-left space-y-1">
            <p className="flex items-center gap-1.5"><AlertCircleIcon className="w-3.5 h-3.5 text-accent shrink-0" /> <strong>¿Cómo autorizar este correo?</strong></p>
            <p>1. Ve a Supabase &gt; Table Editor &gt; <code className="text-accent font-mono font-bold">admin_whitelist</code>.</p>
            <p>2. Agrega una fila con tu correo exacto y <code className="text-emerald font-mono font-bold">activo = true</code>.</p>
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="block w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-btn shadow-portrait transition-all"
            >
              Volver a la Tienda Principal
            </Link>
            <Link
              href="/login"
              className="block w-full py-2.5 text-xs text-ink-muted hover:text-accent transition-colors"
            >
              Iniciar sesión con otra cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col md:flex-row">
      {/* Sidebar Lateral Estilo Shopify en Light Portrait */}
      <aside className="w-full md:w-64 bg-canvas border-b md:border-b-0 md:border-r border-hairline flex flex-col shrink-0">
        {/* Header del Sidebar */}
        <div className="p-5 border-b border-divider flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center text-white font-black shadow-portrait group-hover:bg-ink-light transition-colors">
              <BeerIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-inter font-black text-sm text-ink block leading-tight">
                BODEGA DNAVITS
              </span>
              <span className="text-[10px] text-accent font-bold uppercase tracking-eyebrow">
                Panel Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Menú de Navegación del Panel con estado activo */}
        <AdminNav />

        {/* Footer del Sidebar con datos del Admin logueado */}
        <div className="p-4 border-t border-divider bg-surface/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky border border-accent/20 text-accent flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user.email?.[0] || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink truncate">{user.email}</p>
                <span className="text-[10px] text-emerald font-semibold uppercase tracking-eyebrow block">
                  Admin Autorizado
                </span>
              </div>
            </div>
            <Link
              href="/"
              title="Ir a la tienda"
              className="text-xs text-ink-muted hover:text-ink p-1 font-medium"
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
