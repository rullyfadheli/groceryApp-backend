import { Request, Response } from "express";

import postgres from "postgres";
import AddressServices from "../services/addressServices.js";

class AddressController {
  public static instance = new AddressController();

  public async getAddressByUserId(
    req: Request,
    res: Response
  ): Promise<Response> {
    const id: string = req.user.id;

    if (!id) {
      return res.status(401).json({ message: "User ID is required." });
    }

    try {
      const address: boolean | postgres.RowList<postgres.Row[]> =
        await AddressServices.instance.getAddressByUserId(id);
      if (address) {
        return res.status(200).json(address);
      } else {
        return res
          .status(404)
          .json({ message: "No address found for this user." });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
}

export default AddressController;
