const express = require('express');
const { authenticate } = require('./middleware/authenticate');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const reportsRouter = require('./routes/reports');

const app = express();
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/orders', authenticate, ordersRouter);
app.use('/api/payments', authenticate, paymentsRouter);
app.use('/api/reports', authenticate, reportsRouter);
app.use('/api/admin', authenticate, adminRouter);

module.exports = app;
