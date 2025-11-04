import sql from "../config/database";

class OrderRepositories {
  public async getShoppingCart(user_id: string) {
    const query = await sql`
    SELECT 
      sc.product_id,
      sc.quantity,
      sc.user_id,
      p.name,
      p.price,
      p.image,
      d.discount_percentage
    FROM shopping_cart sc
    LEFT JOIN discount d ON sc.product_id = d.product_id
    JOIN products p ON sc.product_id = p.id
    WHERE sc.user_id = ${user_id}
  `;
    return query;
  }

  public async addToCart(
    user_email: string,
    product_id: string,
    quantity: number,
    price: number
  ) {
    const query = sql`INSERT INTO shopping_cart 
    (user_id, product_id, quantity, price) 
    values (${user_email}, ${product_id}, ${quantity}, ${price})`;
    return query;
  }

  public async verifyCartItem(user_id: string, product_id: string) {
    const query = sql`SELECT * FROM shopping_cart WHERE user_id = ${user_id} AND product_id = ${product_id}`;
    return query;
  }

  public async updateCartItem(
    user_id: string,
    product_id: string,
    quantity: number
  ) {
    const query = sql`UPDATE shopping_cart SET quantity = ${quantity} WHERE user_id = ${user_id} AND product_id = ${product_id}`;
    return query;
  }

  public async deleteCartItem(user_id: string, product_id: string) {
    const query = sql`DELETE FROM shopping_cart WHERE user_id = ${user_id} AND product_id = ${product_id}`;
    return query;
  }

  public async deleteMultipeCartItems(userId: string, productIds: string[]) {
    // The sql(productIds) helper correctly formats the array for the IN clause
    await sql`
    DELETE FROM shopping_cart
    WHERE user_id = ${userId} AND product_id IN ${sql(productIds)}
  `;
  }

  public async getPaymentStatus(order_id: string, user_id: string) {
    const query = await sql`
      SELECT payment_status
      FROM orders
      WHERE order_id = ${order_id} AND user_id = ${user_id}
    `;
    return query;
  }

  public async updatePaymentStatus(
    order_id: string,
    status: string,
    user_id: string
  ) {
    const query = sql`
      UPDATE orders
      SET payment_status = ${status}
      WHERE order_id = ${order_id} AND user_id = ${user_id}
    `;
    return query;
  }

  public async getCompletedOrders(user_id: string) {
    const query = await sql`
    SELECT o.*,
    oi.quantity,
    p.name,
    p.price, 
    p.image,
    p.id AS product_id,
    p.serial_id,
    d.discount_percentage,
    ur.rating
    FROM orders o
    LEFT JOIN ordered_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN discount d ON p.id = d.product_id
    LEFT JOIN user_reviews ur ON ur.user_id = ${user_id} AND ur.product_id = p.id
    WHERE o.delivery_status = TRUE AND o.user_id = ${user_id}
    `;

    return query;
  }

  public async getUpcomingOrders(user_id: string) {
    const query = await sql`
    SELECT 
    o.*,
    oi.product_id,
    oi.quantity,
    p.name,
    p.price,
    p.image,
    p.stock,
    d.discount_percentage
    FROM orders o
    LEFT JOIN ordered_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN discount d ON p.id = d.product_id
    WHERE o.delivery_status = FALSE`;

    return query;
  }

  public async getAdminOrderList() {
    const query = await sql`
    SELECT 
    o.order_id AS orderid,
    u.username AS customerName,
    o.created_at AS orderDate,
    o.amount AS totalPrice,
    o.payment_status AS status,
    o.delivery_status AS deliveryStatus
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    `;

    return query;
  }
}

export default new OrderRepositories();
