const dotenv = require('dotenv');
const mongoose = require('mongoose');
const client = require('./utils/redisClient');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

client.connect(console.log('Redis connected')).catch((err) => console.log(err));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(process.env.LOCAL_DATABASE).then(() => {
  console.log('DB Connected Successful!');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`I love you ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION Shuting down...');

  server.close(() => {
    process.exit(1);
  });
});

server.setTimeout(5 * 60 * 1000); // 5 minutes
