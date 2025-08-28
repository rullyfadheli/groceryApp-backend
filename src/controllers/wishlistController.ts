import { Request, Response } from "express";
import postgres from "postgres";

// Types
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

  public async getWishlist(response: Response): Promise<void> {
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

    const filteredData = wishlistData.map(({ user_id, ...rest }) => {
      return rest;
    });

    response.status(200).json(filteredData as Wishlist);
  }

  public async addToWishlist(response: Response): Promise<Response> {
    try {
      if (!this.user_id) {
        return response.status(401).json([{ message: "Access denied" }]);
      } else if (!this.product_id) {
        return response
          .status(400)
          .json([{ message: "Product_id is required" }]);
      }

      const sendToDB: boolean = await wishlistServices.addWishlist(
        this.user_id,
        this.product_id
      );

      if (!sendToDB) {
        return response
          .status(400)
          .json([{ message: "Internal server error" }]);
      }

      return response
        .status(201)
        .json([
          { message: "The product has added successfully to the wishlist" },
        ]);
    } catch (err) {
      console.log(err);
      return response.status(500).json([{ message: "Internal server error" }]);
    }
  }
}

export default WishlistController;
