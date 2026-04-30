import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { isAdminRole, type UserRole } from "@/lib/rbac";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Queryable = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }>;
};

async function getTargetUser(client: Queryable, userId: string) {
  return client.query(
    `SELECT
      u.id,
      u.email,
      EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur."roleId" = r.id
        WHERE ur."userId" = u.id AND r.name = 'admin'
      ) AS is_admin
    FROM users u
    WHERE u.id = $1`,
    [userId]
  );
}

async function countAdminUsers(client: Queryable) {
  const result = await client.query(
    `SELECT COUNT(DISTINCT ur."userId")::int AS count
     FROM user_roles ur
     JOIN roles r ON ur."roleId" = r.id
     WHERE r.name = 'admin'`
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(session.user.roles)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const payload = await req.json();
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : undefined;
    const role = payload.role === "admin" || payload.role === "user" ? (payload.role as UserRole) : undefined;
    const clusters = Array.isArray(payload.clusters) ? (payload.clusters as string[]) : undefined;

    if (!email && !role && !clusters) {
      return NextResponse.json({ error: "At least one field (email, role, or clusters) is required" }, { status: 400 });
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const targetResult = await getTargetUser(client, targetUserId);
      const target = targetResult.rows[0];
      if (!target) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (role) {
        if (targetUserId === session.user.id && role !== "admin") {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "You cannot remove your own admin role" },
            { status: 400 }
          );
        }

        if (target.is_admin && role !== "admin") {
          const adminCount = await countAdminUsers(client);
          if (adminCount <= 1) {
            await client.query("ROLLBACK");
            return NextResponse.json(
              { error: "Cannot remove the last admin user" },
              { status: 400 }
            );
          }
        }

        const roleResult = await client.query("SELECT id FROM roles WHERE name = $1", [role]);
        if (!roleResult.rows[0]?.id) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: `Role '${role}' is not configured` }, { status: 500 });
        }

        await client.query('DELETE FROM user_roles WHERE "userId" = $1', [targetUserId]);
        await client.query(
          'INSERT INTO user_roles ("userId", "roleId") VALUES ($1, $2)',
          [targetUserId, roleResult.rows[0].id]
        );
      }

      if (clusters) {
        await client.query('DELETE FROM user_cluster_access WHERE "userId" = $1', [targetUserId]);
        for (const clusterId of clusters) {
          await client.query(
            'INSERT INTO user_cluster_access ("userId", "clusterId") VALUES ($1, $2)',
            [targetUserId, clusterId]
          );
        }
      }

      if (email) {
        await client.query("UPDATE users SET email = $1 WHERE id = $2", [email, targetUserId]);
      }

      const updatedUserResult = await client.query(
        `SELECT
          u.id,
          u.email,
          u.two_factor_enabled,
          COALESCE(array_remove(array_agg(DISTINCT r.name), NULL), ARRAY[]::TEXT[]) AS roles,
          COALESCE(array_remove(array_agg(DISTINCT uca."clusterId"), NULL), ARRAY[]::TEXT[]) AS clusters
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur."userId"
        LEFT JOIN roles r ON ur."roleId" = r.id
        LEFT JOIN user_cluster_access uca ON u.id = uca."userId"
        WHERE u.id = $1
        GROUP BY u.id, u.email, u.two_factor_enabled`,
        [targetUserId]
      );

      await client.query("COMMIT");
      return NextResponse.json({ user: updatedUserResult.rows[0] }, { status: 200 });
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string })?.code === "23505") {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(session.user.roles)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const targetResult = await getTargetUser(client, targetUserId);
      const target = targetResult.rows[0];
      if (!target) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (target.is_admin) {
        const adminCount = await countAdminUsers(client);
        if (adminCount <= 1) {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 });
        }
      }

      await client.query("DELETE FROM users WHERE id = $1", [targetUserId]);
      await client.query("COMMIT");

      return NextResponse.json({ message: "User deleted" }, { status: 200 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
