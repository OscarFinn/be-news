const topicsRouter = require("express").Router();

const ctrl = require("../controller/controller");

topicsRouter.get("/", ctrl.getTopics);

topicsRouter.post("/", ctrl.postTopic);

module.exports = topicsRouter;
