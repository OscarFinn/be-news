const cors = require("cors");
const express = require("express");
const app = express();
//const ctrl = require("./controller/controller");
const errCtrl = require("./controller/errors.controller");

const apiRouter = require("./routes/api-router");

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);

app.use(errCtrl.handleCustomErrors);

app.use(errCtrl.handlePSQLErrors);

module.exports = app;
