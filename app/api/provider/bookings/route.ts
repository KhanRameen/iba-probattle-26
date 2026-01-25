import { prisma } from "@/utils/lib/prisma";
import { requireRole } from "@/utils/lib/rbac";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userOrResponse = await requireRole(req, ["PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const bookings = await prisma.booking.findMany({
    where: { service: { providerId: user.id } },
    include: {
      service: true,
      seeker: { select: { name: true } },
    },
  });

  return NextResponse.json(bookings);
}
