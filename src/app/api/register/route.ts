import { db } from "@/lib/clients";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Use a transaction to create user and assign role
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const newUserQuery = 'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email';
      const newUser = (await client.query(newUserQuery, [userId, email, hashedPassword])).rows[0];

      const userRoleQuery = 'INSERT INTO user_roles ("userId", "roleId") VALUES ($1, $2)';
      const USER_ROLE_ID = 2; // 'user' role
      await client.query(userRoleQuery, [newUser.id, USER_ROLE_ID]);

      await client.query('COMMIT');
      return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });
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
