var bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const PORT = 8080;

const taskRoutes = require("./routes/task.js");
const userRoutes = require("./routes/user.js");

const app = express();

//Define types
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Cross origin requests
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//Routes
app.use("/task", taskRoutes);
app.use("/user", userRoutes);

//Test
app.get("/", (req, res) => {
  res.send("Hello World!").status(200);
});

//Export App for either testing or deployment
module.exports = app;
