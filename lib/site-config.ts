import { createClient } from "@/lib/supabase/server";

export async function getSiteConfig() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("configuracion")
      .select("logo_url, favicon_url")
      .single();
    
    if (error) {
      console.error("Supabase config error:", error.message);
      return { logoUrl: null, faviconUrl: null };
    }

    return {
      logoUrl: data?.logo_url || null,
      faviconUrl: data?.favicon_url || null
    };
  } catch (error) {
    console.error("Failed to fetch site config:", error);
    return { logoUrl: null, faviconUrl: null };
  }
}
