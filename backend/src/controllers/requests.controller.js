const prisma = require('../utils/prisma');
const { matchRequestToOffers } = require('../services/matching.service');
const { SUBMITTED_BY_TYPES, isValidSubtypeForUsage } = require('../utils/property-subtypes');

// Helper: Get user's team ID
const getUserTeamId = async (userId) => {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true }
  });
  return membership?.teamId || null;
};

const createRequest = async (req, res) => {
  try {
    const {
      type, usage, purpose, landStatus, city, district, cityId, neighborhoodId,
      areaFrom, areaTo, budgetFrom, budgetTo,
      priority, submittedBy, propertySubType, description, brokerContactName, brokerContactPhone
    } = req.body;

    // Basic validation: keep numeric ranges mandatory
    if (!type || !usage || areaFrom === undefined || areaTo === undefined ||
      budgetFrom === undefined || budgetTo === undefined || !priority) {
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
      purpose: purpose || null,
      landStatus: landStatus || null,
      city: city || null,
      district: district || null,
      cityId: cityId ? parseInt(cityId) : null,
      neighborhoodId: neighborhoodId ? parseInt(neighborhoodId) : null,
      submittedBy: submittedBy || null,
      propertySubType: propertySubType || null,
      description: description || null,
      brokerContactName: brokerContactName || null,
      brokerContactPhone: brokerContactPhone || null,
      areaFrom: parseFloat(areaFrom),
      areaTo: parseFloat(areaTo),
      budgetFrom: parseFloat(budgetFrom) || 0,
      budgetTo: parseFloat(budgetTo) || 0,
      priority,
      createdById: req.user.id,
      teamId // Auto-assign team
    };

    const request = await prisma.request.create({ data });

    // Trigger Matching
    matchRequestToOffers(request).catch(console.error);

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const { role } = req.user;
    const {
      type, usage, purpose, city, district, minBudget, maxBudget, minArea, maxArea,
      priority, cityId, neighborhoodId, submittedBy, propertySubType
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
    if (purpose) where.purpose = purpose;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (priority) where.priority = priority;
    if (cityId) where.cityId = parseInt(cityId);
    if (neighborhoodId) where.neighborhoodId = parseInt(neighborhoodId);
    if (submittedBy) where.submittedBy = submittedBy;
    if (propertySubType) where.propertySubType = propertySubType;

    // Budget Overlap
    if (minBudget) where.budgetTo = { gte: parseFloat(minBudget) };
    if (maxBudget) where.budgetFrom = { lte: parseFloat(maxBudget) };

    if (minArea) where.areaTo = { gte: parseFloat(minArea) };
    if (maxArea) where.areaFrom = { lte: parseFloat(maxArea) };

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        cityRel: { select: { id: true, name: true } },
        neighborhoodRel: { select: { id: true, name: true, cityId: true } },
        team: { select: { id: true, name: true } }
      }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const request = await prisma.request.findUnique({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (role === 'BROKER' && request.createdById !== userId) {
      return res.status(403).json({ message: 'You can only update your own requests' });
    }

    // Store old data for audit
    req.oldData = request;
    const finalUsage = req.body.usage || request.usage;
    const finalPropertySubType = req.body.propertySubType || request.propertySubType;
    const finalSubmittedBy = req.body.submittedBy || request.submittedBy;
    if (finalSubmittedBy && !SUBMITTED_BY_TYPES.includes(finalSubmittedBy)) {
      return res.status(400).json({ message: 'Invalid submittedBy value' });
    }
    if (!isValidSubtypeForUsage(finalUsage, finalPropertySubType)) {
      return res.status(400).json({ message: 'propertySubType is not valid for selected usage' });
    }

    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const request = await prisma.request.findUnique({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (role === 'BROKER' && request.createdById !== userId) {
      return res.status(403).json({ message: 'You can only delete your own requests' });
    }

    // Store old data for audit
    req.oldData = request;

    await prisma.request.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createRequest, getRequests, updateRequest, deleteRequest };
