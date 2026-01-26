const prisma = require('../utils/prisma');
const { matchOfferToRequests } = require('../services/matching.service');

const createOffer = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    const offer = await prisma.offer.create({ data });

    // Trigger Matching in background (don't await to keep response fast)
    matchOfferToRequests(offer).catch(console.error);

    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOffers = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'BROKER') {
      where.userId = req.user.id;
    }
    // Add more filters from req.query here

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOffer, getOffers };
