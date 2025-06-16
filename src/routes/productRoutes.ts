import { Request, Response } from "express";
import productController from "../controllers/productController.js";
import express from "express";

import multer from "multer";
const upload = multer();
const productRouter = express.Router();

productRouter.get("/all-products", (request: Request, response: Response) => {
  productController.getAllProduct(request, response);
});

productRouter.get(
  "/product-by-category",
  (request: Request, response: Response) => {
    productController.getProductByCategory(request, response);
  }
);

productRouter.get("/best-deal", (request: Request, response: Response) => {
  productController.getBestDealProduct(request, response);
});

productRouter.post(
  "/upload-product",
  upload.single("file"),
  (request: Request, response: Response) => {
    productController.insertNewProduct(request, response);
  }
);

export default productRouter;
