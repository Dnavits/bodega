"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, BeerIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

/* ── Login form (client component that uses useSearchParams) ── */
function LoginForm() {
  const [modo,            setModo]            = useState<"entrar" | "registrarse">("entrar");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [nombre,          setNombre]          = useState("");
  const [error,           setError]           = useState("");
  const [mensaje,         setMensaje]         = useState("");
  const [cargando,        setCargando]        = useState(false);
  const [googleLoading,   setGoogleLoading]   = useState(false);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const supabase     = createClient();

  // Si ya tiene sesión activa, redirigir
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push(redirectPath);
    });
  }, [router, redirectPath, supabase]);

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });
      if (err) { setError(err.message); setGoogleLoading(false); }
    } catch {
      setError("No se pudo conectar con Google.");
      setGoogleLoading(false);
    }
  }

  /* ── Email / Password ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!email || !password) return setError("Completa correo y contraseña.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");

    setCargando(true);

    if (modo === "entrar") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      setCargando(false);

      if (err) {
        if (err.message.includes("Invalid login credentials")) {
          setError("Correo o contraseña incorrectos. Si aún no tienes cuenta, haz clic en '¿No tienes cuenta?' abajo.");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Debes confirmar tu correo antes de iniciar sesión.");
        } else {
          setError(err.message);
        }
        return;
      }
      router.push(redirectPath);
      router.refresh();
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { nombre: nombre.trim() },
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      setCargando(false);
      if (err) return setError(err.message || "No se pudo crear la cuenta.");
      if (data.session) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setMensaje("✓ ¡Cuenta creada! Ya puedes iniciar sesión con tu correo y contraseña.");
        setModo("entrar");
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* ── Volver a la tienda ── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        <span>Volver a la tienda</span>
      </Link>

      {/* ── Card ── */}
      <div className="bg-canvas border border-hairline rounded-card shadow-card p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-card bg-sky mb-4">
            <BeerIcon className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink tracking-tight">
            {modo === "entrar" ? "Bienvenido de vuelta" : "Crear cuenta"}
          </h1>
          <p className="text-sm text-ink-muted mt-1">Bodega Dnavits · Bebidas &amp; Licores</p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || cargando}
          className="w-full flex items-center justify-center gap-3 border border-hairline bg-canvas hover:bg-surface rounded-btn px-4 py-3 text-sm font-semibold text-ink shadow-subtle transition-all active:scale-95 disabled:opacity-60 mb-6"
        >
          <GoogleIcon className="w-5 h-5" />
          {googleLoading ? "Conectando..." : "Continuar con Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-[11px] uppercase tracking-eyebrow text-ink-faint font-semibold">
            O con tu correo
          </span>
          <div className="flex-1 h-px bg-divider" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "registrarse" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                className="w-full border border-hairline focus:border-accent rounded-input bg-canvas px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full border border-hairline focus:border-accent rounded-input bg-canvas px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full border border-hairline focus:border-accent rounded-input bg-canvas pl-4 pr-11 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors p-1"
              >
                {showPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-danger bg-danger-soft border border-danger/20 rounded-input px-4 py-2.5 leading-relaxed">
              {error}
            </p>
          )}
          {mensaje && (
            <p className="text-xs text-emerald bg-emerald-soft border border-emerald/20 rounded-input px-4 py-2.5">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando || googleLoading}
            className="w-full bg-ink hover:bg-ink-light text-white font-bold py-3 rounded-btn shadow-portrait transition-all active:scale-95 disabled:opacity-60 text-sm"
          >
            {cargando
              ? "Validando..."
              : modo === "entrar"
              ? "Ingresar"
              : "Crear Cuenta"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setModo(m => m === "entrar" ? "registrarse" : "entrar"); setError(""); setMensaje(""); }}
            className="text-xs text-ink-muted hover:text-accent transition-colors"
          >
            {modo === "entrar"
              ? "¿No tienes cuenta? Regístrate aquí"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>

        {/* Admin hint */}
        <div className="mt-5 pt-4 border-t border-divider text-center">
          <p className="text-[11px] text-ink-faint leading-relaxed">
            ¿Eres administrador? Si tu correo está en la lista blanca, al iniciar sesión tendrás acceso automático a{" "}
            <code className="text-accent font-mono">/admin</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <Suspense fallback={
        <div className="w-full max-w-md text-center text-ink-muted text-sm animate-shimmer h-96 rounded-card" />
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
