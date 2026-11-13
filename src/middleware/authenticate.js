const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config');
const { findUserById } = require('../data/seed');

const unauthorized = (res) => res.status(401).json({ error: 'Unauthorized' });

const authenticate = (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization || !/^Bearer [^\s]+$/.test(authorization)) {
    return unauthorized(res);
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });
    const user = findUserById(payload.sub);

    if (!user || !user.active) {
      return unauthorized(res);
    }

    req.user = { id: user.id, role: user.role, branchId: user.branchId };
    next();
  } catch {
    return unauthorized(res);
  }
};

module.exports = { authenticate };
