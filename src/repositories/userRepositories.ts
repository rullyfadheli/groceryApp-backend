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

  public async getUserByEmail(email: string) {
    const query = await sql`SELECT * FROM users WHERE email = ${email} `;
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
