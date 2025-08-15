import express, { Request, Response } from "express";

import ReviewController from "../controllers/reviewController.js";
const reviewRouter = express.Router();

reviewRouter.get("/reviews", (req: Request, res: Response) => {
  const reviews = new ReviewController(req);
  reviews.getUserReviews(res);
});

export default reviewRouter;
