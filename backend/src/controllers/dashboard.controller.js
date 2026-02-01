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

    // Top Brokers by number of OFFERS created
    const topOfferers = await prisma.offer.groupBy({
      by: ['createdById'],
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

    const brokerIds = topOfferers.map(item => item.createdById);
    const brokers = await prisma.user.findMany({
      where: { id: { in: brokerIds } },
      select: { id: true, name: true }
    });

    const result = topOfferers.map(item => {
      const broker = brokers.find(b => b.id === item.createdById);
      return {
        brokerId: item.createdById,
        name: broker ? broker.name : 'Unknown',
        count: item._count.id
      };
    });

    res.json(result);
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

module.exports = { getSummary, getTopBrokers, getTopAreas };
