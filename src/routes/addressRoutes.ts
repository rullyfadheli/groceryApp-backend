import express, { Request, Response } from "express";

import AddressController from "../controllers/addressController.js";
import verifyToken from "../controllers/verifyToken.js";

const addressRouter = express.Router();

addressRouter.get(
  "/address",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    AddressController.instance.getAddressByUserId(req, res);
  }
);

export default addressRouter;
