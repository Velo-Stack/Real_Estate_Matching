const prisma = require('../utils/prisma');
const { matchOfferToRequests } = require('../services/matching.service');
const { SUBMITTED_BY_TYPES, isValidSubtypeForUsage } = require('../utils/property-subtypes');

// Helper: Get user's team ID
const getUserTeamId = async (userId) => {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true }
  });
  return membership?.teamId || null;
};

const createOffer = async (req, res) => {
  try {
    // Extract fields (supporting new fields for dropdowns/relations)
    const {
      type, usage, landStatus, city, district, cityId, neighborhoodId, purpose, brokersCount,
      areaFrom, areaTo, priceFrom, priceTo,
      exclusivity, contractType, description, coordinates,
      submittedBy, propertySubType, boundaries, lengths, facades, brokerContactName, brokerContactPhone
    } = req.body;

    // Basic validation: keep numeric ranges mandatory, others optional (add more rules later as needed)
    if (!type || !usage || areaFrom === undefined || areaTo === undefined ||
      priceFrom === undefined || priceTo === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (submittedBy && !SUBMITTED_BY_TYPES.includes(submittedBy)) {
      return res.status(400).json({ message: 'Invalid submittedBy value' });
    }
    if (!isValidSubtypeForUsage(usage, propertySubType)) {
      return res.status(400).json({ message: 'propertySubType is not valid for selected usage' });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Get user's team ID
    const teamId = await getUserTeamId(req.user.id);

    const data = {
      type,
      usage,
      landStatus: landStatus || null,
      city: city || null,
      district: district || null,
      cityId: cityId ? parseInt(cityId) : null,
      neighborhoodId: neighborhoodId ? parseInt(neighborhoodId) : null,
      purpose: purpose || null,
      brokersCount: brokersCount ? parseInt(brokersCount) : null,
      areaFrom: parseFloat(areaFrom),
      areaTo: parseFloat(areaTo),
      priceFrom: parseFloat(priceFrom) || 0,
      priceTo: parseFloat(priceTo) || 0,
      exclusivity: exclusivity || null,
      contractType: contractType || null,
      submittedBy: submittedBy || null,
      propertySubType: propertySubType || null,
      boundaries: boundaries || null,
      lengths: lengths || null,
      facades: facades || null,
      brokerContactName: brokerContactName || null,
      brokerContactPhone: brokerContactPhone || null,
      description,
      coordinates,
      createdById: req.user.id,
      teamId // Auto-assign team
    };

    const offer = await prisma.offer.create({ data });

    // Trigger Matching
    matchOfferToRequests(offer).catch(console.error);

    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOffers = async (req, res) => {
  try {
    const { role } = req.user;
    const {
      type, usage, city, district, minPrice, maxPrice, minArea, maxArea,
      cityId, neighborhoodId, purpose, brokersCount, submittedBy, propertySubType
    } = req.query;
    const where = {};

    // Team-based filtering for MANAGER and BROKER
    if (role !== 'ADMIN') {
      const teamId = await getUserTeamId(req.user.id);
      if (teamId) {
        where.teamId = teamId;
      }
    }

    if (type) where.type = type;
    if (usage) where.usage = usage;
    if (city) where.city = { contains: city, mode: 'insensitive' }; // Flexible
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (cityId) where.cityId = parseInt(cityId);
    if (neighborhoodId) where.neighborhoodId = parseInt(neighborhoodId);
    if (purpose) where.purpose = purpose;
    if (brokersCount) where.brokersCount = parseInt(brokersCount);
    if (submittedBy) where.submittedBy = submittedBy;
    if (propertySubType) where.propertySubType = propertySubType;

    // Range Filters
    if (minPrice) where.priceTo = { gte: parseFloat(minPrice) };
    if (maxPrice) where.priceFrom = { lte: parseFloat(maxPrice) };

    if (minArea) where.areaTo = { gte: parseFloat(minArea) };
    if (maxArea) where.areaFrom = { lte: parseFloat(maxArea) };

    // Additional: Filter by Specific Broker? "Search by Broker"
    if (req.query.brokerId) where.createdById = parseInt(req.query.brokerId);

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        cityRel: { select: { id: true, name: true } },
        neighborhoodRel: { select: { id: true, name: true, cityId: true } },
        team: { select: { id: true, name: true } }
      }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const offer = await prisma.offer.findUnique({ where: { id: parseInt(id) } });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // Permission: Admin/Manager OR Owner
    if (role === 'BROKER' && offer.createdById !== userId) {
      return res.status(403).json({ message: 'You can only update your own offers' });
    }

    // Store old data for audit
    req.oldData = offer;
    const finalUsage = req.body.usage || offer.usage;
    const finalPropertySubType = req.body.propertySubType || offer.propertySubType;
    const finalSubmittedBy = req.body.submittedBy || offer.submittedBy;
    if (finalSubmittedBy && !SUBMITTED_BY_TYPES.includes(finalSubmittedBy)) {
      return res.status(400).json({ message: 'Invalid submittedBy value' });
    }
    if (!isValidSubtypeForUsage(finalUsage, finalPropertySubType)) {
      return res.status(400).json({ message: 'propertySubType is not valid for selected usage' });
    }

    const updated = await prisma.offer.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const offer = await prisma.offer.findUnique({ where: { id: parseInt(id) } });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (role === 'BROKER' && offer.createdById !== userId) {
      return res.status(403).json({ message: 'You can only delete your own offers' });
    }

    // Store old data for audit
    req.oldData = offer;

    await prisma.offer.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOffer, getOffers, updateOffer, deleteOffer };
