const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutting down...');
  console.log(err.name, err.message, err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');
const dbConnection = require('./config/database');

dbConnection();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening to Port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION Shuting down...');

  server.close(() => {
    process.exit(1);
  });
});
