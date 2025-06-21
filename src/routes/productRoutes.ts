import { Request, Response } from "express";
import ProductController from "../controllers/productController.js";
import express from "express";

// middleware
import verifyAdminToken from "../controllers/verifyToken.js";

import multer from "multer";
const upload = multer();
const productRouter = express.Router();

productRouter.get("/all-products", (request: Request, response: Response) => {
  const product = new ProductController(request);
  product.getAllProduct(response);
});

productRouter.get(
  "/product-by-category",
  (request: Request, response: Response) => {
    const product = new ProductController(request);
    product.getProductByCategory(response);
  }
);

productRouter.get("/best-deal", (request: Request, response: Response) => {
  const product = new ProductController(request);
  product.getBestDealProduct(response);
});

productRouter.post(
  "/upload-product",
  upload.single("file"),
  (request: Request, response: Response) => {
    const product = new ProductController(request);
    product.insertNewProduct(request, response);
  }
);

export default productRouter;
