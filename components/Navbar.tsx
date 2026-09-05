"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";
import {
  BeerIcon,
  CartIcon,
  UserIcon,
  ShieldAdminIcon,
  LogOutIcon,
  WhatsAppIcon
} from "@/components/Icons";

interface NavbarProps {
  logoUrl?: string | null;
  bannerAnuncio?: string | null;
}

export function Navbar({ logoUrl, bannerAnuncio }: NavbarProps) {
  const { count, setIsOpen } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: whiteRow } = await supabase
          .from("admin_whitelist")
          .select("activo")
          .ilike("email", user.email || "")
          .eq("activo", true)
          .single();

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (whiteRow?.activo || profileRow?.role === "admin") {
          setIsAdmin(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          const { data: whiteRow } = await supabase
            .from("admin_whitelist")
            .select("activo")
            .ilike("email", currentUser.email || "")
            .eq("activo", true)
            .single();

          const { data: profileRow } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();

          setIsAdmin(Boolean(whiteRow?.activo || profileRow?.role === "admin"));
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleCerrarSesion() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setUserMenuAbierto(false);
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40">
      {/* Top Banner 100% Ancho */}
      <div className="w-full bg-vault-900 border-b border-vault-800 text-vault-100/70 text-xs font-semibold py-2 px-4 text-center tracking-wider">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-light animate-pulse" />
          <span>
            {bannerAnuncio || "🍻 Bodega Dnavits · Gaseosas, Cervezas y Bebidas Frías a Domicilio en Medellín"}
          </span>
        </div>
      </div>

      {/* Barra de Navegación 100% Ancho con Elementos Centrados */}
      <nav className="w-full bg-vault-950/90 backdrop-blur-md border-b border-vault-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo y Marca */}
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img src={logoUrl} alt="Bodega Dnavits" className="h-9 w-auto rounded-xl" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
                <BeerIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-roboto font-black text-lg sm:text-xl text-foam tracking-tight leading-none group-hover:text-accent-light transition-colors">
                BODEGA DNAVITS
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent-light font-semibold mt-1">
                Licores & Bebidas Heladas
              </span>
            </div>
          </Link>

          {/* Menú Central */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-vault-100/75">
            <a href="#catalogo" className="hover:text-accent-light transition-colors">
              Catálogo de Bebidas
            </a>
            <a href="#contacto" className="hover:text-accent-light transition-colors">
              Ubicación & Domicilios
            </a>
            <a
              href="https://wa.me/573019519391"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-light transition-colors flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-light" />
              <span>WhatsApp Directo</span>
            </a>
          </div>

          {/* Acciones: Usuario & Carrito */}
          <div className="flex items-center gap-3">
            {/* Estado de Usuario */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuAbierto(!userMenuAbierto)}
                  className="flex items-center gap-2 bg-vault-900 hover:bg-vault-850 border border-vault-800 text-foam text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </button>

                {/* Dropdown Menú */}
                {userMenuAbierto && (
                  <div className="absolute right-0 mt-2 w-56 bg-vault-900 border border-vault-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in-up">
                    <div className="px-3 py-2 border-b border-vault-800 text-xs text-vault-100/60">
                      <p className="font-bold text-foam truncate">{user.user_metadata?.full_name || "Mi Cuenta"}</p>
                      <p className="truncate text-[11px]">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuAbierto(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-accent-light hover:bg-vault-850 transition-colors mt-1"
                      >
                        <ShieldAdminIcon className="w-4 h-4 text-accent" />
                        <span>Panel Administrador</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleCerrarSesion}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOutIcon className="w-4 h-4 text-red-400" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-vault-900 hover:bg-vault-850 border border-vault-800 text-foam text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:border-accent/40"
              >
                <UserIcon className="w-4 h-4 text-accent-light" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}

            {/* Carrito */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Ver carrito de compras"
              className="relative flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <CartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
