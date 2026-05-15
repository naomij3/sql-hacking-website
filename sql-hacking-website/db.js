const mysql = require("mysql2");

require("dotenv").config();


//Environment variables are used so database credentials are not committed
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//Check database connection to the backend
db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("Connected to MariaDB");
  }
});

//Export the connection for controllers to use
module.exports = db;
