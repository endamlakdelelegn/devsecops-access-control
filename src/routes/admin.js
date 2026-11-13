const express = require('express');
const { users } = require('../data/seed');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/users', requireRole('admin'), (req, res) => {
  res.json(users.map(({ passwordHash, ...user }) => user));
});

module.exports = router;
