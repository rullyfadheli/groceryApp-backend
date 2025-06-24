import sql from "../config/database.js";

class OrderRepositories {
  public async getShoppingCart(user_id: string) {
    const query =
      await sql`SELECT * FROM shopping_cart WHERE user_id = ${user_id}`;
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
}

export default new OrderRepositories();
