import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";

import checkoutServices from "../services/checkoutServices.js";
import orderServices from "../services/orderServices.js";
import couponRepositories from "../repositories/couponRepositories.js";

dotenv.config();

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

class CheckoutController {
  private user_id?: string;
  private capture_checkout_url?: string;
  private coupon_code?: string;

  constructor(req: Request) {
    this.user_id = req.user.id;
    this.capture_checkout_url = req.body.url;
  }
  public async getAccessToken(): Promise<string> {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API =
      process.env.PAYPAL_API || "https://api.sandbox.paypal.com";

    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    try {
      const response = await axios({
        method: "post",
        url: `${PAYPAL_API}/v1/oauth2/token`,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "grant_type=client_credentials",
      });

      return response.data.access_token;
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw error;
    }
  }

  async createOrder(res: Response): Promise<PayPalOrder | void> {
    const accessToken: string = await this.getAccessToken();
    const PAYPAL_API: string =
      process.env.PAYPAL_API || "https://api.sandbox.paypal.com";

    try {
      if (!this.user_id) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const shoppingCart = await orderServices.getShoppingCart(this.user_id);

      if (
        !shoppingCart ||
        !Array.isArray(shoppingCart) ||
        shoppingCart.length === 0
      ) {
        res.status(404).json([{ message: "Shopping cart data is not found" }]);
        return;
      }

      const price: number = shoppingCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      let discount: number = 0;

      if (this.coupon_code) {
        const result = await couponRepositories.getCouponByCode(
          this.coupon_code
        );
        discount = result[0].discount_percentage;
      }

      // console.log(price);

      const final_price: number = price - (price * discount) / 100;

      // console.log(final_price);

      const response = await axios({
        method: "post",
        url: `${PAYPAL_API}/v2/checkout/orders`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: final_price.toFixed(2),
              },
            },
          ],
          application_context: {
            return_url: "http://localhost:3000/return",
            cancel_url: "http://localhost:3000/cancel",
          },
        },
      });

      const shoppingCartData = shoppingCart.map(
        ({ id, created_at, quantity, price, ...rest }) => rest
      );
      // console.log(shoppingCartData);
      // console.log(response.data.id);

      const order_id: string = response.data.id;
      const payment_status: string = "PENDING";
      const delivery_status: boolean = false;
      const amount: number = final_price;

      const orderData = shoppingCartData.map((items) => ({
        product_id: items.product_id,
        order_id,
        user_id: items.user_id,
      }));

      console.log(orderData);

      // Inserting order data into the database
      await checkoutServices.createOrder(
        this.user_id as string,
        order_id,
        amount,
        delivery_status,
        payment_status
      );

      // Inserting order items into the database
      await checkoutServices.insertOrderItems(orderData);

      // Removing items from the shopping cart
      await orderServices.deleteMultipleCartItems(orderData);

      res.status(201).json(response.data as PayPalOrder);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to create order" });
      return;
    }
  }

  async captureOrder(res: Response): Promise<void> {
    const accessToken = await this.getAccessToken();

    if (!this.capture_checkout_url) {
      res.status(400).json([{ message: "Invalid checkout Url" }]);
      return;
    }

    if (!accessToken) {
      res.status(401).json({ error: "Payment unauthorized" });
      return;
    }

    try {
      const response = await axios({
        method: "post",
        url: this.capture_checkout_url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error capturing order:", error);
      res.status(500).json({ error: "Failed to capture order" });
      return;
    }
  }
}

export default CheckoutController;
