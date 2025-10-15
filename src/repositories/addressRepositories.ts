import sql from "../config/database.js";

class AddressRepositories {
  public static instance = new AddressRepositories();
  public async getAddressByUserId(id: string) {
    const query = await sql`SELECT * FROM address WHERE user_id = ${id}`;
    return query;
  }

  public async addNewAddress(
    user_id: string,
    address: string,
    label: string,
    lat: number,
    lng: number
  ) {
    const query =
      await sql`INSERT INTO address (user_id, address, label, lat, lng) values (${user_id}, ${address}, ${label}, ${lat}, ${lng})`;
    return query;
  }

  async removeAddressByUserId(user_id: string, address_id: string) {
    const query = await sql`
    DELETE
    FROM address
    WHERE user_id = ${user_id} AND id = ${address_id}
    returning *`;

    return query;
  }
}

export default AddressRepositories;
