const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Reuse the application's Prisma instance (ensures same adapter/config)
const prisma = require('../src/utils/prisma');

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('Prisma client keys:', Object.keys(prisma).slice(0, 40));
  console.log('user available:', prisma.user && typeof prisma.user, 'user keys:', Object.keys(prisma.user).slice(0,20));
  console.log('prisma.user.upsert type:', typeof prisma.user.upsert, 'isUndefined:', prisma.user.upsert === undefined);

  // Test read
  const existingUsers = await prisma.user.findMany();
  console.log('existing users len:', existingUsers.length);

  // Admin User (use find/create to avoid upsert runtime path)
  let admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    admin = await prisma.user.create({ data: { email: 'admin@example.com', name: 'System Admin', password: hashedPassword, role: 'ADMIN' } });
  }

  // Broker User
  let broker = await prisma.user.findUnique({ where: { email: 'broker@example.com' } });
  if (!broker) {
    broker = await prisma.user.create({ data: { email: 'broker@example.com', name: 'Ahmed Broker', password: hashedPassword, role: 'BROKER' } });
  }

  // Seed Cities & Neighborhoods
  let riyadh = await prisma.city.findFirst({ where: { name: 'الرياض' } });
  if (!riyadh) riyadh = await prisma.city.create({ data: { name: 'الرياض' } });
  let jeddah = await prisma.city.findFirst({ where: { name: 'جدة' } });
  if (!jeddah) jeddah = await prisma.city.create({ data: { name: 'جدة' } });
  let mecca = await prisma.city.findFirst({ where: { name: 'مكة المكرمة' } });
  if (!mecca) mecca = await prisma.city.create({ data: { name: 'مكة المكرمة' } });
  let eastern = await prisma.city.findFirst({ where: { name: 'المنطقة الشرقية' } });
  if (!eastern) eastern = await prisma.city.create({ data: { name: 'المنطقة الشرقية' } });

  let deraiya = await prisma.neighborhood.findFirst({ where: { name: 'الدرعية' } });
  if (!deraiya) deraiya = await prisma.neighborhood.create({ data: { name: 'الدرعية', cityId: riyadh.id } });
  let alShatea = await prisma.neighborhood.findFirst({ where: { name: 'الشاطئ' } });
  if (!alShatea) alShatea = await prisma.neighborhood.create({ data: { name: 'الشاطئ', cityId: jeddah.id } });

  // Create sample Offers
  const offer1 = await prisma.offer.create({
    data: {
      type: 'LAND',
      usage: 'RESIDENTIAL',
      landStatus: 'RAW',
      city: 'الرياض',
      district: 'الدرعية',
      cityId: riyadh.id,
      neighborhoodId: deraiya.id,
      purpose: 'SALE',
      brokersCount: 1,
      contractType: 'WITH_MEDIATION_CONTRACT',
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
      cityId: jeddah.id,
      neighborhoodId: alShatea.id,
      purpose: 'SALE',
      brokersCount: 2,
      contractType: 'WITHOUT_MEDIATION_CONTRACT',
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
      cityId: riyadh.id,
      neighborhoodId: deraiya.id,
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

  // Create a Manager user and assign to teams
  let manager = await prisma.user.findUnique({ where: { email: 'manager@example.com' } });
  if (!manager) manager = await prisma.user.create({ data: { email: 'manager@example.com', name: 'Manager User', password: hashedPassword, role: 'MANAGER' } });

  // Create default teams (find or create)
  let landsTeam = await prisma.team.findFirst({ where: { name: 'فريق اراضي' } });
  if (!landsTeam) landsTeam = await prisma.team.create({ data: { name: 'فريق اراضي', type: 'LANDS' } });
  let propertiesTeam = await prisma.team.findFirst({ where: { name: 'فريق عقارات' } });
  if (!propertiesTeam) propertiesTeam = await prisma.team.create({ data: { name: 'فريق عقارات', type: 'PROPERTIES' } });
  let maintenanceTeam = await prisma.team.findFirst({ where: { name: 'فرق صيانه وتشغيل' } });
  if (!maintenanceTeam) maintenanceTeam = await prisma.team.create({ data: { name: 'فرق صيانه وتشغيل', type: 'MAINTENANCE' } });
  let rentalTeam = await prisma.team.findFirst({ where: { name: 'فرق تاجير' } });
  if (!rentalTeam) rentalTeam = await prisma.team.create({ data: { name: 'فرق تاجير', type: 'RENTAL' } });
  let assetTeam = await prisma.team.findFirst({ where: { name: 'فرق ادارة املاك' } });
  if (!assetTeam) assetTeam = await prisma.team.create({ data: { name: 'فرق ادارة املاك', type: 'ASSET_MANAGEMENT' } });

  // Add manager to teams as MANAGER (if not already member)
  const mgrInLands = await prisma.teamMember.findFirst({ where: { teamId: landsTeam.id, userId: manager.id } });
  if (!mgrInLands) await prisma.teamMember.create({ data: { teamId: landsTeam.id, userId: manager.id, role: 'MANAGER' } });
  const mgrInProperties = await prisma.teamMember.findFirst({ where: { teamId: propertiesTeam.id, userId: manager.id } });
  if (!mgrInProperties) await prisma.teamMember.create({ data: { teamId: propertiesTeam.id, userId: manager.id, role: 'MANAGER' } });

  // Add broker to landsTeam
  const brokerInLands = await prisma.teamMember.findFirst({ where: { teamId: landsTeam.id, userId: broker.id } });
  if (!brokerInLands) await prisma.teamMember.create({ data: { teamId: landsTeam.id, userId: broker.id, role: 'MEMBER' } });

  console.log({ admin, manager, broker, offer1, offer2, request1, match });
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
