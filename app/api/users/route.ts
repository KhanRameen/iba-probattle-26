//create user: provider/seeker

import { auth } from "@/utils/lib/auth";
import { prisma } from "@/utils/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import * as z from "zod";

//schema
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["PROVIDER", "SEEKER"]),
  neighborhoodId: z.string().uuid("Invalid neighborhood id"),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, role, neighborhoodId } = parsed.data;

  const neighborhood = await prisma.neighborhood.findUnique({
    where: { id: neighborhoodId },
  });

  if (!neighborhood) {
    return NextResponse.json(
      { error: "Neighborhood not found" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name,
      role,
      neighborhoodId,
    },
  });

  return NextResponse.json({ data: user }, { status: 200 });
}
