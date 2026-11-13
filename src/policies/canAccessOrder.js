const canAccessOrder = (user, order) => user.role === 'admin' || user.branchId === order.branchId;

module.exports = { canAccessOrder };
