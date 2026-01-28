-- Drop old enums and recreate with new values
DROP TYPE IF EXISTS "ListingType" CASCADE;
DROP TYPE IF EXISTS "PropertyType" CASCADE;

-- Create new enums
CREATE TYPE "PropertyType" AS ENUM ('LAND', 'PROJECT', 'PLAN');
CREATE TYPE "UsageType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'ADMINISTRATIVE', 'INDUSTRIAL', 'AGRICULTURAL');
CREATE TYPE "LandStatus" AS ENUM ('RAW', 'DEVELOPED');
CREATE TYPE "ExclusivityType" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE');
CREATE TYPE "PriorityType" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- Drop old tables
DROP TABLE IF EXISTS "Match" CASCADE;
DROP TABLE IF EXISTS "Offer" CASCADE;
DROP TABLE IF EXISTS "Request" CASCADE;

-- Recreate Offer table with new schema
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "type" "PropertyType" NOT NULL,
    "usage" "UsageType" NOT NULL,
    "landStatus" "LandStatus" NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "areaFrom" DOUBLE PRECISION NOT NULL,
    "areaTo" DOUBLE PRECISION NOT NULL,
    "priceFrom" DECIMAL(15,2) NOT NULL,
    "priceTo" DECIMAL(15,2) NOT NULL,
    "exclusivity" "ExclusivityType" NOT NULL,
    "coordinates" TEXT,
    "description" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- Recreate Request table with new schema
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "type" "PropertyType" NOT NULL,
    "usage" "UsageType" NOT NULL,
    "landStatus" "LandStatus" NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "areaFrom" DOUBLE PRECISION NOT NULL,
    "areaTo" DOUBLE PRECISION NOT NULL,
    "budgetFrom" DECIMAL(15,2) NOT NULL,
    "budgetTo" DECIMAL(15,2) NOT NULL,
    "priority" "PriorityType" NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- Recreate Match table
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "offerId" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- Create Notification table
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "AuditAction" NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" INTEGER,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Request" ADD CONSTRAINT "Request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX "Match_offerId_requestId_key" ON "Match"("offerId", "requestId");
