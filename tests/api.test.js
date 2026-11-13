process.env.JWT_SECRET = 'test-only-signing-key-that-is-longer-than-32-characters';

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const { jwt: jwtConfig } = require('../src/config');
const { resetData } = require('../src/data/seed');

const password = 'DineDeskDemo!2026';

const tokenFor = (subject, options = {}) => jwt.sign(
  { sub: subject },
  jwtConfig.secret,
  {
    algorithm: jwtConfig.algorithm,
    audience: jwtConfig.audience,
    expiresIn: '15m',
    issuer: jwtConfig.issuer,
    ...options,
  },
);

const authorized = (token) => ({ Authorization: `Bearer ${token}` });

beforeEach(() => {
  resetData();
});

describe('authentication', () => {
  test('returns the same generic error for an unknown email and wrong password', async () => {
    const unknownEmail = await request(app).post('/api/auth/login')
      .send({ email: 'unknown@dinedesk.test', password });
    const wrongPassword = await request(app).post('/api/auth/login')
      .send({ email: 'waiter.bole@dinedesk.test', password: 'incorrect' });

    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  test('issues a token with minimal claims and ignores client role and branch', async () => {
    const response = await request(app).post('/api/auth/login').send({
      branchId: 'piassa',
      email: 'waiter.bole@dinedesk.test',
      password,
      role: 'admin',
    });
    const claims = jwt.verify(response.body.token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });

    expect(response.status).toBe(200);
    expect(claims).toMatchObject({ sub: 'waiter-bole' });
    expect(claims).not.toHaveProperty('role');
    expect(claims).not.toHaveProperty('branchId');
  });

  test('rejects a request with no token', async () => {
    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(401);
  });

  test('rejects a token signed with the wrong key', async () => {
    const token = jwt.sign({ sub: 'manager-bole' }, 'wrong-key-that-is-long-enough-to-sign', {
      algorithm: jwtConfig.algorithm,
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });
    const response = await request(app).get('/api/orders').set(authorized(token));

    expect(response.status).toBe(401);
  });

  test('rejects an expired token', async () => {
    const response = await request(app).get('/api/orders')
      .set(authorized(tokenFor('manager-bole', { expiresIn: '-1s' })));

    expect(response.status).toBe(401);
  });

  test('rejects a non-Bearer authorization header', async () => {
    const response = await request(app).get('/api/orders')
      .set('Authorization', tokenFor('manager-bole'));

    expect(response.status).toBe(401);
  });
});

describe('roles and permissions', () => {
  test('denies a waiter access to the admin users route', async () => {
    const response = await request(app).get('/api/admin/users')
      .set(authorized(tokenFor('waiter-bole')));

    expect(response.status).toBe(403);
  });

  test('allows an administrator to list users without password hashes', async () => {
    const response = await request(app).get('/api/admin/users')
      .set(authorized(tokenFor('admin')));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(7);
    expect(response.body.every((user) => !Object.hasOwn(user, 'passwordHash'))).toBe(true);
  });

  test('allows a waiter to create an order only in their own branch', async () => {
    const response = await request(app).post('/api/orders')
      .set(authorized(tokenFor('waiter-bole')))
      .send({ branchId: 'piassa', table: 9, total: 16 });

    expect(response.status).toBe(201);
    expect(response.body.branchId).toBe('bole');
  });

  test('denies a cashier permission to create an order', async () => {
    const response = await request(app).post('/api/orders')
      .set(authorized(tokenFor('cashier-bole')))
      .send({ table: 9, total: 16 });

    expect(response.status).toBe(403);
  });

  test('allows a cashier to create a payment for an order in their branch', async () => {
    const response = await request(app).post('/api/payments')
      .set(authorized(tokenFor('cashier-bole')))
      .send({ amount: 18.5, orderId: 'bole-100' });

    expect(response.status).toBe(201);
  });
});

describe('branch-level authorization', () => {
  test('allows a Bole manager to read a Bole order', async () => {
    const response = await request(app).get('/api/orders/bole-100')
      .set(authorized(tokenFor('manager-bole')));

    expect(response.status).toBe(200);
    expect(response.body.branchId).toBe('bole');
  });

  test('returns 404 when a Bole manager requests a Piassa order', async () => {
    const response = await request(app).get('/api/orders/piassa-200')
      .set(authorized(tokenFor('manager-bole')));

    expect(response.status).toBe(404);
  });

  test('denies a waiter access to branch reports', async () => {
    const response = await request(app).get('/api/reports/branch')
      .set(authorized(tokenFor('waiter-bole')));

    expect(response.status).toBe(403);
  });

  test('uses the Piassa manager identity rather than a branchId query parameter', async () => {
    const response = await request(app).get('/api/reports/branch?branchId=bole')
      .set(authorized(tokenFor('manager-piassa')));

    expect(response.status).toBe(200);
    expect(response.body.branchId).toBe('piassa');
    expect(response.body.orders).toHaveLength(2);
    expect(response.body.orders.every((order) => order.branchId === 'piassa')).toBe(true);
  });

  test('scopes the order list to the authenticated staff branch', async () => {
    const response = await request(app).get('/api/orders')
      .set(authorized(tokenFor('cashier-piassa')));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.every((order) => order.branchId === 'piassa')).toBe(true);
  });
});
