import sql from "../config/database.js";

class UserRepositories {
  async register({
    name,
    password,
    email,
    refresh_token,
    mobile,
  }: {
    name: string;
    password: string;
    refresh_token: string;
    email: string;
    mobile: number;
  }) {
    const query = await sql`INSERT INTO user 
    (name, password, email, refresh_token, mobile) 
    values (${name}, ${password},${email},${refresh_token},${mobile})
    `;

    console.log(query);
  }
}

export default new UserRepositories();
