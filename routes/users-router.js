const usersRouter = require("express").Router();

const ctrl = require("../controller/controller");

usersRouter.get("/", ctrl.getUsers);

usersRouter.get("/:username", ctrl.getUserByUsername);

module.exports = usersRouter;
