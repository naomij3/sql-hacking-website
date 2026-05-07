const db = require("../db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hash],
      (err) => {
        if (err) return res.status(500).send("Error creating user");
        res.send("User created");
      }
    );
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).send("Error");

      const user = results[0];
      if (!user) return res.status(401).send("Invalid login");

      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) return res.status(401).send("Invalid login");

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email
        }
      });
    }
  );
};