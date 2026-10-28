import { db } from "./db";

async function main() {
  const existing = await db.orm.public.Service.first();
  if (existing) {
    console.log("Services already exist; seed skipped.");
    await db.close();
    return;
  }

  await db.orm.public.Service.create({
    name: "Example",
    url: "https://example.com",
    description: "Sample public endpoint.",
    position: 0,
  });
  await db.orm.public.Service.create({
    name: "Example mirror",
    url: "https://example.org",
    description: "Second sample endpoint.",
    position: 1,
  });
  console.log("Seeded two example services.");
  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});
