import express from "express";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const usersRouter = express.Router();

import * as usersController from "./users.controller.js";

import { protectRoutes , allowTo } from "../auth/auth.controller.js";

usersRouter.get("/",protectRoutes, usersController.getAllUsersByAdmin);

usersRouter.get("/:id",protectRoutes, usersController.getUserById);
usersRouter.post("/upload/adhd", upload.single("eegfile"), usersController.predictionADHD);
usersRouter.post("/upload/alzheimer", upload.single("eegfile"), usersController.predictionAlzheimer);


usersRouter.put("/:id",protectRoutes, usersController.updateUser);


usersRouter.delete("/:id",protectRoutes, usersController.deleteUser);
export default usersRouter;
