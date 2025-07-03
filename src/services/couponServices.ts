import CouponRepositories from "../repositories/couponRepositories.js";
class CouponServices {
  public async getCoupons() {
    try {
      const result = await CouponRepositories.getCoupons();
      return result;
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return false;
    }
  }

  public async getCouponByCode(couponCode: string) {
    try {
      const result = await CouponRepositories.getCouponByCode(couponCode);
      return result;
    } catch (error) {
      console.error("Error fetching coupon by code:", error);
      return false;
    }
  }
}

export default new CouponServices();
