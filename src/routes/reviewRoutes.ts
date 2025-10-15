import express, { Request, Response } from "express";
import verifyToken from "../controllers/verifyToken.js";
import ReviewController from "../controllers/reviewController.js";
const reviewRouter = express.Router();

reviewRouter.get("/reviews", (req: Request, res: Response) => {
  const reviews = new ReviewController(req);
  reviews.getUserReviews(res);
});

reviewRouter.post(
  "/submit-review",
  verifyToken.verifyUser,
  (request: Request, response: Response) => {
    new ReviewController(request).submitReview(response);
  }
);

export default reviewRouter;
