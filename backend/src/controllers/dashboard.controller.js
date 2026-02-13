const prisma = require('../utils/prisma');

// Helper: Get user's team ID
const getUserTeamId = async (userId) => {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true }
  });
  return membership?.teamId || null;
};

const getSummary = async (req, res) => {
  try {
    const { role } = req.user;
    let where = {};

    // Team-based filtering for non-ADMIN
    if (role !== 'ADMIN') {
      const teamId = await getUserTeamId(req.user.id);
      if (teamId) {
        where = { teamId };
      }
    }

    const [offersCount, requestsCount, matchesCount] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.request.count({ where }),
      role === 'ADMIN'
        ? prisma.match.count()
        : prisma.match.count({
          where: {
            OR: [
              { offer: where },
              { request: where }
            ]
          }
        })
    ]);

    res.json({
      offers: offersCount,
      requests: requestsCount,
      matches: matchesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopBrokers = async (req, res) => {
  try {
    const { role } = req.user;
    let where = {};

    // Team-based filtering for non-ADMIN
    if (role !== 'ADMIN') {
      const teamId = await getUserTeamId(req.user.id);
      if (teamId) {
        where = { teamId };
      }
    }

    // Weight configuration for broker KPI scoring.
    const mediationWeightRaw = Number(process.env.TOP_BROKER_MEDIATION_WEIGHT || 1);
    const closedDealWeightRaw = Number(process.env.TOP_BROKER_CLOSED_DEAL_WEIGHT || 1);
    const mediationWeight = Number.isFinite(mediationWeightRaw) ? mediationWeightRaw : 1;
    const closedDealWeight = Number.isFinite(closedDealWeightRaw) ? closedDealWeightRaw : 1;

    // KPI #1: Mediation contracts (offers with mediation contract).
    const mediationContracts = await prisma.offer.groupBy({
      by: ['createdById'],
      where: {
        ...where,
        contractType: 'WITH_MEDIATION_CONTRACT'
      },
      _count: {
        id: true,
      }
    });

    // KPI #2: Closed deals (matches with CLOSED status), mapped to offer owner.
    const closedMatches = await prisma.match.findMany({
      where: role === 'ADMIN'
        ? { status: 'CLOSED' }
        : {
          status: 'CLOSED',
          OR: [
            { offer: where },
            { request: where }
          ]
        },
      select: {
        offer: {
          select: { createdById: true }
        }
      }
    });

    const closedDealsByBroker = {};
    for (const item of closedMatches) {
      const brokerId = item.offer.createdById;
      closedDealsByBroker[brokerId] = (closedDealsByBroker[brokerId] || 0) + 1;
    }

    const mediationByBroker = {};
    for (const row of mediationContracts) {
      mediationByBroker[row.createdById] = row._count.id;
    }

    const brokerIds = Array.from(new Set([
      ...Object.keys(mediationByBroker).map(Number),
      ...Object.keys(closedDealsByBroker).map(Number)
    ]));

    if (!brokerIds.length) {
      return res.json([]);
    }

    const brokers = await prisma.user.findMany({
      where: { id: { in: brokerIds }, role: 'BROKER' },
      select: { id: true, name: true }
    });

    const result = brokers.map((broker) => {
      const mediationContractsCount = mediationByBroker[broker.id] || 0;
      const closedDealsCount = closedDealsByBroker[broker.id] || 0;
      const score = (mediationContractsCount * mediationWeight) + (closedDealsCount * closedDealWeight);

      return {
        brokerId: broker.id,
        name: broker.name,
        mediationContractsCount,
        closedDealsCount,
        score,
        scoreWeights: {
          mediationWeight,
          closedDealWeight
        }
      };
    });

    result.sort((a, b) => b.score - a.score);
    res.json(result.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopAreas = async (req, res) => {
  try {
    const { role } = req.user;
    let where = {};

    // Team-based filtering for non-ADMIN
    if (role !== 'ADMIN') {
      const teamId = await getUserTeamId(req.user.id);
      if (teamId) {
        where = { teamId };
      }
    }

    // Group by City
    const topCities = await prisma.offer.groupBy({
      by: ['city'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    res.json(topCities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActivityGaps = async (req, res) => {
  try {
    const { role } = req.user;
    let baseWhere = {};

    if (role !== 'ADMIN') {
      const teamId = await getUserTeamId(req.user.id);
      if (teamId) {
        baseWhere = { teamId };
      }
    }

    const [offers, requests, matches] = await Promise.all([
      prisma.offer.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, createdAt: true }
      }),
      prisma.request.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, createdAt: true }
      }),
      role === 'ADMIN'
        ? prisma.match.findMany({
          orderBy: { createdAt: 'desc' },
          take: 2,
          select: { id: true, createdAt: true }
        })
        : prisma.match.findMany({
          where: {
            OR: [
              { offer: baseWhere },
              { request: baseWhere }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 2,
          select: { id: true, createdAt: true }
        })
    ]);

    const diffMinutes = (items) => {
      if (items.length < 2) return null;
      const latest = new Date(items[0].createdAt).getTime();
      const previous = new Date(items[1].createdAt).getTime();
      return Math.round((latest - previous) / 60000);
    };

    return res.json({
      lastOfferAt: offers[0]?.createdAt || null,
      offerGapMinutes: diffMinutes(offers),
      lastRequestAt: requests[0]?.createdAt || null,
      requestGapMinutes: diffMinutes(requests),
      lastMatchAt: matches[0]?.createdAt || null,
      matchGapMinutes: diffMinutes(matches)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getSummary, getTopBrokers, getTopAreas, getActivityGaps };
