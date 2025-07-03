import express from "express";
import { Request, Response } from "express";
import couponController from "../controllers/couponController.js";
const couponRouter = express.Router();

couponRouter.get("coupons", (request: Request, response: Response) => {
  couponController.getCoupons(response);
});

export default couponRouter;
