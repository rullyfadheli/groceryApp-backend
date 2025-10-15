import sql from "../config/database.js";

class UserRepositories {
  public async getUserReviews(product_id: string) {
    const query = await sql`
  SELECT 
    user_reviews.*, 
    users.username,
    users.profile_picture
  FROM 
    user_reviews
  JOIN 
    users ON user_reviews.user_id = users.id
  WHERE 
    user_reviews.product_id = ${product_id}
`;

    return query;
  }

  public async submitReview(
    user_id: string,
    product_id: string,
    comment: string,
    rating: number
  ) {
    const query = await sql`INSERT INTO user_reviews 
    (user_id, product_id, comment, rating) 
    VALUES (${user_id}, ${product_id}, ${comment}, ${rating})
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET comment = EXCLUDED.comment,
                  rating = EXCLUDED.rating,
                  created_at = NOW() 
    RETURNING *`;

    return query;
  }
}

export default new UserRepositories();
