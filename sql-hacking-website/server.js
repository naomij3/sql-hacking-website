const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.use("/", authRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});