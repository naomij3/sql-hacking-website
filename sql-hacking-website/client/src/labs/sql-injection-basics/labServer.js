const express = require("express");
const mysql = require("mysql2");
const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "labdb"
});

db.connect((err) => {
    if (err) {
        console.error("Lab DB connection failed:", err);
    }
    else {
        console.log("Connected to lab");
    }
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SQL Injection Basics Lab</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #111827;
            color: white;
            padding: 40px;
          }

          .card {
            max-width: 400px;
            padding: 24px;
            background: #1f2937;
            border-radius: 12px;
          }

          input, button {
            width: 100%;
            padding: 10px;
            margin-top: 12px;
            border-radius: 6px;
            border: none;
            box-sizing: border-box;
          }

          button {
            cursor: pointer;
            font-weight: bold;
          }

          .hint {
            margin-top: 24px;
            color: #d1d5db;
          }
        </style>
      </head>

      <body>
        <div class="card">
          <h1>SQL Injection Basics Lab</h1>
          <p>Try to log in as the admin user.</p>

          <form method="POST" action="/login">
            <input name="username" placeholder="Username" />
            <input name="password" type="password" placeholder="Password" />
            <button type="submit">Login</button>
          </form>

          <p class="hint">Hint: This lab will become intentionally vulnerable.</p>
        </div>
      </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM lab_users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Running query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.send(`
        <h1>Database error</h1>
        <p>Something went wrong.</p>
        <a href="/">Back</a>
      `);
    }

    if (results.length > 0) {
      res.send(`
        <h1>Login successful</h1>
        <p>Welcome, ${results[0].username}.</p>
        <p>Flag: FLAG{sql_injection_basics}</p>
        <a href="/">Back</a>
      `);
    } else {
      res.send(`
        <h1>Login failed</h1>
        <p>Invalid username or password.</p>
        <a href="/">Back</a>
      `);
    }
  });
});

app.listen(4000, () => {
  console.log("Lab running on http://localhost:4000");
});