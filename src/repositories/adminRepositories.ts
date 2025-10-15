import sql from "../config/database.js";

class AdminRepositories {
  public static async getAdminDataByEmail(email: string) {
    const query = await sql`SELECT * FROM admins WHERE email = ${email}`;
    return query;
  }

  public static async insertNewAdmin(
    name: string,
    email: string,
    password: string
  ) {
    const query =
      await sql`INSERT INTO admins (name, email, password) VALUES (${name}, ${email}, ${password}) RETURNING *`;

    return query;
  }
}

export default AdminRepositories;
