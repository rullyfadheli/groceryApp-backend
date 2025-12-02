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

  public async deleteMultipleCartItems(
    user_id: string,
    items: string[]
  ): Promise<boolean> {
    try {
      await orderRepositories.deleteMultipeCartItems(user_id, items);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getPaymentStatus(order_id: string, user_id: string) {
    try {
      return await orderRepositories.getPaymentStatus(order_id, user_id);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async updatePaymentStatus(
    order_id: string,
    status: string,
    user_id: string
  ): Promise<boolean> {
    try {
      await orderRepositories.updatePaymentStatus(order_id, status, user_id);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getCompletedOrders(
    user_id: string
  ): Promise<false | RowList<Row[]>> {
    try {
      const order_list: RowList<Row[]> =
        await orderRepositories.getCompletedOrders(user_id);
      return order_list;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async getUpcomingOrders(
    user_id: string
  ): Promise<false | RowList<Row[]>> {
    try {
      const upcoming_orders: RowList<Row[]> =
        await orderRepositories.getUpcomingOrders(user_id);
      return upcoming_orders;
    } catch (error) {
      return false;
    }
  }

  public async getAdminOrderList(): Promise<RowList<Row[]> | null> {
    try {
      const result: RowList<Row[]> =
        await orderRepositories.getAdminOrderList();
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

export default new OrderServices();
