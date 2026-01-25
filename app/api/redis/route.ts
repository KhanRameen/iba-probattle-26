import { redis } from "@/utils/redis";

export async function GET(req: Request) {
  const cacheKey = "services:all";

  // Check Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const services = await prisma.service.findMany({
    include: { provider: { select: { name: true } } },
  });

  // Save to Redis for 1 minute
  await redis.set(cacheKey, JSON.stringify(services), "EX", 60);

  return new Response(JSON.stringify(services), { status: 200 });
}
