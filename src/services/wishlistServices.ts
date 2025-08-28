import wishlistRepositories from "../repositories/wishlistRepositories.js";
import postgres from "postgres";

class WishlistServices {
  public async getWishlist(
    user_id: string
  ): Promise<postgres.RowList<postgres.Row[]> | false> {
    try {
      const wishlist = await wishlistRepositories.getWishlist(user_id);
      return wishlist;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async addWishlist(
    user_id: string,
    product_id: string
  ): Promise<boolean> {
    try {
      await wishlistRepositories.addWishlist(user_id, product_id);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  public async removeItemFromWishlist(
    user_id: string,
    product_id: string
  ): Promise<boolean> {
    try {
      await wishlistRepositories.removeItemFromWishlist(user_id, product_id);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new WishlistServices();
