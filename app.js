const express = require("express");
const app = express();
const ctrl = require('./controller/controller')

app.use(express.json());

app.get("/api", ctrl.getApi);


module.exports = app;