const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "csc317db",
  password: "2308",
});

const promisePool = db.promise();
module.exports = promisePool;
