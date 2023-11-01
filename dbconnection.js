
var mysql = require('mysql2');

const dotenv = require("dotenv");
dotenv.config();

var pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  });

  module.exports =pool;


  // host: "ns135.hostingraja.org",
  // user: "mctcdnhi_kiran",
  // password: "kiran007",
  // database: "mctcdnhi_data"