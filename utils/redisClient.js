const redis = require('redis');

// const client = redis.createClient({
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//     connectTimeout: 10000, // Set a 10-second connection timeout
//   },
// });
const client = redis.createClient({
  socket: {
    host: '127.0.0.1', // Localhost
    port: 6379, // Default Redis port
    connectTimeout: 10000, // Set a 10-second connection timeout
  },
});
module.exports = client;
