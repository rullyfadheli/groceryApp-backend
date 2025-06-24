import orderRepositories from "../repositories/orderRepositories.js";
import { RowList } from "postgres";
import { Row } from "postgres";

class OrderServices {
  public async getShoppingCart(
    user_id: string
  ): Promise<boolean | RowList<Row[]>> {
    try {
      return await orderRepositories.getShoppingCart(user_id);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async insertCartItems(
    user_id: string,
    product_id: string,
    quantity: number,
    price: number
  ): Promise<boolean> {
    try {
      await orderRepositories.addToCart(user_id, product_id, quantity, price);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async verifyCartItem(
    user_id: string,
    product_id: string
  ): Promise<boolean | RowList<Row[]>> {
    try {
      return await orderRepositories.verifyCartItem(user_id, product_id);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async updateCartItem(
    user_id: string,
    product_id: string,
    quantity: number
  ): Promise<boolean> {
    try {
      await orderRepositories.updateCartItem(user_id, product_id, quantity);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async deleteCartItem(
    user_id: string,
    product_id: string
  ): Promise<boolean> {
    try {
      await orderRepositories.deleteCartItem(user_id, product_id);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new OrderServices();
