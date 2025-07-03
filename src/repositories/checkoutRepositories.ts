import sql from "../config/database.js";

class CheckoutRepository {
  public async createOrder(
    user_id: string,
    order_id: string,
    amount: number,
    delivery_status: boolean,
    payment_status: string
  ): Promise<void> {
    const query = await sql`
    INSERT INTO orders (user_id, order_id, amount, delivery_status, payment_status) values (
      ${user_id}, ${order_id}, ${amount}, ${delivery_status}, ${payment_status})
    `;
    console.log("Order created:", query);
  }

  public async insertOrderItems(
    orderData: { product_id: string; order_id: string; user_id: string }[]
  ): Promise<void> {
    await sql`INSERT INTO  ordered_items ${sql(
      orderData,
      "product_id",
      "order_id",
      "user_id"
    )}`;
  }

  public async captureOrder(orderId: string): Promise<void> {
    const query = await sql`
      UPDATE orders
      SET payment_status = 'PAID'
      WHERE order_id = ${orderId}
    `;
    console.log("Order captured:", query);
  }
}

export default new CheckoutRepository();
