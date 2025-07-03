import checkoutRepositories from "../repositories/checkoutRepositories.js";

class checkoutServices {
  public async createOrder(
    user_id: string,
    order_id: string,
    amount: number,
    delivery_status: boolean,
    payment_status: string
  ): Promise<boolean> {
    try {
      await checkoutRepositories.createOrder(
        user_id,
        order_id,
        amount,
        delivery_status,
        payment_status
      );
      return true;
    } catch (error) {
      console.error("Error creating order:", error);
      return false;
    }
  }

  public async insertOrderItems(
    orderData: { product_id: string; order_id: string; user_id: string }[]
  ): Promise<boolean> {
    try {
      await checkoutRepositories.insertOrderItems(orderData);
      return true;
    } catch (error) {
      console.error("Error inserting order items:", error);
      return false;
    }
  }
}

export default new checkoutServices();
