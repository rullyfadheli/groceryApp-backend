import AddressRepositories from "../repositories/addressRepositories.js";
import postgres from "postgres";
class AddressServices {
  public static instance = new AddressServices();

  public async getAddressByUserId(
    id: string
  ): Promise<postgres.RowList<postgres.Row[]> | boolean> {
    try {
      const query: postgres.RowList<postgres.Row[]> =
        await AddressRepositories.instance.getAddressByUserId(id);
      return query;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default AddressServices;
