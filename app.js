const express = require("express");
const app = express();
const ctrl = require('./controller/controller')
const errCtrl = require('./controller/errors.controller')

app.use(express.json());

app.get("/api", ctrl.getApi);

app.get("/api/topics", ctrl.getTopics)

app.get("/api/articles", ctrl.getArticles)

app.get("/api/articles/:article_id", ctrl.getArticleById)

app.get("/api/articles/:article_id/comments", ctrl.getCommentsByArticle)

app.post("/api/articles/:article_id/comments", ctrl.postCommentToArticle)

app.patch('/api/articles/:article_id', ctrl.patchArticle)

app.use(errCtrl.handleCustomErrors)

app.use(errCtrl.handlePSQLErrors)

module.exports = app;