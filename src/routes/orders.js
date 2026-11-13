const express = require('express');
const { createOrder, findOrderById, getOrders } = require('../data/seed');
const { requirePermission } = require('../middleware/requirePermission');
const { canAccessOrder } = require('../policies/canAccessOrder');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getOrders().filter((order) => canAccessOrder(req.user, order)));
});

router.get('/:id', requirePermission('orders:read'), (req, res) => {
  const order = findOrderById(req.params.id);

  if (!order || !canAccessOrder(req.user, order)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

router.post('/', requirePermission('orders:create'), (req, res) => {
  const { table, total } = req.body || {};

  if (!Number.isInteger(table) || typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'A positive total and integer table are required' });
  }

  const order = createOrder({ branchId: req.user.branchId, table, total });
  res.status(201).json(order);
});

module.exports = router;
