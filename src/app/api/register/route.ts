import { db } from "@/lib/clients";
import { auth } from "@/lib/auth";
import { isAdminRole, type UserRole } from "@/lib/rbac";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(session.user.roles)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const { email, password, role } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (role !== undefined && role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Role must be either 'admin' or 'user'" }, { status: 400 });
    }
    const selectedRole: UserRole = role === "admin" ? "admin" : "user";

    if (!normalizedEmail || typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        [selectedRole]
      );

      if (!roleResult.rows[0]?.id) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: `Role '${selectedRole}' is not configured` }, { status: 500 });
      }

      const newUserQuery =
        'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email';
      const newUser = (await client.query(newUserQuery, [userId, normalizedEmail, hashedPassword])).rows[0];

      await client.query(
        'INSERT INTO user_roles ("userId", "roleId") VALUES ($1, $2)',
        [newUser.id, roleResult.rows[0].id]
      );

      await client.query('COMMIT');
      return NextResponse.json(
        {
          message: "User registered successfully",
          user: { ...newUser, role: selectedRole },
        },
        { status: 201 }
      );
    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
