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
    (username, password, email, refresh_token, mobile) 
    values (${username}, ${password},${email},${mobile})
    `;
    console.log(query);
    return query;
  }

  public async getUserByEmail(email: string) {
    const query = await sql`SELECT * FROM users WHERE email = ${email} `;
    console.log(query);
    return query;
  }

  public async loginUser(refresh_token: string) {
    const query = await sql`users (refresh_token) values (${refresh_token})`;
    return query;
  }
}

export default new UserRepositories();
