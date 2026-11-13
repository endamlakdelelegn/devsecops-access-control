const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config');
const { findUserByEmail } = require('../data/seed');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email || '');
  const passwordMatches = user && user.active
    ? await bcrypt.compare(password || '', user.passwordHash)
    : false;

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: user.id }, jwtConfig.secret, {
    algorithm: jwtConfig.algorithm,
    audience: jwtConfig.audience,
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
  });

  res.json({ token });
});

module.exports = router;
