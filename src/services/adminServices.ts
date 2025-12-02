import AdminRepositories from "../repositories/adminRepositories.js";
import postgres from "postgres";

class AdminServices {
  public static async getAdminData(
    email: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const response: postgres.RowList<postgres.Row[]> =
        await AdminRepositories.getAdminDataByEmail(email);
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async insertNewAdmin(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      await AdminRepositories.insertNewAdmin(name, email, password);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async updateRefreshToken(
    admin_id: string,
    refresh_token: string
  ): Promise<boolean> {
    try {
      await AdminRepositories.updateRefreshToken(admin_id, refresh_token);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default AdminServices;
