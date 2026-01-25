import { auth } from "@/utils/lib/auth";
import { prisma } from "@/utils/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/auth")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user?.neighborhoodId) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-4xl">Neighbourly</h1>
    </div>
  );
}
