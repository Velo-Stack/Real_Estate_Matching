const prisma = require('../utils/prisma');
const { matchRequestToOffers } = require('../services/matching.service');

const createRequest = async (req, res) => {
  try {
    const { 
      type, usage, landStatus, city, district, 
      areaFrom, areaTo, budgetFrom, budgetTo, 
      priority 
    } = req.body;

    // Validate required fields
    if (!type || !usage || !landStatus || !city || !district || 
        areaFrom === undefined || areaTo === undefined || 
        budgetFrom === undefined || budgetTo === undefined || !priority) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const data = {
      type,
      usage,
      landStatus,
      city,
      district,
      areaFrom: parseFloat(areaFrom),
      areaTo: parseFloat(areaTo),
      budgetFrom: parseFloat(budgetFrom) || 0,
      budgetTo: parseFloat(budgetTo) || 0,
      priority,
      createdById: req.user.id
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
    // Visibility: All visible
    const { type, usage, city, district, minBudget, maxBudget, minArea, maxArea, priority } = req.query;
    const where = {};

    if (type) where.type = type;
    if (usage) where.usage = usage;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (priority) where.priority = priority;
    
    // Budget Overlap: budgetTo >= minQuery AND budgetFrom <= maxQuery
    if (minBudget) where.budgetTo = { gte: parseFloat(minBudget) };
    if (maxBudget) where.budgetFrom = { lte: parseFloat(maxBudget) };

    if (minArea) where.areaTo = { gte: parseFloat(minArea) };
    if (maxArea) where.areaFrom = { lte: parseFloat(maxArea) };

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        createdBy: { 
          select: { id: true, name: true, role: true } 
        } 
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
