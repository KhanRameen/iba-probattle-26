import { prisma } from "@/utils/lib/prisma";
import { requireRole } from "@/utils/lib/rbac";
import { NextResponse } from "next/server";

//list only providers serivice
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
          seeker: { select: { name: true } },
          rating: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json(services);
}

//create a service
export async function POST(req: Request) {
  const userOrResponse = await requireRole(req, ["PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const body = await req.json();
  const { title, description, price, providerId, type, neighborhoodName } =
    body;

  if (!title || !description || !price || !providerId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    include: { neighborhood: true },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  if (provider.role !== "PROVIDER") {
    return NextResponse.json(
      { error: "Only providers can create services" },
      { status: 403 },
    );
  }

  let neighborhoodId: string;

  if (neighborhoodName) {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { name: neighborhoodName },
    });

    if (!neighborhood) {
      return NextResponse.json(
        { error: "Invalid neighborhood" },
        { status: 400 },
      );
    }

    neighborhoodId = neighborhood.id;
  } else {
    neighborhoodId = provider?.neighborhoodId!;
  }

  const service = await prisma.service.create({
    data: {
      title,
      description,
      price: Number(price),
      providerId,
      neighborhoodId,
      type,
    },
  });

  return NextResponse.json(service);
}
