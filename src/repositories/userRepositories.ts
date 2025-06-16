import sql from "../config/database.js";

class UserRepositories {
  async register({
    username,
    password,
    email,
    refresh_token,
    mobile,
  }: {
    username: string;
    password: string;
    refresh_token: string;
    email: string;
    mobile: number;
  }) {
    const query = await sql`INSERT INTO users
    (username, password, email, refresh_token, mobile) 
    values (${username}, ${password},${email},${refresh_token},${mobile})
    `;

    console.log(query);
  }

  async getUserByEmail(email: string) {
    const query = await sql`SELECT email FROM users WHERE email = ${email} `;
    return query;
  }
}

export default new UserRepositories();
