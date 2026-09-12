import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false, user: null });
    }

    const isAdmin = await getAdminAccess(user.email, user.id);

    return NextResponse.json({
      isAdmin: Boolean(isAdmin || user.email?.toLowerCase() === "terrorgm1@gmail.com"),
      email: user.email,
      userId: user.id,
    });
  } catch (err: any) {
    return NextResponse.json({ isAdmin: false, error: err.message }, { status: 500 });
  }
}
