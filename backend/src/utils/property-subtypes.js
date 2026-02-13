const PROPERTY_SUBTYPES_BY_USAGE = {
  RESIDENTIAL: ['LAND', 'APARTMENT', 'VILLA', 'FLOOR', 'TOWNHOUSE', 'DUPLEX', 'PALACE'],
  COMMERCIAL: ['LAND', 'RESIDENTIAL_BUILDING', 'COMMERCIAL_BUILDING', 'RESIDENTIAL_TOWER', 'HOTEL', 'HOSPITAL', 'SHOWROOM', 'RESIDENTIAL_COMPOUND'],
  ADMINISTRATIVE: ['OFFICE', 'OFFICE_TOWER', 'ADMIN_BUILDING'],
  INDUSTRIAL: ['LAND', 'EXISTING_WAREHOUSE', 'LOW_RISK_WORKSHOP', 'HIGH_RISK_WORKSHOP', 'FACTORY'],
  AGRICULTURAL: ['LAND', 'EXISTING_FARM', 'RESORT', 'CHALET']
};

const SUBMITTED_BY_TYPES = ['OWNER', 'AGENT', 'DIRECT_BROKER', 'BROKER', 'BUYER'];

const isValidSubtypeForUsage = (usage, propertySubType) => {
  if (!propertySubType) return true;
  if (!usage) return false;
  const allowedSubTypes = PROPERTY_SUBTYPES_BY_USAGE[usage] || [];
  return allowedSubTypes.includes(propertySubType);
};

const getAllPropertySubTypes = () => {
  const allSubTypes = new Set();
  Object.values(PROPERTY_SUBTYPES_BY_USAGE).forEach((list) => {
    list.forEach((item) => allSubTypes.add(item));
  });
  return Array.from(allSubTypes);
};

module.exports = {
  PROPERTY_SUBTYPES_BY_USAGE,
  SUBMITTED_BY_TYPES,
  isValidSubtypeForUsage,
  getAllPropertySubTypes
};
