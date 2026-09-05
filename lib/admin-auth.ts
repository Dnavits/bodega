import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getAdminAccess(userEmail?: string | null, userId?: string | null) {
  if (!userEmail && !userId) return false;

  try {
    const supabase = await createServerClient();

    // 1. Check whitelist table by email
    if (userEmail) {
      const { data: whiteRow } = await supabase
        .from("admin_whitelist")
        .select("activo")
        .ilike("email", userEmail)
        .eq("activo", true)
        .single();

      if (whiteRow?.activo) return true;
    }

    // 2. Check profile role
    if (userId) {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileRow?.role === "admin") return true;
    }

    return false;
  } catch (err) {
    console.error("Error verifying admin access:", err);
    return false;
  }
}
