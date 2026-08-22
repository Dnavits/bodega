"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminConfiguracion() {
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("configuracion")
      .select("logo_url, favicon_url")
      .single()
      .then(({ data }) => {
        setLogoUrl(data?.logo_url || "");
        setFaviconUrl(data?.favicon_url || "");
      });
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const { error: updateError } = await supabase
      .from("configuracion")
      .update({ logo_url: logoUrl || null, favicon_url: faviconUrl || null })
      .eq("id", true);

    if (updateError) {
      setError("No se pudo guardar. Verifica que tu cuenta tenga rol de administrador.");
      return;
    }
    setMensaje("Guardado. Los cambios se ven al recargar la página.");
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-2">Logo y favicon</h1>
      <p className="text-sm text-charcoal/60 mb-6">
        Pega la URL de una imagen ya subida (por ejemplo a Supabase Storage, Imgur o Cloudinary).
        El favicon se ve mejor como imagen cuadrada (por ejemplo 64x64px).
      </p>

      <form onSubmit={guardar} className="bg-white border border-charcoal/10 rounded-xl p-5 max-w-lg space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">URL del logo</label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm"
          />
          {logoUrl && <img src={logoUrl} alt="Vista previa del logo" className="h-10 mt-2" />}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">URL del favicon</label>
          <input
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm"
          />
          {faviconUrl && <img src={faviconUrl} alt="Vista previa del favicon" className="h-8 w-8 mt-2 rounded" />}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {mensaje && <p className="text-sm text-bottle">{mensaje}</p>}

        <button type="submit" className="bg-bottle hover:bg-bottle-dark transition-colors text-white text-sm font-medium rounded-lg py-2 px-6">
          Guardar
        </button>
      </form>
    </div>
  );
}
