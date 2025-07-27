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
}

export default new UserRepositories();
