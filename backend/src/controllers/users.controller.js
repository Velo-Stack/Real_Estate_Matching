const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const currentUser = req.user;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Role Enforcement
    let newRole = 'BROKER'; // Default
    
    if (currentUser.role === 'ADMIN') {
      if (role && ['ADMIN', 'MANAGER', 'BROKER'].includes(role)) {
        newRole = role;
      }
    } else if (currentUser.role === 'MANAGER') {
       return res.status(403).json({ message: 'Managers cannot create users' });
    } else {
      // Broker
      newRole = 'BROKER';
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: newRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Only Admin/Manager can list users
    if (req.user.role === 'BROKER') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { role, status } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // Brokers can only view themselves
    if (req.user.role === 'BROKER' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const currentUser = req.user;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Permissions: Admin or owner
    if (currentUser.role !== 'ADMIN' && currentUser.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only Admin can change role
    if (role && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only Admin can change role' });
    }

    // Store old data for audit
    req.oldData = user;

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({ where: { id: parseInt(id) }, data, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } });
    res.json(updated);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ error: error.message });
  }
};

const patchUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentUser = req.user;

    if (currentUser.role !== 'ADMIN') return res.status(403).json({ message: 'Only Admin can change status' });

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store old data for audit
    req.oldData = user;

    const updated = await prisma.user.update({ where: { id: parseInt(id) }, data: { status }, select: { id: true, name: true, email: true, role: true, status: true } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Only Admin can delete users' });

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store old data for audit
    req.oldData = user;

    // Soft delete by marking status DELETED
    await prisma.user.update({ where: { id: parseInt(id) }, data: { status: 'DELETED' } });
    res.json({ message: 'User marked as deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, patchUserStatus, deleteUser };
