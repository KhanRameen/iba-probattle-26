import { prisma } from "@/utils/lib/prisma";
import { requireRole } from "@/utils/lib/rbac";
import { NextResponse } from "next/server";

const ListingTypes = ["SERVICE", "SKILL", "TOOL"] as const;
type ListingType = (typeof ListingTypes)[number];

export async function GET(req: Request) {
  const userOrResponse = await requireRole(req, ["PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const services = await prisma.service.findMany({
    where: { providerId: user.id },
    include: {
      bookings: {
        select: {
          id: true,
          status: true,
          rating: true,
          seeker: { select: { name: true } },
        },
      },
      neighborhood: { select: { name: true } },
    },
  });

  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const userOrResponse = await requireRole(req, ["PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const body = await req.json();
  const { title, description, price, type, neighborhoodName } = body;

  if (!title || !description || !price || !type || !neighborhoodName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!ListingTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const neighborhood = await prisma.neighborhood.findUnique({
    where: { name: neighborhoodName },
  });

  if (!neighborhood) {
    return NextResponse.json(
      { error: "Neighborhood not found" },
      { status: 400 },
    );
  }

  const service = await prisma.service.create({
    data: {
      title,
      description,
      price: Number(price),
      providerId: user.id, // always from session
      neighborhoodId: neighborhood.id,
      type: type as ListingType,
    },
  });

  return NextResponse.json(service);
}
