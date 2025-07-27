import express, { Request, Response } from "express";

import reviewServices from "../services/reviewServices.js";

class ReviewController {
  private productID?: string;
  constructor(request: Request) {
    this.productID = request.query?.productID as string;
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
}

export default ReviewController;
