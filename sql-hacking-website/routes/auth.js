const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

//Send requests to their respective controller function
router.post("/register", register);
router.post("/login", login);

module.exports = router;