import { Request, Response } from "express";
import userController from "../controllers/userController.js";
import express from "express";

const userRouter = express.Router();

userRouter.post("/register", (request: Request, response: Response) => {
  userController.register(request, response);
});

export default userRouter;
