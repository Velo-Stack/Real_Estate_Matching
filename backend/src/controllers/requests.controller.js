const prisma = require('../utils/prisma');
const { matchRequestToOffers } = require('../services/matching.service');

const createRequest = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
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
    const where = {};
    if (req.user.role === 'BROKER') {
      where.userId = req.user.id;
    }

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createRequest, getRequests };
