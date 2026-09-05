"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, BeerIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

function LoginForm() {
  const [modo, setModo] = useState<"entrar" | "registrarse">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const supabase = createClient();

  // Si ya tiene sesión activa, redirigir automáticamente
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push(redirectPath);
      }
    });
  }, [router, redirectPath, supabase.auth]);

  // Inicio de sesión con Google
  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Error al conectar con Google.");
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar el inicio de sesión con Google.");
      setGoogleLoading(false);
    }
  }

  // Inicio con correo y contraseña
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!email || !password) {
      setError("Completa correo y contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    if (modo === "entrar") {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      setCargando(false);

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError(
            "Correo o contraseña incorrectos. Si este usuario aún no existe en Supabase Auth, haz clic abajo en '¿No tienes cuenta? Regístrate aquí' para crearle la contraseña por primera vez."
          );
        } else if (authError.message.includes("Email not confirmed")) {
          setError("El correo aún no ha sido confirmado. Puedes desactivar la confirmación en Supabase Auth o confirmarlo desde tu bandeja.");
        } else {
          setError(authError.message || "No se pudo iniciar sesión.");
        }
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { nombre: nombre.trim() },
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });

      setCargando(false);

      if (authError) {
        setError(authError.message || "No se pudo crear la cuenta.");
        return;
      }

      if (data.session) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setMensaje("✓ ¡Cuenta creada con éxito! Ya puedes iniciar sesión con tu correo y contraseña.");
        setModo("entrar");
      }
    }
  }

  return (
    <div className="w-full max-w-md bg-vault-900/90 backdrop-blur-xl border border-vault-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 text-accent-light mb-4 shadow-inner">
          <BeerIcon className="w-7 h-7 text-accent" />
        </div>
        <h1 className="font-roboto font-black text-2xl sm:text-3xl text-foam tracking-tight">
          {modo === "entrar" ? "Acceder a tu Cuenta" : "Crear Cuenta"}
        </h1>
        <p className="text-xs sm:text-sm text-vault-100/60 mt-1">
          Bodega Dnavits · Bebidas, Cervezas y Licores
        </p>
      </div>

      {/* Botón de Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || cargando}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-foam text-vault-950 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-95 disabled:opacity-60 text-sm mb-6"
      >
        <GoogleIcon className="w-5 h-5" />
        <span>{googleLoading ? "Conectando con Google..." : "Continuar con Google"}</span>
      </button>

      {/* Separador */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-vault-800" />
        <span className="text-[11px] uppercase tracking-wider text-vault-100/40 font-semibold">
          O con tu correo
        </span>
        <div className="flex-1 h-px bg-vault-800" />
      </div>

      {/* Formulario Tradicional */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {modo === "registrarse" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              required
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="terrorgm1@gmail.com"
            required
            className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              className="w-full bg-vault-950 border border-vault-800 focus:border-accent rounded-xl pl-4 pr-11 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-100/40 hover:text-accent-light transition-colors p-1"
            >
              {mostrarPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium leading-relaxed">
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
          disabled={cargando || googleLoading}
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 text-sm mt-2"
        >
          {cargando ? "Validando..." : modo === "entrar" ? "Ingresar a la Bodega" : "Crear mi Cuenta"}
        </button>
      </form>

      {/* Alternar entre entrar y registrarse */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setModo(modo === "entrar" ? "registrarse" : "entrar");
            setError("");
            setMensaje("");
          }}
          className="text-xs font-medium text-vault-100/70 hover:text-accent-light transition-colors"
        >
          {modo === "entrar"
            ? "¿No tienes cuenta? Regístrate aquí"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>

      {/* Acceso a lista blanca / ayuda */}
      <div className="mt-6 pt-5 border-t border-vault-800/80 text-center">
        <p className="text-[11px] text-vault-100/40 leading-relaxed">
          ¿Eres administrador? Si tu correo está en la lista blanca, inicia sesión aquí y el sistema te dará acceso directo a <code className="text-accent-light font-mono">/admin</code>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-vault-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-accent-light font-bold text-sm">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
