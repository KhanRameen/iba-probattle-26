import { prisma } from "@/utils/lib/prisma";
import { requireRole } from "@/utils/lib/rbac";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { bookingId: string } },
) {
  const userOrResponse = await requireRole(req, ["SEEKER", "PROVIDER"]);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  const { rating, review } = await req.json();
  const bookingId = params.bookingId;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking)
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (booking.seekerId !== user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { rating, review },
  });

  return NextResponse.json(updatedBooking);
}
