const dns = require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const router = require("./route/index.js");
const dbconfig = require("./config/dbconfig");

const app = express();

app.use(cors({
  origin : ["http://localhost:5173" , "http://localhost:5174" ]
}));

app.use(express.json());
app.use(router);

const Port = process.env.PORT || 9000;

dbconfig();

app.get("/product", (req, res) => {
  res.send("Product route");
});

app.listen(Port, () => {
  console.log(`Server is running : ${Port}`);
});
