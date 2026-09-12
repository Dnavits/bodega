"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart-context";
import {
  BeerIcon, CartIcon, UserIcon, ShieldAdminIcon, LogOutIcon, WhatsAppIcon,
} from "@/components/Icons";
import { WHATSAPP_URL } from "@/lib/constants";

interface NavbarProps {
  logoUrl?:        string | null;
  bannerAnuncio?:  string | null;
  whatsappPedidos?: string | null;
}

export function Navbar({ logoUrl, bannerAnuncio, whatsappPedidos }: NavbarProps) {
  const { count, setIsOpen } = useCart();
  const [user,            setUser]            = useState<any>(null);
  const [displayName,     setDisplayName]     = useState("");
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [scrolled,        setScrolled]        = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router  = useRouter();

  // ── Cerrar dropdown al hacer click fuera ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Scroll para sombra del nav ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Auth state ──
  useEffect(() => {
    const supabase = createClient();

    async function checkUser(u: any) {
      if (!u) {
        setUser(null);
        setDisplayName("");
        setIsAdmin(false);
        return;
      }
      setUser(u);

      // Nombre preferido: full_name de Google OAuth → nombre de metadata → parte del email
      const name =
        u.user_metadata?.full_name ||
        u.user_metadata?.nombre    ||
        u.user_metadata?.name      ||
        u.email?.split("@")[0]     ||
        "Usuario";
      setDisplayName(name);

      // Verificar si es admin
      const { data: wl } = await supabase
        .from("admin_whitelist")
        .select("activo")
        .ilike("email", u.email ?? "")
        .eq("activo", true)
        .single();

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .single();

      setIsAdmin(Boolean(wl?.activo || prof?.role === "admin"));
    }

    supabase.auth.getUser().then(({ data: { user } }) => checkUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => checkUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.refresh();
  }

  const waUrl = whatsappPedidos
    ? `https://wa.me/${whatsappPedidos}`
    : WHATSAPP_URL;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40">
      {/* ── Announcement Banner ── */}
      <div className="w-full bg-ink text-white/80 text-[11px] font-semibold py-1.5 px-4 text-center tracking-widest">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse shrink-0" />
          {bannerAnuncio || "🍻 Bodega Dnavits · Bebidas Frías a Domicilio en Medellín"}
        </div>
      </div>

      {/* ── Main Nav ── */}
      <nav
        className={`w-full bg-canvas/95 backdrop-blur-md border-b border-hairline transition-shadow duration-300 ${
          scrolled ? "shadow-nav" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Bodega Dnavits" className="h-8 w-auto rounded-xl" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0 group-hover:bg-ink-light transition-colors">
                <BeerIcon className="w-4.5 h-4.5 text-white" />
              </div>
            )}
            <div className="flex flex-col leading-none">
              <span className="font-inter font-black text-base text-ink tracking-tight group-hover:text-accent transition-colors">
                BODEGA DNAVITS
              </span>
              <span className="text-[9px] uppercase tracking-eyebrow text-ink-faint font-semibold">
                Licores &amp; Bebidas Heladas
              </span>
            </div>
          </Link>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            <a href="#catalogo" className="hover:text-ink transition-colors">Catálogo</a>
            <a href="#contacto" className="hover:text-ink transition-colors">Contacto</a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald hover:text-emerald-hover transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* User menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2 rounded-btn border border-hairline bg-canvas hover:bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-subtle transition-all"
                >
                  {/* Avatar */}
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[11px] uppercase shrink-0">
                    {displayName[0] || "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">{displayName}</span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-canvas border border-hairline rounded-card shadow-card p-1.5 z-50 animate-fade-in-up">
                    {/* User info */}
                    <div className="px-3 py-2.5 border-b border-divider mb-1">
                      <p className="font-semibold text-sm text-ink truncate">{displayName}</p>
                      <p className="text-[11px] text-ink-faint truncate mt-0.5">{user.email}</p>
                      {/* Admin badge */}
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1.5 bg-sky text-accent font-bold text-[10px] uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
                          ⚡ Administración
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-accent hover:bg-accent-soft transition-colors"
                      >
                        <ShieldAdminIcon className="w-4 h-4" />
                        <span>Panel Administrador</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger-soft transition-colors mt-0.5"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-btn border border-hairline bg-canvas hover:bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-subtle transition-all"
              >
                <UserIcon className="w-4 h-4 text-ink-muted" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Abrir carrito"
              className="relative flex items-center gap-1.5 rounded-btn bg-ink hover:bg-ink-light text-white px-4 py-2 text-xs font-semibold shadow-portrait transition-all active:scale-95"
            >
              <CartIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none shadow">
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
