"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BeerIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

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
  const [nombreBodega,    setNombreBodega]    = useState("Bodega Dnavits");

  const router       = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect  = searchParams.get("redirect") || "/";
  const redirectPath = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
  const supabase     = createClient();

  // Si ya tiene sesión activa, redirigir
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push(redirectPath);
    });
  }, [router, redirectPath, supabase]);

  // Fetch nombre_bodega
  useEffect(() => {
    supabase.from("configuracion").select("nombre_bodega").limit(1).maybeSingle().then(({ data }) => {
      if (data?.nombre_bodega) setNombreBodega(data.nombre_bodega);
    });
  }, [supabase]);

  /* ── Email / Password ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) return setError("Completa correo y contraseña.");

    // Validación estricta de correo (solo letras, números y símbolos estándar de correo)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return setError("Por favor ingresa un correo válido (ej: cliente@gmail.com). Sin símbolos raros.");
    }

    if (trimmedPassword.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");

    if (modo === "registrarse") {
      const nombreTrimmed = nombre.trim();
      if (!/^[a-zA-Z\u00C0-\u017F\s'-]{2,80}$/.test(nombreTrimmed)) {
        return setError("El nombre debe contener solo letras y espacios (2 a 80 caracteres).");
      }
    }

    setCargando(true);

    if (modo === "entrar") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      setCargando(false);

      if (err) {
        if (err.message.includes("Invalid login credentials")) {
          setError("Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate.");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Debes confirmar tu correo antes de iniciar sesión.");
        } else {
          setError("Error al iniciar sesión: " + err.message);
        }
        return;
      }
      router.push(redirectPath);
      router.refresh();
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
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
        setMensaje("✓ ¡Cuenta creada! Revisa tu correo o inicia sesión ahora.");
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
          <p className="text-sm text-ink-muted mt-1">{nombreBodega} · Bebidas &amp; Licores</p>
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
            disabled={cargando}
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

        {/* Store message */}
        <div className="mt-5 pt-4 border-t border-divider text-center">
          <p className="text-[11px] text-ink-faint leading-relaxed">
            Crea tu cuenta para hacer seguimiento de tus pedidos, ver tu historial y recibir ofertas exclusivas.
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
