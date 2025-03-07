const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

const dbConnection = () => {
  const DBConnect = mongoose.connect(DB).then(() => {
    console.log('DB Connected Successful!');
  });
};

module.exports = dbConnection;
