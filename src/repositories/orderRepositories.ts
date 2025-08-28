import sql from "../config/database.js";

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
    // Do nothing if there are no product IDs to delete
    if (!userId || productIds.length === 0) {
      return;
    }

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
}

export default new OrderRepositories();
