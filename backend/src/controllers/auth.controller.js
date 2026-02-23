const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine permissions
    let permissions = [];
    if (user.useCustomPermissions) {
      permissions = user.permissions;
    } else {
      const rolePerms = await prisma.rolePermission.findUnique({
        where: { role: user.role },
      });
      permissions = rolePerms ? rolePerms.permissions : [];
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions, // Inject permissions into JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
        useCustomPermissions: user.useCustomPermissions,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        useCustomPermissions: true,
      },
    });

    let permissions = [];
    if (user.useCustomPermissions) {
      permissions = user.permissions;
    } else {
      const rolePerms = await prisma.rolePermission.findUnique({
        where: { role: user.role },
      });
      permissions = rolePerms ? rolePerms.permissions : [];
    }

    res.json({ ...user, computedPermissions: permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, getMe };
