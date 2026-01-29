const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Broker User
  const broker = await prisma.user.upsert({
    where: { email: 'broker@example.com' },
    update: {},
    create: {
      email: 'broker@example.com',
      name: 'Ahmed Broker',
      password: hashedPassword,
      role: 'BROKER',
    },
  });

  // Create sample Offers
  const offer1 = await prisma.offer.create({
    data: {
      type: 'LAND',
      usage: 'RESIDENTIAL',
      landStatus: 'RAW',
      city: 'الرياض',
      district: 'الدرعية',
      areaFrom: 500,
      areaTo: 1000,
      priceFrom: 500000,
      priceTo: 1000000,
      exclusivity: 'EXCLUSIVE',
      description: 'أرض سكنية بموقع ممتاز',
      createdById: broker.id
    }
  });

  const offer2 = await prisma.offer.create({
    data: {
      type: 'PROJECT',
      usage: 'RESIDENTIAL',
      landStatus: 'DEVELOPED',
      city: 'جدة',
      district: 'الشاطئ',
      areaFrom: 1000,
      areaTo: 2000,
      priceFrom: 2000000,
      priceTo: 5000000,
      exclusivity: 'NON_EXCLUSIVE',
      description: 'مشروع سكني حديث',
      createdById: broker.id
    }
  });

  // Create sample Requests
  const request1 = await prisma.request.create({
    data: {
      type: 'LAND',
      usage: 'RESIDENTIAL',
      landStatus: 'RAW',
      city: 'الرياض',
      district: 'الدرعية',
      areaFrom: 500,
      areaTo: 1500,
      budgetFrom: 400000,
      budgetTo: 1500000,
      priority: 'HIGH',
      createdById: broker.id
    }
  });

  // Create sample Match
  const match = await prisma.match.create({
    data: {
      offerId: offer1.id,
      requestId: request1.id,
      score: 0.95,
      status: 'NEW'
    }
  });

  // Create sample Notification
  await prisma.notification.create({
    data: {
      userId: broker.id,
      matchId: match.id,
      status: 'UNREAD'
    }
  });

  console.log({ admin, broker, offer1, offer2, request1, match });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
