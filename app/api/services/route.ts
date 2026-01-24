import { prisma } from "@/utils/lib/prisma";
import { NextResponse } from "next/server";

//create a service
export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, price, providerId } = body;

  if (!title || !description || !price || !providerId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider || provider.role !== "PROVIDER") {
    return NextResponse.json(
      { error: "Only providers can create services" },
      { status: 403 },
    );
  }

  const service = await prisma.service.create({
    data: {
      title,
      description,
      price: Number(price),
      providerId,
    },
  });

  return NextResponse.json(service);
}

//get all services
export async function GET() {
  const services = await prisma.service.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      createdAt: true,

      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(services);
}
