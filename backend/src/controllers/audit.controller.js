const prisma = require('../utils/prisma');

const getAuditLogs = async (req, res) => {
  try {
    const { resource, userId, action, startDate, endDate, limit = 100 } = req.query;
    
    const where = {};
    if (resource) where.resource = resource;
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAuditLogs };
