import { prisma } from "@/utils/lib/prisma";
import { requireRole } from "@/utils/lib/rbac";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Both SEEKER and PROVIDER can book
  const userOrResponse = await requireRole(req, ["SEEKER", "PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const { serviceId } = await req.json();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service)
    return NextResponse.json({ error: "Service not found" }, { status: 404 });

  if (service.providerId === user.id) {
    return NextResponse.json(
      { error: "You cannot book your own service" },
      { status: 400 },
    );
  }

  // Prevent duplicate booking
  const existingBooking = await prisma.booking.findFirst({
    where: {
      serviceId,
      seekerId: user.id,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });
  if (existingBooking)
    return NextResponse.json({ error: "Already booked" }, { status: 400 });

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      serviceId,
      seekerId: user.id,
      status: "PENDING",
    },
  });

  return NextResponse.json(booking);
}
