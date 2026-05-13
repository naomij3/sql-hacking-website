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
  const { labID, flag } = req.body;

  const cleanedFlag = String(flag).trim();
  const labNumber = Number(labID);

  const flags = {
    1: "FLAG{sql_injection_basics}",
    2: "FLAG{comment_bypass}",
  };

  if (cleanedFlag === flags[labNumber]) {
    return res.json({
      correct: true,
      message: "Correct flag! Lab completed.",
      lab: {
        status: "Completed",
        progress: 100,
      },
    });
  }

  res.status(400).json({
    correct: false,
    message: "Wrong flag, try again.",
    lab: {
      status: "Running",
      progress: 25,
    },
  });
});

module.exports = router;