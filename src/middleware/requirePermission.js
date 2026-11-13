const permissionsByRole = {
  admin: ['users:manage', 'orders:read', 'reports:read'],
  cashier: ['orders:read', 'payments:create'],
  manager: ['orders:read', 'reports:read'],
  waiter: ['orders:create', 'orders:read'],
};

const requirePermission = (permission) => (req, res, next) => {
  const permissions = permissionsByRole[req.user.role] || [];

  if (!permissions.includes(permission)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};

module.exports = { permissionsByRole, requirePermission };
