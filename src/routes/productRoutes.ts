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
    product.getProductByCategory(request, response);
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

productRouter.get("/product-by-id", (request: Request, response: Response) => {
  const product = new ProductController(request);
  product.getProductById(response);
});

productRouter.get(
  "/popular-products",
  (request: Request, response: Response) => {
    const product = new ProductController(request);
    product.getPoularProducts(response);
  }
);

productRouter.get("/initial-products", (req: Request, res: Response) => {
  new ProductController(req).get10products(res);
});

export default productRouter;
