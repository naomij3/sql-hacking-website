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

router.post("/stop", (req, res) => {
  res.json({
    message: "Lab stopped",
    lab: {
      name: "SQL Injection Basics",
      status: "Not started",
      url: null
    }
  });
});

router.post("/reset", (req, res) => {
  res.json({
    message: "Lab reset",
    lab: {
      name: "SQL Injection Basics",
      status: "Not started",
      progress: 0,
      url: null,
    },
  });
});

router.post("/submit-flag", (req, res) => {
  const {flag} = req.body;
  const cleanedFlag = flag.trim();

  if (cleanedFlag === "FLAG{sql_injection_basics}") {
    return res.json({
      correct: true,
      message: "Correct flag! Lab completed.",
      lab: {
        status: "Completed",
        progress: 100
      }
    });
  }

  res.status(400).json({
    correct: false,
    message: "Wrong flag, try again.",
    lab: {
      status: "Running",
      progress: 25
    }
  });
});

module.exports = router;