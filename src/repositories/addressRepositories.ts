import sql from "../config/database.js";

class AddressRepositories {
  public static instance = new AddressRepositories();
  public async getAddressByUserId(id: string) {
    const query = await sql`SELECT * FROM address WHERE user_id = ${id}`;
    return query;
  }
}

export default AddressRepositories;
