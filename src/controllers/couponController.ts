import { Request, Response } from "express";
import couponServices from "../services/couponServices.js";
import postgres from "postgres";

// Types
import type { Coupon } from "../types/couponType.js";
class CouponController {
  private user_id?: string;

  constructor(request: Request) {
    this.user_id = request.user?.id as string;
  }

  public async getCoupons(res: Response): Promise<void> {
    try {
      if (!this.user_id) {
        res.status(400).json({ message: "User ID is required." });
        return;
      }
      const coupon: false | postgres.RowList<postgres.Row[]> =
        await couponServices.getCoupons(this.user_id);

      // console.log("coupon", coupon);
      if (!coupon || coupon.length === 0) {
        res.status(404).json({ message: "No coupons found." });
        return;
      }

      const filteredCoupons = coupon.filter((item) => {
        return item.redeemed === false || item.redeemed === null;
      });

      res.status(200).json(filteredCoupons as Coupon[]);
      return;
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching coupons." });
    }
    return;
  }
}

export default CouponController;
