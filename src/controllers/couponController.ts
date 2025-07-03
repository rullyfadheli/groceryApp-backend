import { Request, Response } from "express";
import couponServices from "../services/couponServices.js";
class CouponController {
  public async getCoupons(res: Response): Promise<void> {
    try {
      const coupon = await couponServices.getCoupons();
      if (!coupon || coupon.length === 0) {
        res.status(404).json({ message: "No coupons found." });
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching coupons." });
    }
  }
}

export default new CouponController();
