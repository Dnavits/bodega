"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [modo, setModo] = useState<"entrar" | "registrarse">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa correo y contraseña.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setCargando(true);
    const { error: authError } =
      modo === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { nombre } } });

    setCargando(false);

    if (authError) {
      setError(
        modo === "entrar"
          ? "Correo o contraseña incorrectos."
          : "No se pudo crear la cuenta. Intenta con otro correo."
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-charcoal/10 rounded-2xl p-8">
        <h1 className="font-display font-bold text-2xl mb-1">
          {modo === "entrar" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="text-sm text-charcoal/60 mb-6">Bodega Dnavits</p>

        {modo === "registrarse" && (
          <div className="mb-4">
            <label className="text-sm font-medium block mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium block mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full mt-5 bg-bottle hover:bg-bottle-dark transition-colors text-white font-semibold py-2.5 rounded-full disabled:opacity-60"
        >
          {cargando ? "Un momento..." : modo === "entrar" ? "Entrar" : "Registrarme"}
        </button>

        <button
          type="button"
          onClick={() => setModo(modo === "entrar" ? "registrarse" : "entrar")}
          className="w-full text-center text-sm text-charcoal/60 mt-4"
        >
          {modo === "entrar" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </form>
    </main>
  );
}
