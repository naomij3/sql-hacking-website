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

          <p class="hint">Hint: This lab is intentionally vulnerable.</p>
        </div>
      </body>
    </html>
  `);
});

app.get("/lab2", (req, res) => {
  res.send(`
    <!DOCTYPE html>
      <html>
        <head>
          <title>Comment-Based Login Bypass</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f5f3ff;
              color: #18181b;
              padding: 40px;
            }
              
            .card {
              max-width: 440px;
              padding: 28px;
              background: white;
              border-radius: 18px;
              border: 1px solid #e4e4e7;
              box-shadow: 0 20px 50px rgba(24, 24, 27, 0.08);
              }
              
              input, button {
                width: 100%;
                padding: 11px 12px;
                margin-top: 12px;
                border-radius: 10px;
                border: 1px solid #d4d4d8;
                box-sixing: border-box;
              }
                
              button {
                border: none;
                background: #8b3ff6;
                color: white;
                cursor: pointer;
                font-weight: bold;
              }
                
              .hint {
                margin-top: 18px;
                color: #52525b;
              }
            </style>
          </head>
          
          <body>
            <div class="card">
              <h1>Lab 2: Comment-Based Login Bypass</h1>
              <p>Log in as the admin user without knowing the password.</p>
              
              <form method="POST" action="/lab2/login">
                <input name="username" placeholder="Username" />
                <input name="password" type="password" placeholder="Password" />
                <button type="submit">Login</button>
              </form>
              
              <p class="hint">Hint: SQL comments can cause the rest of a query to be ignored.</p>
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

app.post("/lab2/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM lab_users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Running Lab 2 query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.send(`
        <h1>Database error</h1>
        <p>Something went wrong.</p>
        <a href="/lab2>Back</a>
      `);
    }

    if (results.length > 0 && results[0].username === "admin") {
      res.send(`
        <h1>Login successful</h1>
        <p>Welcome, admin.<p>
        <p>Flag: FLAG{comment_bypass}</p>
        <a href="/lab2">Back</a>
      `);
    } else if (results.length > 0) {
      res.send(`
        <h1>Logged in, but not as admin</h1>
        <p>This lab requires admin access.<p>
        <a href="/lab2">Back</a>
      `);
    } else {
      res.send(`
        <h1>Login failed</h1>
        <p>Invalid username or password</p>
        <a href="/lab2">Back</a>
      `);
    }
  });
});

app.listen(4000, () => {
  console.log("Lab running on http://localhost:4000");
});