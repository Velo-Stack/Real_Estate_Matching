-- CreateEnum
CREATE TYPE "SubmittedByType" AS ENUM ('OWNER', 'AGENT', 'DIRECT_BROKER', 'BROKER', 'BUYER');

-- CreateEnum
CREATE TYPE "PropertySubType" AS ENUM (
  'LAND',
  'APARTMENT',
  'VILLA',
  'FLOOR',
  'TOWNHOUSE',
  'DUPLEX',
  'PALACE',
  'RESIDENTIAL_BUILDING',
  'COMMERCIAL_BUILDING',
  'RESIDENTIAL_TOWER',
  'HOTEL',
  'HOSPITAL',
  'SHOWROOM',
  'RESIDENTIAL_COMPOUND',
  'OFFICE',
  'OFFICE_TOWER',
  'ADMIN_BUILDING',
  'EXISTING_WAREHOUSE',
  'LOW_RISK_WORKSHOP',
  'HIGH_RISK_WORKSHOP',
  'FACTORY',
  'EXISTING_FARM',
  'RESORT',
  'CHALET'
);

-- AlterTable
ALTER TABLE "Offer"
ADD COLUMN "submittedBy" "SubmittedByType",
ADD COLUMN "propertySubType" "PropertySubType",
ADD COLUMN "boundaries" TEXT,
ADD COLUMN "lengths" TEXT,
ADD COLUMN "facades" TEXT,
ADD COLUMN "brokerContactName" TEXT,
ADD COLUMN "brokerContactPhone" TEXT;

-- AlterTable
ALTER TABLE "Request"
ADD COLUMN "submittedBy" "SubmittedByType",
ADD COLUMN "propertySubType" "PropertySubType",
ADD COLUMN "description" TEXT,
ADD COLUMN "brokerContactName" TEXT,
ADD COLUMN "brokerContactPhone" TEXT;
