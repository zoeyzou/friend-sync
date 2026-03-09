import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 SEEDING FRIENDSYNC...");

  // 1. User
  const user = await prisma.user.upsert({
    where: { email: "zoey@example.com" },
    update: {},
    create: {
      email: "zoey@example.com",
      name: "Zoey Zou",
      image: "https://avatars.githubusercontent.com/u/123456",
    },
  });

  // 2. Clear existing
  await prisma.reminder.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.friend.deleteMany();

  // 3. Friends (NO id fields!)
  await prisma.friend.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice@work.com",
        phone: "+1-555-0101",
        reminderDays: 30,
        userId: user.id,
      },
      {
        name: "Bob Smith",
        email: "bob@friend.com",
        phone: "+1-555-0102",
        reminderDays: 7,
        userId: user.id,
      },
      {
        name: "Charlie Davis",
        email: "charlie@casual.com",
        reminderDays: 60,
        userId: user.id,
      },
      { name: "Diana Evans", reminderDays: 180, userId: user.id }, // Family
      { name: "Eric Foster", reminderDays: 14, userId: user.id }, // Recent
    ],
  });

  console.log("✅ SEED COMPLETE: 1 User + 5 Friends!");
}

main()
  .catch((e) => console.error("❌", e.message))
  .finally(() => prisma.$disconnect());
