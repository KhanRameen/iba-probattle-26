import { NextResponse } from "next/server";

import { gridDisk } from "h3-js";
import { prisma } from "@/utils/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    //todo: update user id get from auth session
    const userId = searchParams.get("userId");
    const radiusKm = Number(searchParams.get("radius")) || 5;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Mapping: radius in km to H3 rings
    const radiusToRing: Record<number, number> = {
      5: 2,
      10: 3,
      25: 5,
    };

    const k = radiusToRing[radiusKm];
    if (!k) {
      return NextResponse.json(
        { error: "Invalid radius. Allowed: 5, 10, 25 km" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { neighborhood: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userH3 = user.neighborhood?.h3Index;

    if (!userH3) {
      return NextResponse.json(
        { error: "User does not have a neighborhood with H3 index" },
        { status: 400 },
      );
    }

    const nearbyCells = gridDisk(userH3, k);

    const services = await prisma.service.findMany({
      where: {
        neighborhood: {
          h3Index: { in: nearbyCells },
        },
      },
      include: {
        provider: { select: { name: true } },
        neighborhood: { select: { name: true } },
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Nearby services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
