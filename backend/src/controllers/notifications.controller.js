const prisma = require('../utils/prisma');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        match: {
          include: {
            offer: { select: { id: true, type: true, city: true, priceFrom: true, priceTo: true } },
            request: { select: { id: true, type: true, city: true, budgetFrom: true, budgetTo: true } }
          }
        },
        conversation: {
          select: { id: true, title: true }
        }
      }
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'READ', 'ARCHIVED'
    
    // Validate status Enum
    if (status && !['UNREAD', 'READ', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Ensure ownership
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getNotifications, updateNotification };
