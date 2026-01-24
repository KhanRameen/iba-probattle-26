import { prisma } from "@/utils/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { serviceId, seekerId } = body;

  if (!serviceId || !seekerId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  if (service.providerId === seekerId) {
    return NextResponse.json(
      { error: "You cannot book your own service" },
      { status: 400 },
    );
  }

  const seeker = await prisma.user.findUnique({
    where: { id: seekerId },
  });

  if (!seeker || seeker.role !== "SEEKER") {
    return NextResponse.json(
      { error: "Only seekers can book services" },
      { status: 403 },
    );
  }

  const booking = await prisma.booking.create({
    data: {
      serviceId,
      seekerId,
      status: "PENDING",
    },
  });

  return NextResponse.json(booking);
}
