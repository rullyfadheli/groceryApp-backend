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

  public async getOrderDetails(order_id: string, user_id: string) {
    const query = await sql`
    SELECT 
      o.amount,
      o.created_at,
      sc.quantity,
      p.name,
      p.price,
      d.discount_percentage
    FROM 
      orders o
    JOIN 
      shopping_cart sc ON sc.user_id = o.user_id
    JOIN 
      products p ON sc.product_id = p.id
    LEFT JOIN 
      discount d ON d.product_id = p.id
    WHERE 
      o.order_id = ${order_id} AND o.user_id = ${user_id}
  `;
    return query;
  }
}

export default new CheckoutRepository();
