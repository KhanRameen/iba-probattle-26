import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function requireRole(request: Request, allowedRoles: string[]) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.role) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  if (!allowedRoles.includes(user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return user;
}
