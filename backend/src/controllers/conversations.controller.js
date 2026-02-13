const prisma = require('../utils/prisma');

// Helper to check membership
const isTeamMember = async (userId, teamId) => {
  const mem = await prisma.teamMember.findFirst({ where: { teamId, userId } });
  return !!mem;
};

const getUserTeamIds = async (userId) => {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true }
  });
  return memberships.map((m) => m.teamId);
};

const canMessageRecipient = async (sender, recipientId) => {
  if (sender.id === recipientId) return true;

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, role: true }
  });

  if (!recipient) return false;
  if (sender.role === 'BROKER') return false;
  if (sender.role === 'ADMIN') return true;

  if (sender.role === 'MANAGER') {
    if (recipient.role === 'MANAGER') return true;
    const senderTeamIds = await getUserTeamIds(sender.id);
    if (!senderTeamIds.length) return false;
    const sameTeam = await prisma.teamMember.findFirst({
      where: { userId: recipientId, teamId: { in: senderTeamIds } },
      select: { id: true }
    });
    return !!sameTeam;
  }

  // Team members (EMPLOYEE / DATA_ENTRY_ONLY / others except ADMIN-MANAGER-BROKER)
  const senderTeamIds = await getUserTeamIds(sender.id);
  if (!senderTeamIds.length) return false;
  const sameTeam = await prisma.teamMember.findFirst({
    where: { userId: recipientId, teamId: { in: senderTeamIds } },
    select: { id: true }
  });
  return !!sameTeam;
};

const validateRecipients = async (sender, recipientIds) => {
  for (const recipientId of recipientIds) {
    const allowed = await canMessageRecipient(sender, recipientId);
    if (!allowed) return false;
  }
  return true;
};

// List conversations for current user (either participant or team conv when member)
const listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Conversations where user is a participant
    const participantConvs = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: { participants: { include: { user: { select: { id: true, name: true } } } }, team: true }
    });

    // Conversations linked to teams where the user is a member
    const teamMemberships = await prisma.teamMember.findMany({ where: { userId } });
    const teamIds = teamMemberships.map(t => t.teamId);

    const teamConvs = teamIds.length ? await prisma.conversation.findMany({ where: { teamId: { in: teamIds } }, include: { participants: { include: { user: { select: { id: true, name: true } } } }, team: true } }) : [];

    // Combine unique
    const combined = [...participantConvs];
    for (const c of teamConvs) if (!combined.find(x => x.id === c.id)) combined.push(c);

    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, participantIds = [], teamId } = req.body;

    if (req.user.role === 'BROKER') {
      return res.status(403).json({ message: 'Brokers are not allowed to create conversations' });
    }

    if (teamId) {
      // ensure user is member of team or admin
      const parsedTeamId = parseInt(teamId);
      const isMember = await isTeamMember(userId, parsedTeamId);
      if (!isMember && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Not allowed to create team conversation' });
      // create conversation tied to team
      const conv = await prisma.conversation.create({ data: { title: title || null, teamId: parsedTeamId } });
      return res.status(201).json(conv);
    }

    // Create direct/group conversation with participants
    const normalizedRecipients = [...new Set(participantIds.map((id) => parseInt(id)).filter((id) => !Number.isNaN(id) && id !== userId))];
    if (!normalizedRecipients.length) {
      return res.status(400).json({ message: 'At least one valid recipient is required' });
    }

    const allowed = await validateRecipients(req.user, normalizedRecipients);
    if (!allowed) {
      return res.status(403).json({ message: 'One or more recipients are not allowed by messaging policy' });
    }

    const conv = await prisma.conversation.create({ data: { title: title || null } });

    // Add participants: include creator
    const toCreate = new Set([userId, ...normalizedRecipients]);
    for (const pid of toCreate) {
      await prisma.conversationParticipant.create({ data: { conversationId: conv.id, userId: pid } });
    }

    // return conversation with participants
    const full = await prisma.conversation.findUnique({ where: { id: conv.id }, include: { participants: { include: { user: { select: { id: true, name: true } } } } } });
    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const conv = await prisma.conversation.findUnique({ where: { id: parseInt(id) } });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    // Access control: participant OR team member OR admin
    const isParticipant = await prisma.conversationParticipant.findFirst({ where: { conversationId: conv.id, userId } });
    const isMember = conv.teamId ? await isTeamMember(userId, conv.teamId) : false;
    if (!isParticipant && !isMember && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });

    const messages = await prisma.message.findMany({ where: { conversationId: conv.id }, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true } } } });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // conversation id
    const { body } = req.body;

    if (req.user.role === 'BROKER') {
      return res.status(403).json({ message: 'Brokers are not allowed to send messages' });
    }

    if (!body) return res.status(400).json({ message: 'Message body is required' });

    const conv = await prisma.conversation.findUnique({ where: { id: parseInt(id) } });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    // Access control: same as getMessages
    const isParticipant = await prisma.conversationParticipant.findFirst({ where: { conversationId: conv.id, userId } });
    const isMember = conv.teamId ? await isTeamMember(userId, conv.teamId) : false;
    if (!isParticipant && !isMember && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });

    const msg = await prisma.message.create({ data: { conversationId: conv.id, senderId: userId, body, readBy: JSON.stringify([userId]) } });

    // Notify participants: if team conversation, notify all team members; else notify conversation participants
    let targets = [];
    if (conv.teamId) {
      const members = await prisma.teamMember.findMany({ where: { teamId: conv.teamId } });
      targets = members.map(m => m.userId);
    } else {
      const parts = await prisma.conversationParticipant.findMany({ where: { conversationId: conv.id } });
      targets = parts.map(p => p.userId);
    }

    const recipients = targets.filter((uid) => uid !== userId);
    const allowed = await validateRecipients(req.user, recipients);
    if (!allowed) {
      return res.status(403).json({ message: 'Message recipients are not allowed by messaging policy' });
    }

    // Emit socket message to each user (skip sender)
    for (const uid of targets) {
      if (uid === userId) continue;
      if (global.io) global.io.to(`user-${uid}`).emit('new-message', { conversationId: conv.id, message: { id: msg.id, senderId: userId, body: msg.body, createdAt: msg.createdAt } });

      // Create Notification row for user (message type)
      await prisma.notification.create({ data: { userId: uid, conversationId: conv.id, type: 'MESSAGE', meta: { snippet: msg.body.slice(0, 200) }, status: 'UNREAD' } }).catch(() => {});
    }

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // conversation id
    const conv = await prisma.conversation.findUnique({ where: { id: parseInt(id) } });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    // Find unread messages and append userId to readBy
    const messages = await prisma.message.findMany({ where: { conversationId: conv.id } });
    for (const m of messages) {
      const readByArr = m.readBy ? JSON.parse(m.readBy) : [];
      if (!readByArr.includes(userId)) {
        readByArr.push(userId);
        await prisma.message.update({ where: { id: m.id }, data: { readBy: JSON.stringify(readByArr) } });
      }
    }

    res.json({ message: 'Marked read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { listConversations, createConversation, getMessages, postMessage, markRead };
