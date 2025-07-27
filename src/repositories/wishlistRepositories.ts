import sql from "../config/database.js";

class Wishlist {
  public async getWishlist(user_id: string) {
    const query = await sql`SELECT * FROM wishlist WHERE user_id = ${user_id}`;
    return query;
  }

  public async addWishlist(user_id: string, product_id: string) {
    const query =
      await sql`INSERT INTO wishlist (user_id, product_id) VALUES (${user_id}, ${product_id})`;
    return query;
  }

  public async removeItemFromWishlist(user_id: string, product_id: string) {
    const query =
      await sql`DELETE * FROM wishlist WHERE user_id = ${user_id} AND product_id = ${product_id}`;
    return query;
  }
}

export default new Wishlist();
