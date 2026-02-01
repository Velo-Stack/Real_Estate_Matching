const prisma = require('../utils/prisma');

// Helper: Get user's team ID
const getUserTeamId = async (userId) => {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true }
  });
  return membership?.teamId || null;
};

const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let where = {};

    if (role !== 'ADMIN') {
      // Get user's team ID and filter by team
      const teamId = await getUserTeamId(userId);
      if (teamId) {
        where = {
          OR: [
            { offer: { teamId } },
            { request: { teamId } }
          ]
        };
      } else {
        // No team - show only own offers/requests
        where = {
          OR: [
            { offer: { createdById: userId } },
            { request: { createdById: userId } }
          ]
        };
      }
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        offer: {
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true } }
          }
        },
        request: {
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true } }
          }
        }
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
