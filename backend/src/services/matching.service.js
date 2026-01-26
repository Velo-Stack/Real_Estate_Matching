const prisma = require('../utils/prisma');

// 1. Triggered when NEW OFFER is created
const matchOfferToRequests = async (offer) => {
  // Find matching requests
  const requests = await prisma.request.findMany({
    where: {
      type: offer.type, // Sale/Rent match
      propertyType: offer.propertyType,
      minPrice: { lte: offer.price },
      maxPrice: { gte: offer.price },
      minArea: { lte: offer.area },
      maxArea: { gte: offer.area },
      // location: { contains: offer.location } // Simple string match for MVP
    }
  });

  const matches = requests.map(req => ({
    offerId: offer.id,
    requestId: req.id,
    score: 100, // 100% match for now since we filtered strictly
    status: 'NEW'
  }));

  if (matches.length > 0) {
    await prisma.match.createMany({
      data: matches,
      skipDuplicates: true
    });
    console.log(`Matching Service: Created ${matches.length} matches for Offer #${offer.id}`);
  }
};

// 2. Triggered when NEW REQUEST is created
const matchRequestToOffers = async (request) => {
  // Find matching offers
  const offers = await prisma.offer.findMany({
    where: {
      type: request.type,
      propertyType: request.propertyType,
      price: { gte: request.minPrice, lte: request.maxPrice },
      area: { gte: request.minArea, lte: request.maxArea },
      // location: { contains: request.location }
    }
  });

  const matches = offers.map(offer => ({
    offerId: offer.id,
    requestId: request.id,
    score: 100,
    status: 'NEW'
  }));

  if (matches.length > 0) {
    await prisma.match.createMany({
      data: matches,
      skipDuplicates: true
    });
    console.log(`Matching Service: Created ${matches.length} matches for Request #${request.id}`);
  }
};

module.exports = {
  matchOfferToRequests,
  matchRequestToOffers
};
