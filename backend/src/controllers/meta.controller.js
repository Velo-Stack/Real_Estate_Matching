const prisma = require('../utils/prisma');
const { PROPERTY_SUBTYPES_BY_USAGE, SUBMITTED_BY_TYPES, getAllPropertySubTypes } = require('../utils/property-subtypes');

const getEnums = async (req, res) => {
  try {
    // Return enum lists used by frontend for dropdowns
    return res.json({
      propertyTypes: ['LAND', 'PROJECT', 'PLAN'],
      usageTypes: ['RESIDENTIAL', 'COMMERCIAL', 'ADMINISTRATIVE', 'INDUSTRIAL', 'AGRICULTURAL'],
      landStatuses: ['RAW', 'DEVELOPED'],
      exclusivityTypes: ['EXCLUSIVE', 'NON_EXCLUSIVE'],
      purposeTypes: ['SALE', 'RENT', 'PARTNERSHIP', 'INVESTMENT'],
      contractTypes: ['WITH_MEDIATION_CONTRACT', 'WITHOUT_MEDIATION_CONTRACT'],
      priorityTypes: ['HIGH', 'MEDIUM', 'LOW'],
      submittedByTypes: SUBMITTED_BY_TYPES,
      propertySubTypes: getAllPropertySubTypes(),
      propertySubTypesByUsage: PROPERTY_SUBTYPES_BY_USAGE
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({ include: { neighborhoods: true }, orderBy: { name: 'asc' } });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNeighborhoods = async (req, res) => {
  try {
    const { cityId } = req.query;
    const where = {};
    if (cityId) where.cityId = parseInt(cityId);
    const neighborhoods = await prisma.neighborhood.findMany({ where, orderBy: { name: 'asc' } });
    res.json(neighborhoods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEnums, getCities, getNeighborhoods };
