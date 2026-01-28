const prisma = require('../utils/prisma');
const { matchOfferToRequests } = require('../services/matching.service');

const createOffer = async (req, res) => {
  try {
    // Extract new mandatory fields
    const { 
      type, usage, landStatus, city, district, 
      areaFrom, areaTo, priceFrom, priceTo, 
      exclusivity, description, coordinates 
    } = req.body;

    const data = {
      type, usage, landStatus, city, district,
      areaFrom: parseFloat(areaFrom),
      areaTo: parseFloat(areaTo),
      priceFrom: parseFloat(priceFrom),
      priceTo: parseFloat(priceTo),
      exclusivity,
      description,
      coordinates,
      createdById: req.user.id
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
    // Visibility: Visible to ALL (No ownership filter)
    const { type, usage, city, district, minPrice, maxPrice, minArea, maxArea } = req.query;
    const where = {};

    if (type) where.type = type;
    if (usage) where.usage = usage;
    if (city) where.city = { contains: city, mode: 'insensitive' }; // Flexible
    if (district) where.district = { contains: district, mode: 'insensitive' };

    // Range Filters
    // If Offer Price (From-To) overlaps with search range? 
    // Or normally: Offer Price >= user Min and Offer Price <= User Max?
    // Since Offer is also a range, it's ambiguous. 
    // Let's assume user searches for a specific value X, does it fit in the bucket?
    // Or user searches R1-R2. 
    // Let's implement: "Has any price >= minPrice" and "Has any price <= maxPrice"
    // Effectively: priceTo >= minPrice AND priceFrom <= maxPrice (Overlap Logic)
    
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
        createdBy: { 
          select: { id: true, name: true, role: true } 
        } 
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

    await prisma.offer.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOffer, getOffers, updateOffer, deleteOffer };
