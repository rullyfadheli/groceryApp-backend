import axios from "axios";
import dotenv from "dotenv";
import { Request, response, Response } from "express";

// Types
import postgres from "postgres";
import { OrderData, Item } from "../types/checkoutType.js";

// Service layers
import checkoutServices from "../services/checkoutServices.js";
import orderServices from "../services/orderServices.js";
import couponServices from "../services/couponServices.js";
import userServices from "../services/userServices.js";
import AddressServices from "../services/addressServices.js";

dotenv.config();

// Types
interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PaypalUrl {
  order_id: string;
  approvalUrl: string;
  captureUrl: string;
  coupon_code: string | null;
}

class CheckoutController {
  private user_id?: string;
  private capture_checkout_url?: string;
  private coupon_code?: string;
  private order_id?: string;
  private payment_order_id?: string;
  private address_id?: string;

  constructor(req: Request) {
    this.user_id = req.user.id;
    this.capture_checkout_url = req.body?.url;
    this.coupon_code = req.body?.coupon_code;
    this.order_id = req.query?.order_id as string;
    this.payment_order_id = req.body?.order_id;
    this.address_id = req.body?.address_id;
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

      if (!this.address_id) {
        res.status(400).json({ error: "Address does not provided!" });
        return;
      }

      const shoppingCart: boolean | postgres.RowList<postgres.Row[]> =
        await orderServices.getShoppingCart(this.user_id);

      // console.log(shoppingCart);

      if (
        !shoppingCart ||
        !Array.isArray(shoppingCart) ||
        shoppingCart.length === 0
      ) {
        res.status(404).json([{ message: "Shopping cart data is not found" }]);
        return;
      }

      const price: number = shoppingCart.reduce((sum, item) => {
        const itemPrice =
          Number(item.price - (item.price * item.discount_percentage) / 100) ||
          0; // Default to 0 if it's not a valid number
        const itemQuantity = Number(item.quantity) || 0; // Default to 0 if it's not a valid number
        return sum + itemPrice * itemQuantity;
      }, 0);

      // console.log(this.coupon_code);

      let discount: number = 0;

      if (this.coupon_code) {
        const result: false | postgres.RowList<postgres.Row[]> =
          await couponServices.getCouponByCode(this.coupon_code);

        if (result) {
          discount = result[0].discount_percentage;
        } else {
          discount = 0;
        }
      }

      const final_price: number = price - (price * discount) / 100;

      if (isNaN(final_price) || final_price <= 0) {
        console.error("Invalid final_price calculated:", final_price);
        res
          .status(400)
          .json({ error: "Could not calculate a valid total order amount." });
        return;
      }

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

      // console.log(response);

      const shoppingCartData = shoppingCart.map(
        ({ id, created_at, quantity, price, ...rest }) => rest
      );
      console.log(shoppingCartData);
      // console.log(response.data.id);

      const fetchAddress: boolean | postgres.RowList<postgres.Row[]> =
        await new AddressServices().getAddressByUserId(this.user_id);

      if (!fetchAddress) {
        res.status(404).json([{ message: "Address was not registered yet" }]);
        return;
      }

      const delivery_address = fetchAddress[0].address as string;
      const order_id: string = response.data.id;
      const payment_status: string = "PENDING";
      const delivery_status: boolean = false;
      const amount: number = final_price;

      const orderData = shoppingCartData.map((items) => ({
        product_id: items.product_id,
        order_id,
        user_id: items.user_id,
      }));

      // console.log(orderData);

      // Inserting order data into the database
      const insertOrderData: boolean = await checkoutServices.createOrder(
        this.user_id as string,
        order_id,
        amount,
        delivery_status,
        payment_status,
        delivery_address
      );

      if (!insertOrderData) {
        res.status(500).json([{ message: "Failed to process your order" }]);
        return;
      }

      // Inserting order items into the database
      const insertOrderedItems: boolean =
        await checkoutServices.insertOrderItems(orderData);

      if (!insertOrderedItems) {
        res
          .status(500)
          .json([{ message: "Server error! Failed to process your order" }]);
        return;
      }

      // // Find the approval link from the response
      const approvalLink = response.data.links.find(
        (link: any) => link.rel === "approve"
      );

      const captureLink = response.data.links.find(
        (link: any) => link.rel === "capture"
      );

      // console.log(captureLink);

      if (approvalLink) {
        // Send the approval link back to the frontend
        res.status(200).json([
          {
            order_id,
            approvalUrl: approvalLink.href,
            captureUrl: captureLink.href,
            coupon_code: this.coupon_code,
          },
        ] as PaypalUrl[]);
        return;
      } else {
        res.status(500).json({ error: "Could not find PayPal approval link." });
        return;
      }

      // res.status(201).json(response.data as PayPalOrder);
      // return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to create order" });
      return;
    }
  }

  async captureOrder(res: Response): Promise<void> {
    const accessToken = await this.getAccessToken();
    console.log(this.capture_checkout_url);

    console.log(this.user_id);

    if (!this.user_id) {
      res.status(401).json([{ message: "Access denied" }]);
      return;
    }

    if (!this.capture_checkout_url) {
      res.status(400).json([{ message: "Invalid checkout Url" }]);
      return;
    }

    if (!accessToken) {
      res.status(401).json({ error: "Payment unauthorized" });
      return;
    }

    if (!this.payment_order_id) {
      res.status(404).json([{ message: "order_id was not provided" }]);
      return;
    }

    try {
      // Validating order status before capture
      const paymentStatus: false | postgres.RowList<postgres.Row[]> =
        await orderServices.getPaymentStatus(
          this.payment_order_id,
          this.user_id
        );

      if (paymentStatus && paymentStatus[0].payment_status === "PAID") {
        res.status(200).json({ message: "Order is already paid" });
        return;
      }

      const response = await axios({
        method: "post",
        url: this.capture_checkout_url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // FIX: Add an empty JSON object as the request body
        data: {},
      });

      const shoppingCartData: boolean | postgres.RowList<postgres.Row[]> =
        await orderServices.getShoppingCart(this.user_id);

      if (!shoppingCartData || !Array.isArray(shoppingCartData)) {
        res
          .status(404)
          .json([{ message: "There is no item in your shopping cart" }]);
        return;
      }

      // Update payment status in the database
      await orderServices.updatePaymentStatus(
        this.payment_order_id,
        "PAID",
        this.user_id
      );

      //Removing items from the shopping cart
      const deleteData = shoppingCartData.map((items) => items.product_id);
      await orderServices.deleteMultipleCartItems(this.user_id, deleteData);

      res.status(200).json(response.data);
      return;
    } catch (error) {
      console.error("Error capturing order:", error);
      res.status(500).json({ error: "Failed to capture order" });
      return;
    }
  }

  public async getOrderDetails(res: Response) {
    if (!this.user_id) {
      response.status(401).json([{ message: "Access denied" }]);
      return;
    }

    if (!this.order_id) {
      res.status(404).json([{ message: "order_id was not provided" }]);
      return;
    }

    try {
      const checkoutData: postgres.RowList<postgres.Row[]> | false =
        await checkoutServices.getOrderDetails(this.order_id, this.user_id);

      if (!checkoutData || !Array.isArray(checkoutData)) {
        res.status(400).json([{ message: "Failed to get order details" }]);
        return;
      }

      console.log(checkoutData);

      const amount: number = checkoutData[0].amount;

      const items = checkoutData.map(({ amount, ...rest }) => {
        const final_price =
          rest.price - (rest.price * rest.discount_percentage) / 100;
        const total = final_price * rest.quantity;
        rest = { ...rest, final_price, total };
        return rest;
      });

      const finalData = {
        amount,
        items,
      };

      res.status(200).json(finalData as OrderData);
      return;
    } catch (error) {
      console.log(error);
      res.status(400).json([{ message: "Failed to get order details" }]);
      return;
    }
  }
}

export default CheckoutController;
