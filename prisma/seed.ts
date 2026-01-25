import { prisma } from "@/utils/lib/prisma";
import { latLngToCell } from "h3-js";

const resolution = 7;

const neighborhoods = [
  { name: "Gulshan", lat: 24.9121, lng: 67.0707 },
  { name: "DHA", lat: 24.8125, lng: 67.0336 },
  { name: "PECHS", lat: 24.8828, lng: 67.0566 },
  { name: "Clifton", lat: 24.8086, lng: 67.027 },
  { name: "Korangi", lat: 24.87, lng: 67.145 },
];

const withH3 = neighborhoods.map((n) => ({
  ...n,
  h3Index: latLngToCell(n.lat, n.lng, resolution),
}));

async function main() {
  for (const n of withH3) {
    await prisma.neighborhood.upsert({
      where: { name: n.name },
      update: {},
      create: {
        name: n.name,
        lat: n.lat,
        lng: n.lng,
        h3Index: n.h3Index,
      },
    });
  }
  console.log("Seeded neighborhoods");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
