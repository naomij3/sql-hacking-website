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

function pageTemplate(title, content) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background: #f5f3ff;
            color: #18181b;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .card {
            width: min(460px, 100%);
            padding: 30px;
            background: white;
            border-radius: 20px;
            border: 1px solid #e4e4e7;
            box-shadow: 0 20px 50px rgba(24, 24, 27, 0.08);
          }

          h1 {
            margin-top: 0;
            margin-bottom: 12px;
          }

          p {
            color: #52525b;
            line-height: 1.6;
          }

          input,
          button {
            width: 100%;
            padding: 11px 12px;
            margin-top: 12px;
            border-radius: 10px;
            border: 1px solid #d4d4d8;
            box-sizing: border-box;
            font-size: 14px;
          }

          input:focus {
            outline: 3px solid #ede9fe;
            border-color: #8b3ff6;
          }

          button {
            border: none;
            background: #8b3ff6;
            color: white;
            cursor: pointer;
            font-weight: bold;
          }

          button:hover {
            background: #7e22ce;
          }

          a {
            display: inline-block;
            margin-top: 16px;
            color: #8b3ff6;
            font-weight: bold;
            text-decoration: none;
          }

          .hint {
            margin-top: 18px;
            color: #52525b;
          }

          .flag {
            padding: 12px;
            border-radius: 10px;
            background: #ede9fe;
            color: #5b21b6;
            font-weight: bold;
            word-break: break-word;
          }
        </style>
      </head>

      <body>
        <div class="card">
          ${content}
        </div>
      </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  res.send(
    pageTemplate(
      "SQL Injection Basics Lab",
      `
      <h1>Lab 1:SQL Injection Basics</h1>
      <p>Try to log in without knowing the correct password.</p>
      
      <form method="POST" action="/login">
        <input name="username" placeholder="Username" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>

      <p class="hint">Hint: This logic form is intentionally vulnerable.</p>
    `)
  );
});

app.get("/lab2", (req, res) => {
  res.send(
    pageTemplate(
      "Comment-Based Login Bypass",
      `
      <h1>Lab 2: Comment-Based Login Bypass</h1>
      <p>Log in as the admin user without knowing the password.</p>
      
      <form method="POST" action="/lab2/login">
        <input name="username" placeholder="Username" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>

      <p class="hint">Hint: SQL comments can cause the rest of a query to be ignored.</p>
    `)
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM lab_users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Running query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.send(
        pageTemplate(
          "Database error",
          `
            <h1>Database error</h1>
            <p>Something went wrong.</p>
            <a href="/">Back to Lab 1</a>
          `
        )
      );
    }

    if (results.length > 0) {
      res.send(
        pageTemplate(
          "Login successful",
          `
            <h1>Login successful</h1>
            <p>Welcome, ${results[0].username}.</p>
            <p class="flag">Flag: FLAG{sql_injection_basics}</p>
            <a href="/">Back to Lab 1</a>
          `
        )
      );
    } else {
      res.send(
        pageTemplate(
          "Login failed",
          `
            <h1>Login failed</h1>
            <p>Invalid username or password.</p>
            <a href="/">Back to Lab 1</a>
          `
        )
      );
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
      return res.send(
        pageTemplate(
          "Database error",
          `
            <h1>Database error</h1>
            <p>Something went wrong.</p>
            <a href="/lab2">Back to Lab 2</a>
          `
        )
      );
    }

    if (results.length > 0 && results[0].username === "admin") {
      res.send(
        pageTemplate(
          "Login successful",
          `
            <h1>Login successful</h1>
            <p>Welcome, admin.</p>
            <p class="flag">Flag: FLAG{comment_bypass}</p>
            <a href="/lab2">Back to Lab 2</a>
          `
        )
      );
    } else if (results.length > 0) {
      res.send(
        pageTemplate(
          "Wrong account",
          `
          <h1>Logged in, but not as admin</h1>
          <p>This lab requires admin access.</p>
          <a href="/lab2">Back to Lab 2</a>
          `
        )
      );
    } else {
      res.send(
        pageTemplate(
          "Login failed",
          `
            <h1>Login failed</h1>
            <p>Invalid username or password.</p>
            <a href="/lab2">Back to Lab 2</a>
          `
        )
      );
    }
  });
});

app.listen(4000, () => {
  console.log("Lab running on http://localhost:4000");
});