import { Request, Response } from "express";
import postgres from "postgres";

import orderServices from "../services/orderServices.js";
import productServices from "../services/productServices.js";

// Types
import type { OrderItem } from "../types/orderType.js";
import type { ErrorMessage } from "../types/errorType.js";

/**
 * @class OrdersController
 * Handles HTTP requests related to user shopping carts, including adding,
 * viewing, updating, and removing cart items.
 */
class OrdersController {
  private user_id?: string;
  private product_id?: string;
  private coupon_code?: string;

  /**
   * Initializes the controller with data from the incoming request.
   * @param {Request} request - The Express request object.
   */
  constructor(request: Request) {
    this.user_id = request.user?.id as string;
    this.product_id = request.body?.product_id as string;
    this.coupon_code = request.query?.coupon_code as string;
  }

  /**
   * Private helper method to verify if an item exists in the user's cart.
   * Sends a 404 response if the item is not found.
   * @param {Response} response - The Express response object.
   * @returns {Promise<postgres.Row[] | null>} A promise that resolves to the cart item data or null if not found.
   */
  private async _verifyItemInCart(
    response: Response
  ): Promise<postgres.Row[] | null> {
    if (!this.user_id || !this.product_id) {
      response
        .status(400)
        .json([{ message: "User ID and Product ID are required." }]);
      return null;
    }

    const cartItem = await orderServices.verifyCartItem(
      this.user_id,
      this.product_id
    );

    if (!cartItem || !Array.isArray(cartItem) || cartItem.length === 0) {
      response.status(404).json([{ message: "Item not found in the cart." }]);
      return null;
    }

    return cartItem;
  }

  /**
   * Retrieves all items in the user's shopping cart.
   * @param {Response} response - The Express response object.
   */
  public async getShoppingCart(response: Response): Promise<void> {
    if (!this.user_id) {
      response.status(400).json([{ message: "User ID is required." }]);
      return;
    }

    const orderData = await orderServices.getShoppingCart(this.user_id);

    if (!orderData || !Array.isArray(orderData) || orderData.length === 0) {
      response.status(404).json([{ message: "Your shopping cart is empty." }]);
      return;
    }

    const calculateFinalPrice = orderData.map((item): OrderItem => {
      const discount = item.discount_percentage || 0;
      const finalPrice = item.price - (item.price * discount) / 100;
      return { ...item, final_price: finalPrice } as OrderItem;
    });

    // Exclude user_id from the final response for cleaner output
    const finalResponse = calculateFinalPrice.map(
      ({ user_id, ...rest }) => rest
    );

    response.status(200).json(finalResponse);
  }

  /**
   * Adds a new item to the user's shopping cart.
   * @param {Response} response - The Express response object.
   */
  public async addToCart(response: Response): Promise<void> {
    console.log(this.product_id);
    if (!this.product_id || !this.user_id) {
      response
        .status(400)
        .json([{ message: "Failed to add new item to cart." }]);
      return;
    }

    // Check if the item already exists in the cart
    const isItemInCart = await orderServices.verifyCartItem(
      this.user_id,
      this.product_id
    );

    if (
      isItemInCart &&
      Array.isArray(isItemInCart) &&
      isItemInCart.length > 0
    ) {
      response
        .status(409)
        .json([{ message: "Item already exists in the cart." }]);
      return;
    }

    // Verify that the product exists before adding it
    const productData = await productServices.getProductById(this.product_id);
    if (
      !productData ||
      !Array.isArray(productData) ||
      productData.length === 0
    ) {
      response.status(404).json([{ message: "Product not found." }]);
      return;
    }

    const { price } = productData[0];
    const defaultQuantity = 1;

    const insertToDB = await orderServices.insertCartItems(
      this.user_id,
      this.product_id,
      defaultQuantity,
      price
    );

    if (!insertToDB) {
      response
        .status(400)
        .json([{ message: "Failed to insert new item to cart." }]);
      return;
    }

    response.status(201).json([{ message: "Item added successfully." }]);
  }

  /**
   * Increases the quantity of a specific item in the cart by one.
   * @param {Response} response - The Express response object.
   */
  public async increaseCartItemQuantity(response: Response): Promise<void> {
    const isItemInCart = await this._verifyItemInCart(response);
    if (!isItemInCart) return;

    const newQuantity: number = isItemInCart[0]?.quantity + 1;

    await orderServices.updateCartItem(
      this.user_id!,
      this.product_id!,
      newQuantity
    );

    response.status(200).json([{ message: "Item quantity increased." }]);
  }

  /**
   * Decreases the quantity of a specific item in the cart.
   * If the quantity reaches zero, the item is removed from the cart.
   * @param {Response} response - The Express response object.
   */
  public async decreaseCartItemQuantity(response: Response): Promise<void> {
    const isItemInCart = await this._verifyItemInCart(response);
    if (!isItemInCart) return;

    const currentQuantity: number = isItemInCart[0]?.quantity;

    if (currentQuantity <= 1) {
      // If quantity is 1 or less, remove the item from the cart
      await orderServices.deleteCartItem(this.user_id!, this.product_id!);
      response
        .status(200)
        .json([{ message: "Item removed as quantity reached zero." }]);
    } else {
      // Otherwise, just decrease the quantity
      const newQuantity = currentQuantity - 1;
      await orderServices.updateCartItem(
        this.user_id!,
        this.product_id!,
        newQuantity
      );
      response.status(200).json([{ message: "Item quantity decreased." }]);
    }
  }

  /**
   * Deletes an item completely from the user's shopping cart.
   * @param {Response} response - The Express response object.
   */
  public async deleteCartItem(response: Response): Promise<void> {
    try {
      const isItemInCart: postgres.Row[] | null = await this._verifyItemInCart(
        response
      );
      if (!isItemInCart) return;

      const isItemDeleted: boolean = await orderServices.deleteCartItem(
        this.user_id!,
        this.product_id!
      );

      if (!isItemDeleted) {
        response
          .status(400)
          .json([{ message: "Failed to delete item from cart." }]);
        return;
      }

      response.status(200).json([{ message: "Item deleted from the cart." }]);
    } catch (err) {
      console.log(err);
      response
        .status(500)
        .json([
          { message: "Server error, failed to delete the item from cart" },
        ]);
      return;
    }
  }

  public async getCompletedOrders(response: Response): Promise<void> {
    try {
      if (!this.user_id) {
        response.status(401).json([{ message: "Access denied" }]);
        return;
      }

      const dbResponse: false | postgres.RowList<postgres.Row[]> =
        await orderServices.getCompletedOrders(this.user_id);

      console.log(dbResponse);

      if (!dbResponse) {
        response
          .status(500)
          .json([{ message: " Server error! Failed to fetch ordered items" }]);
        return;
      }

      const final_response = dbResponse.map((items) => {
        const discount_percentage = items?.discount_percentage || 0;
        const final_price: number =
          items.price - (items.price * discount_percentage) / 100;
        return { ...items, final_price };
      });

      response.status(200).json(final_response);
    } catch (err) {
      console.log(err);
      response
        .status(500)
        .json([{ message: " Server error! Failed to fetch ordered items" }]);
      return;
    }
  }

  public async getUpcomingOrders(response: Response): Promise<void> {
    try {
      if (!this.user_id) {
        response.status(401).json([{ message: " Access denied!" }]);
        return;
      }

      const success: false | postgres.RowList<postgres.Row[]> =
        await orderServices.getUpcomingOrders(this.user_id);

      if (!success) {
        response
          .status(500)
          .json([{ message: " Server error! Failed to fetch ordered items" }]);
        return;
      }

      const updatePrice = success.map((items) => {
        const discount: number =
          items.price - (items.price * items.discount_percentage) / 100;

        return { ...items, final_price: discount };
      });

      response.status(200).json(updatePrice);
      return;
    } catch (err) {
      console.log(err);
      response
        .status(500)
        .json([{ message: " Server error! Failed to fetch ordered items" }]);
      return;
    }
  }
}

export default OrdersController;
