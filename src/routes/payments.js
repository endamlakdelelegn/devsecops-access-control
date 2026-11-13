const express = require('express');
const { createPayment, findOrderById } = require('../data/seed');
const { requirePermission } = require('../middleware/requirePermission');
const { canAccessOrder } = require('../policies/canAccessOrder');

const router = express.Router();

router.post('/', requirePermission('payments:create'), (req, res) => {
  const { amount, orderId } = req.body || {};
  const order = findOrderById(orderId);

  if (!order || !canAccessOrder(req.user, order)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'A positive payment amount is required' });
  }

  res.status(201).json(createPayment({ amount, orderId }));
});

module.exports = router;
