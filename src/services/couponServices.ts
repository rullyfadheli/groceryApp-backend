import couponRepositories from "../repositories/couponRepositories.js";
import CouponRepositories from "../repositories/couponRepositories.js";

import postgres from "postgres";
class CouponServices {
  public async getCoupons(
    user_id: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const result = await CouponRepositories.getCoupons(user_id);
      return result;
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return false;
    }
  }

  public async getCouponByCode(
    couponCode: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const result = await CouponRepositories.getCouponByCode(couponCode);
      return result;
    } catch (error) {
      console.error("Error fetching coupon by code:", error);
      return false;
    }
  }

  public async getRedeemedCoupons(
    user_id: string,
    coupon_code: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const coupon: postgres.RowList<postgres.Row[]> =
        await couponRepositories.redeemedCoupon(user_id, coupon_code);
      return coupon;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async addRedeemedCoupon(
    user_id: string,
    coupon_code: string
  ): Promise<boolean> {
    try {
      await CouponRepositories.addRedeemedCoupon(user_id, coupon_code);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new CouponServices();
