const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`DineDesk API listening on port ${port}`);
});
