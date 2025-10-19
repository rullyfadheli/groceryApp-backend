import sql from "../config/database.ts";

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

  public static async updateRefreshToken(
    admin_id: string,
    refresh_token: string
  ) {
    const query = await sql`
    UPDATE admins SET refresh_token = ${refresh_token}
    WHERE id = ${admin_id}
    `;
  }
}

export default AdminRepositories;
