const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      // 1. Ensure user is authenticated
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No user found in request." });
      }

      // 2. Admins can bypass everything
      if (req.user.role === "ADMIN") {
        return next();
      }

      // 3. Extract permissions from JWT payload (attached during login)
      const userPermissions = req.user.permissions || [];

      // 4. Check if required permission exists
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to perform this action.",
          requiredPermission,
        });
      }

      next();
    } catch (error) {
      console.error("Permission Check Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during permission check." });
    }
  };
};

module.exports = checkPermission;
