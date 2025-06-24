import { Request, response, Response } from "express";

import orderServices from "../services/orderServices.js";
import productServices from "../services/productServices.js";

class OrdersController {
  private user_id?: string;
  private product_id?: string;

  constructor(request: Request) {
    this.user_id = request.user?.id;
    this.product_id = request.body?.product_id;
  }

  // Get the shopping cart for a user
  public async getShoppingCart(response: Response): Promise<void> {
    console.log(this.user_id);
    if (!this.user_id) {
      response.status(400).json([{ message: "Please input valid data" }]);
      return;
    }

    const orderData = await orderServices.getShoppingCart(this.user_id);
    console.log("orderData", orderData);

    if (!orderData || !Array.isArray(orderData) || orderData.length === 0) {
      response.status(404).json([
        {
          message: "Items not found, please add an item to the Shopping cart",
        },
      ]);
      return;
    }

    response.status(200).json(orderData);
    return;
  }

  // Add new item to shopping cart
  public async addToCart(response: Response): Promise<void> {
    if (!this.product_id || !this.user_id) {
      console.log(this.user_id, this.product_id);
      response
        .status(400)
        .json([{ message: "Failed to add new item to cart" }]);
      return;
    }

    const defaultQuantity: number = 1;

    const productDataFromDB = await productServices.getProductById(
      this.product_id
    );

    if (!productDataFromDB || !Array.isArray(productDataFromDB)) {
      response.status(404).json([{ message: "Product not found" }]);
      return;
    }

    const { price } = productDataFromDB[0];
    // console.log("price", price);

    const isItemInCart = await orderServices.verifyCartItem(
      this.user_id,
      this.product_id
    );

    console.log("isItemInCart", isItemInCart);
    if (!isItemInCart && !Array.isArray(isItemInCart)) {
      response
        .status(404)
        .json([{ message: "Server error, please contact admin" }]);
      return;
    }

    if (
      isItemInCart &&
      Array.isArray(isItemInCart) &&
      isItemInCart.length > 0
    ) {
      const updateQuantity: number = isItemInCart[0]?.quantity + 1;

      await orderServices.updateCartItem(
        this.user_id,
        this.product_id,
        updateQuantity
      );

      response.status(201).json([
        {
          message:
            "Item is already exist in the cart, the item quantity will be added",
        },
      ]);
      return;
    }

    const insertToDB = await orderServices.insertCartItems(
      this.user_id,
      this.product_id,
      defaultQuantity,
      price
    );

    if (!insertToDB) {
      response
        .status(400)
        .json([{ message: "Failed to insert new item to cart" }]);
      return;
    }

    response.status(200).json([{ message: "item added succesfully" }]);
    return;
  }

  public async increaseCartItemQuantity(response: Response): Promise<void> {
    if (!this.user_id || !this.product_id) {
      console.log(this.user_id, this.product_id);

      response.status(400).json([{ message: "Please input valid data" }]);
      return;
    }

    const isItemInCart = await orderServices.verifyCartItem(
      this.user_id,
      this.product_id
    );

    if (
      !isItemInCart ||
      !Array.isArray(isItemInCart) ||
      isItemInCart.length === 0
    ) {
      response.status(404).json([{ message: "Item not found in the cart" }]);
      return;
    }

    const updateQuantity: number = isItemInCart[0]?.quantity + 1;

    await orderServices.updateCartItem(
      this.user_id,
      this.product_id,
      updateQuantity
    );

    response.status(201).json([{ message: "Item quantity increased" }]);
    return;
  }

  public async decreaseCartItemQuantity(response: Response): Promise<void> {
    if (!this.user_id || !this.product_id) {
      console.log(this.user_id, this.product_id);

      response.status(400).json([{ message: "Please input valid data" }]);
      return;
    }

    const isItemInCart = await orderServices.verifyCartItem(
      this.user_id,
      this.product_id
    );

    if (
      !isItemInCart ||
      !Array.isArray(isItemInCart) ||
      isItemInCart.length === 0
    ) {
      response.status(404).json([{ message: "Item not found in the cart" }]);
      return;
    }

    const updateQuantity: number = isItemInCart[0]?.quantity - 1;

    await orderServices.updateCartItem(
      this.user_id,
      this.product_id,
      updateQuantity
    );

    response.status(201).json([{ message: "Item quantity decreased" }]);
    return;
  }

  public async deleteCartItem(response: Response): Promise<void> {
    if (!this.user_id || !this.product_id) {
      console.log(this.user_id, this.product_id);

      response.status(400).json([{ message: "Please input valid data" }]);
      return;
    }

    const isItemInCart = await orderServices.verifyCartItem(
      this.user_id,
      this.product_id
    );

    if (
      !isItemInCart ||
      !Array.isArray(isItemInCart) ||
      isItemInCart.length === 0
    ) {
      response.status(404).json([{ message: "Item not found in the cart" }]);
      return;
    }

    const isItemDeleted = await orderServices.deleteCartItem(
      this.user_id,
      this.product_id
    );

    if (!isItemDeleted) {
      response
        .status(400)
        .json([{ message: "Failed to delete item from cart" }]);
      return;
    }

    response.status(200).json([{ message: "Item deleted from the cart" }]);
    return;
  }
}
export default OrdersController;
