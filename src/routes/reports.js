const express = require('express');
const { getOrders } = require('../data/seed');
const { requirePermission } = require('../middleware/requirePermission');

const router = express.Router();

router.get('/branch', requirePermission('reports:read'), (req, res) => {
  const orders = req.user.role === 'admin'
    ? getOrders()
    : getOrders().filter((order) => order.branchId === req.user.branchId);
  const total = orders.reduce((sum, order) => sum + order.total, 0);

  res.json({ branchId: req.user.branchId, orders, total });
});

module.exports = router;
