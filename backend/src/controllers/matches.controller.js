const prisma = require('../utils/prisma');

const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let where = {};

    if (role === 'BROKER') {
      // Show matches where the Broker owns the Offer OR the Request
      where = {
        OR: [
          { offer: { createdById: userId } },
          { request: { createdById: userId } }
        ]
      };
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        offer: { include: { createdBy: { select: { id: true, name: true, email: true } } } },
        request: { include: { createdBy: { select: { id: true, name: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(matches);
  } catch (error) {
    console.error('Error in getMatches:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateMatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const match = await prisma.match.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMatches, updateMatchStatus };
