const express = require("express");
const mysql = require("mysql2");
const app = express();

//Connection to fake lab database
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

//HTML wrapper for lab pages
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

          .result-box {
            margin: 14px 0;
            padding: 14px;
            border-radius: 12px;
            background: #fafaff;
            border: 1px solid #e4e4e7;
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

// Lab Pages: Intentionally vulnerable SQL for educational purposes
// User input is inserted directly into the SQL query
app.get("/", (req, res) => {
  res.send(
    pageTemplate(
      "Throwing an SQL Error",
      `
        <h1>Lab 1: Breaking the Query</h1>
        <p>
          Your first goal is not to log in. Instead, try to make the SQL query
          break by entering a character that affects SQL syntax.
        </p>

        <form method="POST" action="/login">
          <input name="username" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Test Login</button>
        </form>

        <p class="hint">Hint: Try a single apostrophe in the username field.</p>
      `
    )
  );
});

//Comment-based bypass lab
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
      `
    )
  );
});

//Always-true condition lab
app.get("/lab3", (req, res) => {
  res.send(
    pageTemplate(
      "Always-True Login Bypass",
      `
        <h1>Lab 3: Always-True Login Bypass</h1>
        <p>
          Use a condition that is always true to make
          the login query return a valid user.
        </p>

        <form method="POST" action="/lab3/login">
          <input name="username" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>

        <p class="hint">Hint: A condition like '1'='1 is always true.</p>
      `
    )
  );
});

//UNION extraction lab
app.get("/lab4", (req, res) => {
  res.send(
    pageTemplate(
      "UNION-Based Extraction",
      `
        <h1>Lab 4: UNION-Based Extraction</h1>
        <p>
          Search for a product by ID. The page shows product
          information from the database.
        </p>

        <form method="POST" action="/lab4/search">
          <input name="productID" placeholder="Product ID" />
          <button type="submit">Search</button>
        </form>

        <p class="hint">
          Hint: The product query returns three columns: id, name and description.
        </p>
      `
    )
  );
})

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM lab_users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Running query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.send(
        pageTemplate(
          "Query broken",
          `
            <h1>Database error</h1>
            <p>The database returned an error because
            your input changed the structure of the SQL query.
            </p>

            <p class="flag">Flag: FLAG{query_broken}</p>
            <a href="/">Back to Lab 1</a>
          `
        )
      );
    }

    res.send(
      pageTemplate(
        "No error yet",
        `
          <h1>No SQL error yet</h1>
          <p>
          The query still ran successfully. Try entering 
          input that breaks SQL string syntax.
          </p>
          <a href="/">Back to Lab 1</a>
        `
      )
    );
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

app.post("/lab3/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM lab_users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Running Lab 3 query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);

      return res.send(
        pageTemplate(
          "Database error",
          `
            <h1>Database error</h1>
            <p>Something went wrong.</p>
            <a href="/lab3">Back to Lab 3</a>
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
            <p>The query returned a valid user.</p>
            <p class="flag">Flag: FLAG{true_condition}</p>
            <a href="/lab3">Back to Lab 3</a>
          `
        )
      );
    } else {
      res.send(
        pageTemplate(
          "Login failed",
          `
            <h1>Login failed</h1>
            <p>The query did not return a user.</p>
            <a href="/lab3">Back to Lab 3</a>
          `
        )
      );
    }
  });
});

app.post("/lab4/search", (req, res) => {
  const { productID } = req.body;

  const query = `SELECT id, name, description FROM lab_products WHERE id = ${productID}`;

  console.log("Running Lab 4 query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);

      return res.send(
        pageTemplate(
          "Database error",
          `
            <h1>Database error</h1>
            <p>The query caused a database error.</p>
            <a href="/lab4">Back to Lab 4</a>
          `
        )
      );
    }

    if (results.length > 0) {
      const rows = results.map ((row) =>
        `
          <div class="result-box">
            <p><strong>ID:</strong> ${row.id}</p>
            <p><strong>Name:</strong> ${row.name}</p>
            <p><strong>Description:</strong> ${row.description}</p>
          </div>
        `
      )
      .join("");

      return res.send(
        pageTemplate(
          "Search results",
          `
            <h1>Search results</h1>
            ${rows}
            <a href="/lab4">Back to Lab 4</a>
          `
        )
      );
    }

    res.send(
      pageTemplate(
        "No results",
        `
          <h1>No results</h1>
            <p>No product matched that ID.</p>
            <a href="/lab4">Back to Lab 4</a>
        `
      )
    );
  });
});

app.listen(4000, () => {
  console.log("Lab running on http://localhost:4000");
});