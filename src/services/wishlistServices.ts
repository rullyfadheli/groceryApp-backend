import wishlistRepositories from "../repositories/wishlistRepositories.js";

class WishlistServices {
  public async getWishlist(user_id: string) {
    try {
      const wishlist = await wishlistRepositories.getWishlist(user_id);
      return wishlist;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async addWishlist(user_id: string, product_id: string) {
    try {
      await wishlistRepositories.addWishlist(user_id, product_id);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  public async removeItemFromWishlist(user_id: string, product_id: string) {
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
