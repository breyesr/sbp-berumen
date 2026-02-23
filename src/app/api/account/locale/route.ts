import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { normalizeLocale } from "@/lib/i18n/config";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const locale = normalizeLocale(body?.locale);
  if (!locale) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  await db.query('UPDATE "users" SET "locale" = $1 WHERE id = $2', [locale, session.user.id]);
  return NextResponse.json({ locale });
}

