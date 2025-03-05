const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

const dbConnection = () => {
  const DBConnect = mongoose.connect(process.env.LOCAL_DATABASE).then(() => {
    console.log('DB Connected Successful!');
  });
};

module.exports = dbConnection;
