import CheckoutController from "../controllers/checkoutController.js";
import verifyToken from "../controllers/verifyToken.js";

import express, { Request, Response, Router } from "express";
const checkoutRouter: Router = express.Router();

// Route to create a PayPal order
checkoutRouter.post(
  "/paypal/create-order",
  verifyToken.verifyUser,
  async (req: Request, res: Response) => {
    const checkout = new CheckoutController(req);
    checkout.createOrder(res);
  }
);

checkoutRouter.post(
  "/paypal/capture-order",
  verifyToken.verifyUser,
  async (req: Request, res: Response) => {
    const checkout = new CheckoutController(req);
    checkout.captureOrder(res);
  }
);

export default checkoutRouter;
