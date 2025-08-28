import sql from "../config/database.js";
class CouponRepositories {
  public async getCoupons(user_id: string) {
    const query = await sql`
    SELECT 
      c.coupon_code,
      c.discount_percentage,
      c.expired_on,
      rc.redeemed
    FROM coupon c
    LEFT JOIN redeemed_coupon rc 
      ON c.coupon_code = rc.coupon_code 
      AND rc.user_id = ${user_id}
  `;
    return query;
  }

  public async getCouponByCode(couponCode: string) {
    const query =
      await sql`SELECT * FROM coupon WHERE coupon_code = ${couponCode}`;
    return query;
  }

  public async redeemedCoupon(user_id: string, coupon_code: string) {
    const query = await sql`
      SELECT c.discount_percentage,
             c.coupon_code,
             CASE 
               WHEN rc.user_id IS NOT NULL THEN true 
               ELSE false 
             END as is_redeemed
      FROM coupon c 
      LEFT JOIN redeemed_coupon rc ON c.coupon_code = rc.coupon_code 
        AND rc.user_id = ${user_id}
      WHERE c.coupon_code = ${coupon_code}`;
    return query;
  }

  public async addRedeemedCoupon(user_id: string, coupon_code: string) {
    const query =
      await sql`INSERT INTO redeemed_coupon (user_id, coupon_code) VALUES (${user_id}. ${coupon_code})`;
    return query;
  }
}

export default new CouponRepositories();
