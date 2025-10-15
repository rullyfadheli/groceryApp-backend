import express, { Request, Response } from "express";
import postgres from "postgres";

import reviewServices from "../services/reviewServices.js";

class ReviewController {
  private productID?: string;
  private user_id?: string;
  private product_id?: string;
  private comment?: string;
  private rating?: number;

  constructor(request: Request) {
    this.productID = request.query?.productID as string;
    this.user_id = request.user?.id as string;
    this.product_id = request.body?.product_id as string;
    this.comment = request?.body?.comment as string;
    this.rating = request?.body?.rating as number;
  }

  public async getUserReviews(res: Response) {
    console.log(this.productID);
    if (!this.productID) {
      res.status(404).json([{ message: "Please provide the productID" }]);
      return;
    }

    const reviews = await reviewServices.getUserReviews(this.productID);

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      res.status(404).json([{ message: "The review data is not found" }]);
      return;
    }

    res.status(200).json(reviews);
    return;
  }

  public async submitReview(response: Response): Promise<void> {
    try {
      console.log(this.user_id, this.product_id, this.comment, this.rating);
      if (!this.user_id) {
        response.status(401).json([{ message: "Access denied" }]);
        return;
      }

      if (!this.product_id || !this.comment || !this.rating) {
        response
          .status(400)
          .json([{ message: "Please input required fields" }]);
        return;
      }

      const success: false | postgres.RowList<postgres.Row[]> =
        await reviewServices.submitReview(
          this.user_id,
          this.product_id,
          this.comment,
          this.rating
        );

      if (!success) {
        response
          .status(500)
          .json([{ message: "Server error, failed to submit your review" }]);
        return;
      }

      response.status(201).json({ message: "Review submitted successfully" });
      return;
    } catch (err) {
      console.log(err);
      response
        .status(500)
        .json([{ message: "Server error, failed to submit your review" }]);
      return;
    }
  }
}

export default ReviewController;
