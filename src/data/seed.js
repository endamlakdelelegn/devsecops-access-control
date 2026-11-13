const passwordHash = '$2a$12$Xa1vv0vSESkrl96KbRjmhOqUnbNREvCyZpT6fJDibLjozxzo9s9OS';

const users = [
  { id: 'waiter-bole', email: 'waiter.bole@dinedesk.test', role: 'waiter', branchId: 'bole', passwordHash, active: true },
  { id: 'cashier-bole', email: 'cashier.bole@dinedesk.test', role: 'cashier', branchId: 'bole', passwordHash, active: true },
  { id: 'manager-bole', email: 'manager.bole@dinedesk.test', role: 'manager', branchId: 'bole', passwordHash, active: true },
  { id: 'waiter-piassa', email: 'waiter.piassa@dinedesk.test', role: 'waiter', branchId: 'piassa', passwordHash, active: true },
  { id: 'cashier-piassa', email: 'cashier.piassa@dinedesk.test', role: 'cashier', branchId: 'piassa', passwordHash, active: true },
  { id: 'manager-piassa', email: 'manager.piassa@dinedesk.test', role: 'manager', branchId: 'piassa', passwordHash, active: true },
  { id: 'admin', email: 'admin@dinedesk.test', role: 'admin', branchId: null, passwordHash, active: true },
];

const initialOrders = [
  { id: 'bole-100', branchId: 'bole', table: 1, total: 18.5, status: 'open' },
  { id: 'bole-101', branchId: 'bole', table: 2, total: 24, status: 'paid' },
  { id: 'piassa-200', branchId: 'piassa', table: 4, total: 13, status: 'open' },
  { id: 'piassa-201', branchId: 'piassa', table: 5, total: 31.75, status: 'paid' },
];

let orders = [];
let payments = [];

const resetData = () => {
  orders = initialOrders.map((order) => ({ ...order }));
  payments = [];
};

const findUserByEmail = (email) => users.find((user) => user.email === email);
const findUserById = (id) => users.find((user) => user.id === id);
const getOrders = () => orders;
const findOrderById = (id) => orders.find((order) => order.id === id);
const createOrder = ({ branchId, table, total }) => {
  const order = { id: `order-${orders.length + 1}`, branchId, table, total, status: 'open' };
  orders.push(order);
  return order;
};
const createPayment = ({ orderId, amount }) => {
  const payment = { id: `payment-${payments.length + 1}`, orderId, amount };
  payments.push(payment);
  return payment;
};

resetData();

module.exports = {
  createOrder,
  createPayment,
  findOrderById,
  findUserByEmail,
  findUserById,
  getOrders,
  resetData,
  users,
};
