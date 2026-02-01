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

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id: parseInt(id) }, include: { members: { include: { user: { select: { id: true, name: true, role: true } } } } } });
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Store old data for audit
    req.oldData = team;

    const data = {};
    if (name) data.name = name;
    if (type) data.type = type;

    const updated = await prisma.team.update({ where: { id: parseInt(id) }, data });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id: parseInt(id) } });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Store old data for audit
    req.oldData = team;

    await prisma.team.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Team deleted' });
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

const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const member = await prisma.teamMember.findFirst({ where: { teamId: parseInt(id), userId: parseInt(memberId) } });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Store old data for audit
    req.oldData = member;

    await prisma.teamMember.delete({ where: { id: member.id } });
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role required' });

    const member = await prisma.teamMember.findFirst({ where: { teamId: parseInt(id), userId: parseInt(memberId) } });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Store old data for audit
    req.oldData = member;

    const updated = await prisma.teamMember.update({ where: { id: member.id }, data: { role } });
    res.json(updated);
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

module.exports = { createTeam, getTeams, getTeamById, updateTeam, deleteTeam, addMember, removeMember, updateMemberRole, listMembers };