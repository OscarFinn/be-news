const express = require("express");
const app = express();
const ctrl = require('./controller/controller')
const errCtrl = require('./controller/errors.controller')

app.use(express.json());

app.get("/api", ctrl.getApi);

app.get("/api/topics", ctrl.getTopics)

app.use(errCtrl.handleCustomErrors)

app.use(errCtrl.handlePSQLErrors)

module.exports = app;