const express = require("express");
var cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsConfig));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Express server running at ${port}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
