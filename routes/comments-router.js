const commentsRouter = require("express").Router();

const ctrl = require("../controller/controller");

commentsRouter.delete("/:comment_id", ctrl.deleteComment);

commentsRouter.get("/:comment_id", ctrl.getCommentById);

commentsRouter.patch("/:comment_id", ctrl.patchComment);

module.exports = commentsRouter;
