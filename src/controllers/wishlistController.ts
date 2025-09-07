import { Request, Response } from "express";
import postgres from "postgres";

// Types
import type { WishlistProductList } from "../types/wishlistType.js";

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
      const discount = (rest.discount_percentage * rest.price) / 100;
      const final_Price = rest.price - discount;
      rest = { ...rest, final_Price: final_Price.toFixed(2) };
      return rest;
    }) as WishlistProductList;

    response.status(200).json(filteredData as WishlistProductList);
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

  public async removeFromWishlist(response: Response): Promise<Response> {
    if (!this.user_id) {
      return response.status(401).json([{ message: "Access denied" }]);
    }

    if (!this.product_id) {
      return response.status(400).json([{ message: "Product_id is required" }]);
    }

    const removeItem: boolean = await wishlistServices.removeItemFromWishlist(
      this.user_id,
      this.product_id
    );

    if (!removeItem) {
      return response
        .status(500)
        .json([{ message: "Internal server error, failed to remove item" }]);
    }

    return response.status(200).json([{ message: "Wishlist item removed" }]);
  }
}

export default WishlistController;
