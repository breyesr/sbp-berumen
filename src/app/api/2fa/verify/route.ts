import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { verifyOtp } from '@/lib/totp';
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "2FA code is required" }, { status: 400 });
    }

    const userResult = await db.query('SELECT "two_factor_secret" FROM users WHERE id = $1', [session.user.id]);
    const user = userResult.rows[0];

    if (!user?.two_factor_secret) {
      return NextResponse.json({ error: "2FA is not set up for this user" }, { status: 400 });
    }

    const isValid = verifyOtp(code, user.two_factor_secret);

    if (isValid) {
      await db.query('UPDATE users SET "two_factor_enabled" = TRUE WHERE id = $1', [session.user.id]);
      return NextResponse.json({ message: "2FA enabled successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying 2FA code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
