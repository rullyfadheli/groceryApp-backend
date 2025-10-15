import AddressRepositories from "../repositories/addressRepositories.js";
import postgres from "postgres";
class AddressServices {
  public static instance = new AddressServices();

  public async getAddressByUserId(
    id: string
  ): Promise<postgres.RowList<postgres.Row[]> | false> {
    try {
      const query: postgres.RowList<postgres.Row[]> =
        await AddressRepositories.instance.getAddressByUserId(id);
      return query;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async addNewAddress(
    user_id: string,
    address: string,
    label: string,
    lat: number,
    lng: number
  ): Promise<boolean> {
    try {
      await AddressRepositories.instance.addNewAddress(
        user_id,
        address,
        label,
        lat,
        lng
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async deleteAddressByUserId(
    user_id: string,
    address_id: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const data: postgres.RowList<postgres.Row[]> =
        await AddressRepositories.instance.removeAddressByUserId(
          user_id,
          address_id
        );
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default AddressServices;
