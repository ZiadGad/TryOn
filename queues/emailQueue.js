const Queue = require('bull');

// const emailQueue = new Queue('emailQueue', {
//   redis: {
//     host: '127.0.0.1',
//     port: 6379,
//   },
// });
const emailQueue = new Queue('emailQueue', {
  redis: {
    host: process.env.REDIS_HOST, // Use your Redis host
    port: process.env.REDIS_PORT, // Use your Redis port
    password: process.env.REDIS_PASSWORD, // Use your Redis password
  },
});

emailQueue.on('completed', (job, result) => {
  console.log(`Job completed with result ${result}`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job failed with error ${err}`);
});

module.exports = emailQueue;
