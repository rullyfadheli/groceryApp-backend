import { Request, Response } from "express";
import productServices from "../services/productServices.js";

//type
import { type Product } from "../type/productType.js";
import UploadImage from "./imageUpload.js";
class ProductControllers {
  public async getAllProduct(
    request: Request,
    response: Response
  ): Promise<void | Product> {
    const product = await productServices.getAllProduct();

    if (!product || product.length === 0) {
      response
        .status(400)
        .send(JSON.stringify([{ message: "Failed to fetch data from DB" }]));
      return;
    }
    response.status(200).json(product);
    return;
  }

  public async getProductByCategory(
    request: Request,
    response: Response
  ): Promise<void | Product> {
    const category: number = Number(request.query.params);
    // console.log(category);

    if (!category) {
      response
        .status(400)
        .send(JSON.stringify([{ message: "Please provide the category" }]));
      return;
    }

    let parsedCategory: string = "";
    switch (category) {
      case 1:
        parsedCategory = "vegetables & Fruits";
        break;
      case 2:
        parsedCategory = "Dairy & Breakfast";
        break;
      case 3:
        parsedCategory = "Cold Drinks & Juices";
        break;
      case 4:
        parsedCategory = "Instant & Frozen Food";
        break;
      case 5:
        parsedCategory = "Tea & Coffee";
        break;
      case 6:
        parsedCategory = "Rice";
        break;
      case 7:
        parsedCategory = "Oil";
        break;
      case 8:
        parsedCategory = "Chicken, Meat & Fish";
        break;
      default:
        response.status(400).json({
          message: "Invalid category code",
        });
    }

    // console.log(parsedCategory);
    const product = await productServices.getProductByCategory(parsedCategory);

    if (!product || product.length === 0) {
      response
        .status(400)
        .json([{ message: "Failed to fetch the data from DB" }]);
      return;
    }

    response.status(200).json(product);
    return;
  }

  public async getBestDealProduct(
    request: Request,
    response: Response
  ): Promise<void | Product> {
    const result = await productServices.getProductBestDeal();

    if (!result || result.length === 0) {
      response.status(401).json([{ message: "Failed to fetch data from DB" }]);
      return;
    }

    response.status(200).json(result);
    return;
  }

  public async insertNewProduct(
    request: Request,
    response: Response
  ): Promise<void> {
    type ProductData = {
      name: string;
      sku: string;
      price: number;
      detail: string;
      image: string;
      category: number;
    };

    const { name, sku, price, detail, category }: ProductData = request.body;

    const file = request?.file;

    if (!name || !sku || !price || !detail || !file || !category || !file) {
      response.status(400).json([{ message: "Please fill required fields" }]);
      return;
    }

    const categoryCode = Number(category);

    let parsedCategory: string = "";
    switch (categoryCode) {
      case 1:
        parsedCategory = "vegetables & Fruits";
        break;
      case 2:
        parsedCategory = "Dairy & Breakfast";
        break;
      case 3:
        parsedCategory = "Cold Drinks & Juices";
        break;
      case 4:
        parsedCategory = "Instant & Frozen Food";
        break;
      case 5:
        parsedCategory = "Tea & Coffee";
        break;
      case 6:
        parsedCategory = "Rice";
        break;
      case 7:
        parsedCategory = "Oil";
        break;
      case 8:
        parsedCategory = "Chicken, Meat & Fish";
        break;
      default:
        response.status(400).json({
          message: "Invalid category code",
        });
        return;
    }

    const uploader = new UploadImage(
      file.buffer as Buffer,
      file.originalname as string
    );

    const result = await uploader.uploadImage();

    if (!result) {
      response.status(400).json({
        message: "Failed to upload image",
      });
      return;
    }

    const imageUrl = result;

    productServices.insertNewProduct({
      name,
      sku,
      price,
      detail,
      image: imageUrl,
      category: parsedCategory,
    });

    response.status(200).json({ message: "Upload success" });
    return;
  }
}

export default new ProductControllers();
