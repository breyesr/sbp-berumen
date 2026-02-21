import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { NextResponse } from "next/server";
import { generateSecret, generateOtpAuthUri } from '@/lib/totp';
import qrcode from 'qrcode';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateSecret();
    const otpauth = generateOtpAuthUri(session.user.email, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

    await db.query('UPDATE users SET "two_factor_secret" = $1 WHERE id = $2', [secret, session.user.id]);

    return NextResponse.json({ qrCodeDataUrl, secret });
  } catch (error) {
    console.error("Error generating 2FA secret:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
