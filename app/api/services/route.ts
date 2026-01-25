import { prisma } from "@/utils/lib/prisma";
import { requireRole } from "@/utils/lib/rbac";
import { NextResponse } from "next/server";

//get all services
//filter services
import { gridDisk } from "h3-js";
import { ListingType } from "@/generated/prisma/enums";

export async function GET(req: Request) {
  const userOrResponse = await requireRole(req, ["SEEKER", "PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const url = new URL(req.url);
  const typeParam = url.searchParams.get("type") as ListingType | null;
  const category = url.searchParams.get("category");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const radiusKm = url.searchParams.get("radius"); // optional

  let h3Filter: string[] | undefined = undefined;

  if (radiusKm && user.neighborhoodId) {
    const userNeighborhood = await prisma.neighborhood.findUnique({
      where: { id: user?.neighborhoodId },
    });

    if (!userNeighborhood)
      return NextResponse.json(
        { error: "User neighborhood not found" },
        { status: 400 },
      );

    const userH3 = userNeighborhood.h3Index;
    const k = radiusKmToH3Steps(Number(radiusKm));
    h3Filter = gridDisk(userH3, k);
  }

  const services = await prisma.service.findMany({
    where: {
      ...(typeParam ? { type: typeParam } : {}),
      ...(category && { category }),
      ...(minPrice || maxPrice
        ? {
            price: {
              gte: Number(minPrice) || 0,
              lte: Number(maxPrice) || 100000,
            },
          }
        : {}),
      ...(h3Filter ? { h3Index: { in: h3Filter } } : {}),
    },
    include: {
      provider: { select: { name: true } },
      bookings: { select: { id: true, seekerId: true, rating: true } },
    },
  });

  return NextResponse.json(services);
}

// Approx conversion (rough)
function radiusKmToH3Steps(km: number) {
  if (km <= 5) return 1;
  if (km <= 10) return 2;
  return 3;
}
