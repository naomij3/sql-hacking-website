const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const labRoutes = require("./routes/labs");


//Allows React front to send requests to backend
app.use(cors({
  origin: "http://localhost:5173"
}));

//Parse JSON request bodies such as login and registration data
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.use("/", authRoutes); //authentication route which handles use registration and login
app.use("/labs", labRoutes); //lab routes which handle starting/stopping/resetting/submitting labs

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});