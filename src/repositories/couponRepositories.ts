import sql from "../config/database.js";
class CouponRepositories {
  public async getCoupons() {
    const query = sql`SELECT * FROM coupons`;
    return query;
  }

  public async getCouponByCode(couponCode: string) {
    const query =
      await sql`SELECT * FROM coupons WHERE coupon_code = ${couponCode}`;
    return query;
  }
}

export default new CouponRepositories();
