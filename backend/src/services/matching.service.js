const prisma = require('../utils/prisma');

const calculateScore = (offer, request) => {
  let score = 0;

  // 1. Type (20%)
  if (offer.type === request.type) score += 20;

  // 2. Usage (20%)
  if (offer.usage === request.usage) score += 20;

  // 3. Location (20%) - City (10%) + District (10%)
  if (offer.city === request.city) {
    score += 10;
    if (offer.district === request.district) {
      score += 10;
    }
  }

  // 4. Area (20%) - Check Overlap
  const areaOverlap = Math.max(offer.areaFrom, request.areaFrom) <= Math.min(offer.areaTo, request.areaTo);
  if (areaOverlap) score += 20;

  // 5. Price (20%) - Check Overlap (Offer Price vs Request Budget)
  // Converting Decimal to Number for comparison
  const offerMin = Number(offer.priceFrom);
  const offerMax = Number(offer.priceTo);
  const reqMin = Number(request.budgetFrom);
  const reqMax = Number(request.budgetTo);

  const priceOverlap = Math.max(offerMin, reqMin) <= Math.min(offerMax, reqMax);
  if (priceOverlap) score += 20;

  return score;
};

const createNotifications = async (matches) => {
  const notifications = [];

  for (const item of matches) {
    // Notify Offer Owner
    // We need to fetch the Offer and Request owners if not available
    // But we have offerId and requestId.
    // Efficient way: Fetch IDs.
    // For now, let's assume we do it in a loop or optimized batch.
    // Actually, 'matches' here is the payload we are about to insert? 
    // No, we need the inserted matches to get IDs? 
    // Or we know the userIds from the context.
    
    // Complex because we are matching 1 Offer vs N Requests (N Owners).
    // Let's rely on fetching the Request owners.
    
    notifications.push({
      userId: item.offerOwnerId, // We need to pass this helper
      matchId: item.id, // We need the created match ID... 
      status: 'UNREAD'
    });
    
    notifications.push({
      userId: item.requestOwnerId,
      matchId: item.id,
      status: 'UNREAD'
    });
  }
  
  // This logic is tricky with `createMany`. 
  // We can't easily get back the IDs of created/skipped matches in one go with `skipDuplicates`.
  // Better approach for MVP: Iterate and create individually or fetch after creation.
};

const matchOfferToRequests = async (offer) => {
  console.log(`Matching for Offer #${offer.id}...`);

  // 1. Get ALL Requests (Subject to optimization later)
  // Filter via DB for at least some overlap? 
  // User wants "Compare All". But for performance, we can filter Type/Usage at DB level if rigid.
  // "Scoring" implies we might show low scores?
  // User said "Compare with all available... Generate Matches".
  // Let's filter by Type at least? (If Type mismatch, score -20 = 80 max). 
  // If user wants matches even with 0 score, we fetch all.
  // Usually partial matching is desired. I'll fetch ALL for now (MVP).
  
  const requests = await prisma.request.findMany({
    include: { createdBy: true }
  });

  const newMatches = [];

  for (const req of requests) {
    const score = calculateScore(offer, req);
    
    if (score > 0) { // Threshold?
      newMatches.push({
        offerId: offer.id,
        requestId: req.id,
        score,
        status: 'NEW',
        // Helpers for notification logic
        requestOwnerId: req.createdById, 
      });
    }
  }

  // Bulk Create Matches
  // We need to handle Notifications for NEW matches only.
  // `createMany` skips duplicates, but doesn't tell us which were new.
  // Strategy: Upsert or sequential create.
  
  for (const match of newMatches) {
    // Check exist
    const existing = await prisma.match.findUnique({
      where: {
        offerId_requestId: {
          offerId: match.offerId,
          requestId: match.requestId
        }
      }
    });

    if (!existing) {
      const created = await prisma.match.create({
        data: {
          offerId: match.offerId,
          requestId: match.requestId,
          score: match.score,
          status: 'NEW'
        }
      });

      // Notifications
      // 1. To Offer Owner (Me) - maybe not needed? "New Match found". Yes.
      // 2. To Request Owner (Them).
      
      await prisma.notification.createMany({
        data: [
          { userId: offer.createdById, matchId: created.id, status: 'UNREAD' },
          { userId: match.requestOwnerId, matchId: created.id, status: 'UNREAD' }
        ]
      });

      // ✨ Emit Realtime Notification via Socket.IO
      if (global.io) {
        // Notify Offer Owner
        global.io.to(`user-${offer.createdById}`).emit('new-match', {
          matchId: created.id,
          message: 'New match found for your offer!',
          score: created.score,
          type: 'offer'
        });
        
        // Notify Request Owner
        global.io.to(`user-${match.requestOwnerId}`).emit('new-match', {
          matchId: created.id,
          message: 'New match found for your request!',
          score: created.score,
          type: 'request'
        });
      }
    }
  }
  
  console.log(`Processed ${newMatches.length} potential matches.`);
};

const matchRequestToOffers = async (request) => {
  console.log(`Matching for Request #${request.id}...`);
  
  const offers = await prisma.offer.findMany({
    include: { createdBy: true }
  });

  for (const offer of offers) {
    const score = calculateScore(offer, request); // SAME logic
    
    if (score > 0) {
      const existing = await prisma.match.findUnique({
        where: {
          offerId_requestId: {
            offerId: offer.id,
            requestId: request.id
          }
        }
      });

      if (!existing) {
        const created = await prisma.match.create({
          data: {
            offerId: offer.id,
            requestId: request.id,
            score,
            status: 'NEW'
          }
        });

        await prisma.notification.createMany({
          data: [
            { userId: offer.createdById, matchId: created.id, status: 'UNREAD' },
            { userId: request.createdById, matchId: created.id, status: 'UNREAD' }
          ]
        });

        // ✨ Emit Realtime Notification via Socket.IO
        if (global.io) {
          global.io.to(`user-${offer.createdById}`).emit('new-match', {
            matchId: created.id,
            message: 'New match found for your offer!',
            score: created.score,
            type: 'offer'
          });
          
          global.io.to(`user-${request.createdById}`).emit('new-match', {
            matchId: created.id,
            message: 'New match found for your request!',
            score: created.score,
            type: 'request'
          });
        }
      }
    }
  }
};

module.exports = { matchOfferToRequests, matchRequestToOffers };
