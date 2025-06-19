import { Request, response, Response } from "express";
import UserController from "../controllers/userController.js";
import express from "express";

// middleware
import verifyUserToken from "../controllers/verifyUserToken.js";

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

userRouter.put("/logout", (request: Request, response: Response) => {
  const user = new UserController(request);
  user.logout(response);
});

userRouter.put("/refresh-token", (request: Request, response: Response) => {
  const user = new UserController(request);
  user.generateUserToken(response);
});

userRouter.get(
  "/profile",
  verifyUserToken,
  (request: Request, response: Response) => {
    const user = new UserController(request);
    // user.getProfile(response);
  }
);

export default userRouter;
