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

wishlistRouter.post(
  "/add-to-wishlist",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    new WishlistController(req).addToWishlist(res);
  }
);

wishlistRouter.delete(
  "/remove-from-wishlist",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    new WishlistController(req).removeFromWishlist(res);
  }
);

export default wishlistRouter;
