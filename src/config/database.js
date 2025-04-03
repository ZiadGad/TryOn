const mongoose = require('mongoose');

const DB =
  process.env.NODE_ENV === 'production'
    ? process.env.DOCKER_LOCAL_DB
    : process.env.LOCAL_DATABASE;
const dbConnection = () => {
  mongoose.connect(DB).then(() => {
    console.log('DB Connected Successful!');
  });
};

module.exports = dbConnection;
