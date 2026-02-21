import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { verifyOtp } from "@/lib/totp";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const MIN_PASSWORD_LENGTH = 10;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const currentPassword =
      typeof payload.currentPassword === "string" ? payload.currentPassword : "";
    const newPassword =
      typeof payload.newPassword === "string" ? payload.newPassword : "";
    const code = typeof payload.code === "string" ? payload.code.trim() : "";

    if (!currentPassword || !newPassword || !code) {
      return NextResponse.json(
        { error: "Current password, new password, and 2FA code are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "2FA code must be 6 digits" }, { status: 400 });
    }

    const userResult = await db.query(
      `SELECT password, two_factor_enabled, two_factor_secret
       FROM users
       WHERE id = $1`,
      [session.user.id]
    );
    const user = userResult.rows[0];

    if (!user?.password) {
      return NextResponse.json({ error: "User account is missing a password" }, { status: 400 });
    }

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return NextResponse.json(
        { error: "2FA must be enabled before changing password" },
        { status: 400 }
      );
    }

    const matchesCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!matchesCurrentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    if (!verifyOtp(code, user.two_factor_secret)) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      session.user.id,
    ]);

    return NextResponse.json(
      { message: "Password changed successfully. Please sign in again." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
