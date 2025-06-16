import { Request, Response } from "express";
import productController from "../controllers/productController.js";
import express from "express";

const router = express.Router();

router.get("/api/all-products", (request: Request, response: Response) => {
  productController.getAllProduct(request, response);
});
