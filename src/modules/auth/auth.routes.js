import express from "express";
const authRouter = express.Router();

import * as authController from "./auth.controller.js";
import { validation } from "../../utils/middleWare/validation.js";
import { loginValidationSchema, registerValidationSchema } from "./auth.validator.js";

authRouter.post("/signup", authController.signUp);
authRouter.post("/signin",validation(loginValidationSchema), authController.signIn);
authRouter.get("/otp",authController.protectRoutes, authController.sendOTP);
authRouter.post("/vierfy", authController.protectRoutes ,authController.vierfyVerificationCode);
authRouter.post("/forget", authController.forgetPassword);

export default authRouter;
