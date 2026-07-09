const createApp = require('./core/bootstrap');
const config = require('./config/app.config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`Hub proxy server running at http://localhost:${config.port}`);
});
