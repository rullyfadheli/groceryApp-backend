import reviewRepositories from "../repositories/reviewRepositories.js";

import { RowList, Row } from "postgres";
class ReviewServices {
  public async getUserReviews(product_id: string) {
    try {
      const review = await reviewRepositories.getUserReviews(product_id);
      return review;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async submitReview(
    user_id: string,
    product_id: string,
    comment: string,
    rating: number
  ): Promise<RowList<Row[]> | false> {
    try {
      const review_response: RowList<Row[]> =
        await reviewRepositories.submitReview(
          user_id,
          product_id,
          comment,
          rating
        );
      return review_response;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new ReviewServices();
