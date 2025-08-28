import express from "express";
import { Request, Response } from "express";
import couponController from "../controllers/couponController.js";
import verifyToken from "../controllers/verifyToken.js";
const couponRouter = express.Router();

couponRouter.get(
  "/coupons",
  verifyToken.verifyUser,
  (request: Request, response: Response) => {
    new couponController(request).getCoupons(response);
  }
);

export default couponRouter;
