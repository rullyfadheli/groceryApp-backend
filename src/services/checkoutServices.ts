import checkoutRepositories from "../repositories/checkoutRepositories.js";
import postgres from "postgres";

class checkoutServices {
  public async createOrder(
    user_id: string,
    order_id: string,
    amount: number,
    delivery_status: boolean,
    payment_status: string,
    delivery_address: string
  ): Promise<boolean> {
    try {
      await checkoutRepositories.createOrder(
        user_id,
        order_id,
        amount,
        delivery_status,
        payment_status,
        delivery_address
      );
      return true;
    } catch (error) {
      console.error("Error creating order:", error);
      return false;
    }
  }

  public async insertOrderItems(
    orderData: {
      product_id: string;
      order_id: string;
      user_id: string;
      quantity: number;
    }[]
  ): Promise<boolean> {
    try {
      await checkoutRepositories.insertOrderItems(orderData);
      return true;
    } catch (error) {
      console.error("Error inserting order items:", error);
      return false;
    }
  }

  public async getOrderDetails(
    order_id: string,
    user_id: string
  ): Promise<postgres.RowList<postgres.Row[]> | false> {
    try {
      const data = await checkoutRepositories.getOrderDetails(
        order_id,
        user_id
      );
      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default new checkoutServices();
