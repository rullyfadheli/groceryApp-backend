import express, { Request, Response } from "express";

import AddressController from "../controllers/addressController.js";
import verifyToken from "../controllers/verifyToken.js";

const addressRouter = express.Router();

addressRouter.get(
  "/address",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    new AddressController(req).getAddressByUserId(req, res);
  }
);

addressRouter.post(
  "/add-address",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    new AddressController(req).addNewAddress(res);
  }
);

export default addressRouter;
