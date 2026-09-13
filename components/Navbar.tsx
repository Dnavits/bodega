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
  nombreBodega?:    string | null;
  subtituloBodega?: string | null;
  logoUrl?:         string | null;
  bannerAnuncio?:   string | null;
  whatsappPedidos?: string | null;
}

export function Navbar({ nombreBodega, subtituloBodega, logoUrl, bannerAnuncio, whatsappPedidos }: NavbarProps) {
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

  // ── Auth state & Admin check ──
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

      const name =
        u.user_metadata?.full_name ||
        u.user_metadata?.nombre    ||
        u.user_metadata?.name      ||
        u.email?.split("@")[0]     ||
        "Usuario";
      setDisplayName(name);

      // Verificación directa de admin con fallback de propietario
      const isOwner = u.email?.toLowerCase() === "terrorgm1@gmail.com";
      if (isOwner) {
        setIsAdmin(true);
      }

      try {
        // Consultar endpoint del servidor para confirmación infalible
        const res = await fetch("/api/admin/check");
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(Boolean(data.isAdmin || isOwner));
          return;
        }
      } catch {
        // Fallback en cliente
      }

      // Fallback directo en Supabase
      const { data: wl } = await supabase
        .from("admin_whitelist")
        .select("activo")
        .ilike("email", u.email ?? "")
        .eq("activo", true)
        .maybeSingle();

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .maybeSingle();

      setIsAdmin(Boolean(wl?.activo || prof?.role === "admin" || isOwner));
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
    setUser(null);
    setIsAdmin(false);
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
              <img src={logoUrl} alt={nombreBodega || "Bodega Dnavits"} className="h-8 w-auto rounded-xl object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0 group-hover:bg-ink-light transition-colors shadow-portrait">
                <BeerIcon className="w-4.5 h-4.5 text-white" />
              </div>
            )}
            <div className="flex flex-col leading-none">
              <span className="font-inter font-black text-base text-ink tracking-tight group-hover:text-accent transition-colors uppercase">
                {nombreBodega || "BODEGA DNAVITS"}
              </span>
              <span className="text-[9px] uppercase tracking-eyebrow text-ink-faint font-semibold">
                {subtituloBodega || "Licores & Bebidas Heladas"}
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
              className="flex items-center gap-1.5 text-emerald hover:text-emerald-hover transition-colors font-semibold"
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
                  {isAdmin && (
                    <span className="bg-sky text-accent text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-tag">
                      Admin
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-canvas border border-hairline rounded-card shadow-card p-2.5 z-50 animate-fade-in-up space-y-1.5">
                    {/* User info card */}
                    <div className="p-3 bg-surface/70 rounded-xl border border-hairline/60">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center font-bold text-xs uppercase shadow-subtle shrink-0">
                          {displayName[0] || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="font-bold text-xs text-ink truncate">{displayName}</p>
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 bg-sky text-accent text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-tag shrink-0">
                                <ShieldAdminIcon className="w-2.5 h-2.5" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Panel para Administradores */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-canvas hover:bg-surface border border-hairline text-ink transition-all group shadow-subtle"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-sky text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                            <ShieldAdminIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-ink group-hover:text-accent transition-colors truncate">
                              Panel de Control
                            </p>
                            <p className="text-[10px] text-ink-muted truncate">
                              Inventario, pedidos y ajustes
                            </p>
                          </div>
                        </div>
                        <span className="text-ink-faint group-hover:text-accent group-hover:translate-x-0.5 transition-all text-xs font-bold ml-1">
                          →
                        </span>
                      </Link>
                    )}

                    {/* Cerrar Sesión */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors"
                    >
                      <LogOutIcon className="w-3.5 h-3.5 text-danger/80" />
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
