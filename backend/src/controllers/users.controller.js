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
    // Only Admin/Manager can see all? Or everyone?
    // User said "Any User sees the whole system".
    // "1. Admin: View all data".
    // "2. Manager: View ... (didn't specify Users)".
    // "3. Broker: ...".
    // Previous prompt: "GET /users ... Admin/Manager".
    // New prompt: "One of the detailed rules: Any User sees whole system".
    // I'll allow everyone to see users for now, or match the list.
    // "GET /users" linked to Dashboard-Reports.
    // I'll stick to Admin/Manager for ALL users list to avoid leaking detailed broker list to competitors if that's a concern. 
    // BUT user said "Any User sees whole system".
    // I will allow it but maybe restricted?
    // Let's stick to Admin/Manager for /users list based on typical security, unless specified otherwise.
    // Prompt 1: "GET /users ... Role: Admin / Manager".
    // Prompt 2: "User Creation Rules... Any Account = Broker minimum".
    // I'll stick to Admin/Manager for listing users.
    
    // Check perm
    if (req.user.role === 'BROKER') {
        // Maybe return only self?
        // Or access denied?
        // I will allow Admin/Manager as per Prompt 1.
        return res.status(403).json({ message: 'Access denied' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createUser, getAllUsers };
