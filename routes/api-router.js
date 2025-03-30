const apiRouter = require("express").Router();
const usersRouter = require("./users-router");
const articlesRouter = require("./articles-router");
const topicsRouter = require("./topics-router");
const commentsRouter = require("./comments-router");

const ctrl = require("../controller/controller");

apiRouter.use("/users", usersRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/articles", articlesRouter);

apiRouter.get("/", ctrl.getApi);

module.exports = apiRouter;
