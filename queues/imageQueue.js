const Queue = require('bull');

const imageQueue = new Queue('imageQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

imageQueue.on('completed', (job, result) => {
  console.log(`Job completed with result ${result}`);
});

imageQueue.on('failed', (job, err) => {
  console.error(`Job failed with error ${JSON.stringify(err)}`);
});

module.exports = imageQueue;
