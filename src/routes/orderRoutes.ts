import express, { response } from "express";
import { Request, Response } from "express";

// import http from "http";

import OrdersController from "../controllers/ordersController.js";
import verifyToken from "../controllers/verifyToken.js";
import { request } from "http";
const orderRoutes = express.Router();

orderRoutes.get(
  "/shopping-cart",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    const order = new OrdersController(req);
    order.getShoppingCart(res);
  }
);

orderRoutes.post(
  "/add-to-cart",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    // console.log(req.body);
    const order = new OrdersController(req);
    order.addToCart(res);
  }
);

orderRoutes.put(
  "/increase-cart-quantity",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    const order = new OrdersController(req);
    order.increaseCartItemQuantity(res);
  }
);

orderRoutes.put(
  "/decrease-cart-quantity",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    const order = new OrdersController(req);
    order.decreaseCartItemQuantity(res);
  }
);

orderRoutes.delete(
  "/delete-cart-item",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    const order = new OrdersController(req);
    order.deleteCartItem(res);
  }
);

orderRoutes.get(
  "/completed-orders",
  verifyToken.verifyUser,
  (request, response) => {
    new OrdersController(request).getCompletedOrders(response);
  }
);

orderRoutes.get(
  "/upcoming-orders",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    new OrdersController(req).getUpcomingOrders(res);
  }
);

orderRoutes.get(
  "/order-list",
  verifyToken.verifyAdmin,
  (req: Request, res: Response) => {
    new OrdersController(req).getAdminOrderList(res);
  }
);

export default orderRoutes;
