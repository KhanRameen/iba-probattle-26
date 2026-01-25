import { auth } from "@/utils/lib/auth";
import { prisma } from "@/utils/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession();

  if (!session) return Response.json(null);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return Response.json({ user, session });
}
