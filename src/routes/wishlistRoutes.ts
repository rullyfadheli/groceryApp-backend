import express, { Request, response, Response } from "express";

import WishlistController from "../controllers/wishlistController.js";
import verifyToken from "../controllers/verifyToken.js";
const wishlistRouter = express.Router();

wishlistRouter.get(
  "/wishlist",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    new WishlistController(req).getWishlist(res);
  }
);

export default wishlistRouter;
