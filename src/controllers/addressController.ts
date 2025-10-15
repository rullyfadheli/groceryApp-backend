import { Request, response, Response } from "express";

// Types
import { Address } from "../types/addressType.js";

import postgres from "postgres";
import AddressServices from "../services/addressServices.js";

class AddressController {
  private user_id?: string;
  private latitude?: number;
  private longtitude?: number;
  private label?: string;
  private address_id?: string;

  constructor(request: Request) {
    this.user_id = request.user.id;
    this.latitude = request.body?.lat;
    this.longtitude = request.body?.lng;
    this.label = request.body?.label;
    this.address_id = request.body?.address_id;
  }

  public async getAddressByUserId(
    req: Request,
    res: Response
  ): Promise<Response> {
    // const id: string = req.user.id;

    if (!this.user_id) {
      return res.status(401).json({ message: "User ID is required." });
    }

    try {
      const address: boolean | postgres.RowList<postgres.Row[]> =
        await AddressServices.instance.getAddressByUserId(this.user_id);

      // console.log(address)

      if (address && Array.isArray(address)) {
        const filteredAddress = address.map(({ user_id, ...items }) => {
          return items;
        });

        return res.status(200).json(filteredAddress as Address);
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

  public async addNewAddress(response: Response): Promise<Response> {
    console.log(this.latitude, this.longtitude, this.label);
    if (!this.latitude || !this.longtitude || !this.label) {
      return response
        .status(404)
        .json([{ message: "Missing lat, lng, or label in the request" }]);
    }

    if (!this.user_id) {
      return response.status(404).json([{ message: "Access denied" }]);
    }

    try {
      const mapResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${this.latitude}&lon=${this.longtitude}&format=json`,
        {
          headers: {
            "User-Agent": "FR Grocery App V1.0 (frgrocery1@gmail.com)", // required by Nominatim usage policy
          },
        }
      );

      const data = await mapResponse.json();

      if (data.error) {
        return response.status(400).json([{ message: "Invalid location" }]);
      }

      console.log(data);

      const sendToDB: boolean = await AddressServices.instance.addNewAddress(
        this.user_id,
        data.display_name as string,
        this.label,
        this.latitude,
        this.longtitude
      );

      if (!sendToDB) {
        return response
          .status(500)
          .json([{ message: "Internal server error" }]);
      }

      return response
        .status(201)
        .json([
          { message: "The address has successfully added to your account" },
        ]);
    } catch (error) {
      console.log(error);
      return response.status(500).json([{ message: "Internal server error" }]);
    }
  }

  public async removeAddressByUserId(response: Response): Promise<void> {
    try {
      // console.log(this.address_id);
      if (!this.user_id) {
        response
          .status(403)
          .json([{ message: "Invalid user data, please login" }]);
        return;
      }

      if (!this.address_id) {
        response.status(400).json([{ message: "No address_id provided" }]);
        return;
      }

      const dbResponse: false | postgres.RowList<postgres.Row[]> =
        await AddressServices.instance.deleteAddressByUserId(
          this.user_id,
          this.address_id
        );

      console.log(dbResponse);

      if (!dbResponse) {
        response
          .status(500)
          .json([
            { message: "Failed to delete the address, please try again later" },
          ]);
        return;
      }

      response
        .status(200)
        .json([{ message: "The address was deleted successfully" }]);
      return;
    } catch (error) {
      console.log(error);
      response
        .status(500)
        .json([{ message: "Server error, please try again later" }]);
      return;
    }
  }
}

export default AddressController;
