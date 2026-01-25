import { prisma } from "@/utils/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const neighborhoods = await prisma.neighborhood.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(neighborhoods);
}
