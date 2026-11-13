const requiredSetting = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const jwtSecret = requiredSetting('JWT_SECRET');

if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

module.exports = {
  jwt: {
    algorithm: 'HS256',
    audience: 'dinedesk-api',
    expiresIn: '15m',
    issuer: 'dinedesk',
    secret: jwtSecret,
  },
  port: Number(process.env.PORT || 3000),
};
