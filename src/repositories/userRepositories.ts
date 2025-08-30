import { google } from "googleapis";
import sql from "../config/database.js";

class UserRepositories {
  public async register({
    username,
    password,
    email,
    mobile,
  }: {
    username: string;
    password: string;
    email: string;
    mobile: number;
  }) {
    const query = await sql`INSERT INTO users
    (username, password, email, mobile) 
    values (${username}, ${password},${email},${mobile})
    `;
    return query;
  }

  public async OAuthRegister({
    username,
    email,
    google_id,
    email_verified,
  }: {
    username: string;
    email: string;
    google_id: string;
    email_verified: boolean;
  }) {
    const query = await sql`
  INSERT INTO users (username, email, google_id, email_verified)
  VALUES (${username}, ${email}, ${google_id}, ${email_verified})
  ON CONFLICT (email)
  DO UPDATE SET 
    username = EXCLUDED.username,
    email_verified = EXCLUDED.email_verified,
    google_id = EXCLUDED.google_id
  RETURNING *;
  `;

    return query;
  }

  public async storeRefreshToken(
    user_id: string,
    token: string
  ): Promise<void> {
    await sql`
    UPDATE users
    SET refresh_token = ${token}
    WHERE id = ${user_id};
  `;
  }
  public async getUserByEmail(email: string) {
    const query = await sql`
      SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.profile_picture, 
      u.mobile, 
      u.created_at,
      addr.address 
      FROM users u 
      LEFT JOIN address addr 
      ON u.id = addr.user_id 
      WHERE email = ${email} `;
    return query;
  }

  public async loginUser(email: string, refresh_token: string) {
    const query =
      await sql`UPDATE users SET refresh_token = ${refresh_token} WHERE email = ${email}`;
    return query;
  }

  public async logoutUser(email: string) {
    const query =
      await sql`UPDATE users SET refresh_token = null WHERE email = ${email}`;
    return query;
  }

  public async getRefreshToken(token: string) {
    const query = await sql`SELECT * FROM users WHERE refresh_token = ${token}`;
    return query;
  }

  public async updateEmailverification(verify: boolean, email: string) {
    const query =
      await sql`UPDATE users SET email_verified = ${verify} WHERE email = ${email}`;
    return query;
  }
}

export default new UserRepositories();
