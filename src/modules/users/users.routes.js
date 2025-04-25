import express from "express";

const usersRouter = express.Router();

import * as usersController from "./users.controller.js";

import { protectRoutes , allowTo } from "../auth/auth.controller.js";

usersRouter.get("/",protectRoutes, usersController.getAllUsersByAdmin);

usersRouter.get("/:id",protectRoutes, usersController.getUserById);


usersRouter.put("/:id",protectRoutes, usersController.updateUser);


usersRouter.delete("/:id",protectRoutes, usersController.deleteUser);
export default usersRouter;
