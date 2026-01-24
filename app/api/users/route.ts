//create user: provider/seeker

import { prisma } from "@/utils/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body;

  try {
    body = await req.json();
    console.log(body);
  } catch {
    console.log(body);
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: `Error Creating User. User:${user}` },
      { status: 500 },
    );
  }
  return NextResponse.json(user);
}
