const prisma = require('../utils/prisma');

const createTeam = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Missing name or type' });

    const team = await prisma.team.create({ data: { name, type } });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({ include: { members: { include: { user: { select: { id: true, name: true, role: true } } } } } });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body; // role optional
    if (!userId) return res.status(400).json({ message: 'userId required' });

    // check team exists
    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // prevent duplicate
    const exists = await prisma.teamMember.findFirst({ where: { teamId: parseInt(id), userId: parseInt(userId) } });
    if (exists) return res.status(409).json({ message: 'Member already exists' });

    const member = await prisma.teamMember.create({ data: { teamId: parseInt(id), userId: parseInt(userId), role: role || 'MEMBER' } });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await prisma.teamMember.findMany({ where: { teamId: parseInt(id) }, include: { user: { select: { id: true, name: true, role: true } } } });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTeam, getTeams, addMember, listMembers };