const redis = require('redis');

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err) => console.log('Redis Client Error ', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
process.on('SIGINT', () => {
  redisClient.quit();
  process.exit();
});
redisClient.connect();

module.exports = redisClient;
