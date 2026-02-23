const prisma = require("../utils/prisma");

const getAllRolePermissions = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const roles = await prisma.rolePermission.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const rolePerm = await prisma.rolePermission.findUnique({
      where: { role: roleName },
    });

    if (!rolePerm) {
      return res
        .status(404)
        .json({ message: "Role not found or has no default permissions set." });
    }

    res.json(rolePerm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    const { permissions } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "permissions must be an array of strings" });
    }

    const updated = await prisma.rolePermission.upsert({
      where: { role: roleName },
      update: { permissions },
      create: { role: roleName, permissions },
    });

    res.json({
      message: `Permissions for role ${roleName} updated`,
      rolePermission: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRolePermissions,
  getRolePermissions,
  updateRolePermissions,
};
