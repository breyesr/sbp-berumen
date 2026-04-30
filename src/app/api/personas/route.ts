// app/api/personas/route.ts
import { NextResponse } from "next/server";
import { listPersonas } from "@/lib/personaProvider";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const isAdmin = isAdminRole(session?.user?.roles);
    
    const options = await listPersonas({
      allowedClusters: session?.user?.clusters,
      isAdmin
    });

    // sort by name for nicer UX
    options.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return NextResponse.json({ options });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to list personas" },
      { status: 500 }
    );
  }
}