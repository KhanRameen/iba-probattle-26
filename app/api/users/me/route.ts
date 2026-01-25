// // app/api/users/me/route.ts
import { auth } from "@/utils/lib/auth";
import { prisma } from "@/utils/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Get session using request headers
    const session = await auth.api.getSession({
      headers: req.headers, // important!
    });

    if (!session?.user) {
      return NextResponse.json(null, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        neighborhoodId: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
