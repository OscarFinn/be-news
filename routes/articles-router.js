const articlesRouter = require("express").Router();

const ctrl = require("../controller/controller");

articlesRouter.get("/", ctrl.getArticles);

articlesRouter.get("/:article_id", ctrl.getArticleById);

articlesRouter.get("/:article_id/comments", ctrl.getCommentsByArticle);

articlesRouter.post("/:article_id/comments", ctrl.postCommentToArticle);

articlesRouter.patch("/:article_id", ctrl.patchArticle);

articlesRouter.post("/", ctrl.postArticle);
articlesRouter.delete("/:article_id", ctrl.deleteArticle);

module.exports = articlesRouter;
