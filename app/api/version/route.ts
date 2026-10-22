import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Retorna el hash del commit de Vercel o la fecha de build
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "build-" + (process.env.BUILD_ID || "dev");

  return NextResponse.json(
    { version },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
