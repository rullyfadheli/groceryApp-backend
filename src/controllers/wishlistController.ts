import { Request, Response } from "express";
import postgres from "postgres";
import type { Wishlist } from "../types/wishlistType.js";

import wishlistServices from "../services/wishlistServices.js";

class WishlistController {
  private user_id?: string;
  private product_id?: string;
  private getProduct_id?: string;

  constructor(request: Request) {
    this.product_id = request.body?.product_id as string;
    this.user_id = request.user?.id as string;
    this.getProduct_id = request.query?.product_ID as string;
  }

  async getWishlist(response: Response): Promise<void> {
    if (!this.user_id) {
      response.status(401).json([{ message: "Access denied" }]);
      return;
    }
    const wishlistData: false | postgres.RowList<postgres.Row[]> =
      await wishlistServices.getWishlist(this.user_id);

    if (
      !Array.isArray(wishlistData) ||
      wishlistData.length === 0 ||
      !wishlistData
    ) {
      response.status(404).json([{ message: "Wishlist is empty" }]);
      return;
    }

    response.status(200).json(wishlistData);
  }
}

export default WishlistController;
