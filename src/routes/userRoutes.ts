import { Request, Response } from "express";
import UserController from "../controllers/userController.js";
import express from "express";

const userRouter = express.Router();

userRouter.post("/register", (request: Request, response: Response) => {
  const user = new UserController(request);
  user.register(response);
});

userRouter.post("/login", (request: Request, response: Response) => {
  // console.log(request.cookies);
  const user = new UserController(request);
  user.login(response);
});

export default userRouter;
