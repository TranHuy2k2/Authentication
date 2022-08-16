const mongoose = require("mongoose");

const connect = async () => {
  await mongoose.connect(process.env.DB_URL, () => {
    console.log("Database Connected");
  });
};
module.exports = connect;
