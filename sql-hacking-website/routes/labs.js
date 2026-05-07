const express = require("express");
const router = express.Router();

router.post("/start", (req, res) => {
  res.json({
    message: "Lab started",
    lab: {
      name: "SQL Injection Basics",
      status: "Running",
      url: "http://localhost:4000"
    }
  });
});

module.exports = router;