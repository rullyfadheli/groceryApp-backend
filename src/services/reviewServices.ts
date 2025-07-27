import reviewRepositories from "../repositories/reviewRepositories.js";
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
}

export default new ReviewServices();
