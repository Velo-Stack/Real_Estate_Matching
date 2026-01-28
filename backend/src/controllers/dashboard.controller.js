const prisma = require('../utils/prisma');

const getSummary = async (req, res) => {
  try {
    const [offersCount, requestsCount, matchesCount] = await Promise.all([
      prisma.offer.count(),
      prisma.request.count(),
      prisma.match.count()
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
    // Top Brokers by number of OFFERS created
    const topOfferers = await prisma.offer.groupBy({
      by: ['createdById'],
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
    
    // Fetch User Details (Name)
    // Prisma groupBy doesn't include relation data directly. 
    // We must fetch users manually or use a different query strategy.
    
    const brokerIds = topOfferers.map(item => item.createdById);
    const brokers = await prisma.user.findMany({
      where: { id: { in: brokerIds } },
      select: { id: true, name: true }
    });
    
    // Merge
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
    // Group by City
    const topCities = await prisma.offer.groupBy({
      by: ['city'],
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
