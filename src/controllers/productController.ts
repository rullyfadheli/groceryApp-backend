import { Request, Response } from "express";
import productServices from "../services/productServices.js";
import reviewServices from "../services/reviewServices.js";
import searchService from "../services/searchService.js";

// Test
import sync from "../models/sync.js";

import type postgres from "postgres";

//type
import { type Product } from "../types/productType.js";
import UploadImage from "./imageUpload.js";
class ProductControllers {
  public getCategory?: number | string;
  private productID?: string;
  private serial?: string;
  private keyword?: string;

  constructor(request: Request) {
    this.getCategory = Number(request.query.category) as number;
    this.productID = request.query?.productID as string;
    this.serial = request.query?.serial as string;
    this.keyword = request.query?.keyword as string;
  }

  public async getAllProduct(response: Response): Promise<void | Product> {
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
    const stringCategory: string = request.query.category as string;
    const numberCategory = this.getCategory;

    if (!numberCategory && !stringCategory) {
      response
        .status(400)
        .send(JSON.stringify([{ message: "Please provide the category" }]));
      return;
    }

    try {
      let parsedCategory: string = "";

      if (numberCategory) {
        switch (numberCategory) {
          case 1:
            parsedCategory = "Vegetables & Fruits";
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
            parsedCategory = "Atta, Rice & Dal";
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
      }

      // parsedCategory = stringCategory as string;

      // console.log(parsedCategory);
      const product = await productServices.getProductByCategory(
        parsedCategory
      );
      console.log(product);

      if (!product || !Array.isArray(product) || product.length === 0) {
        response
          .status(400)
          .json([{ message: "Failed to fetch the data from DB" }]);
        return;
      }

      const responseData = product.map((items) => ({
        ...items,
        final_price:
          items.price - (items.price * items.discount_percentage) / 100,
      }));

      response.status(200).json(responseData);
      return;
    } catch (err) {
      console.log(err);
      response.status(500).json([{ message: "Failed to fetch data from DB" }]);
      return;
    }
  }

  public async getSimilarProduct(
    request: Request,
    response: Response
  ): Promise<void | Product> {
    const category: string = request.query.category as string;
    const productID: string = request.query.productID as string;
    if (!category) {
      response
        .status(400)
        .send(JSON.stringify([{ message: "Please provide the category" }]));
      return;
    }

    try {
      // parsedCategory = stringCategory as string;

      // console.log(parsedCategory);
      const product: boolean | postgres.RowList<postgres.Row[]> =
        await productServices.getSimilarProduct(category, productID);
      // console.log(product);

      if (!product || !Array.isArray(product) || product.length === 0) {
        response
          .status(400)
          .json([{ message: "Failed to fetch the data from DB" }]);
        return;
      }

      const responseData = product.map((items) => ({
        ...items,
        final_price:
          items.price - (items.price * items.discount_percentage) / 100,
      }));

      response.status(200).json(responseData);
      return;
    } catch (err) {
      console.log(err);
      response.status(500).json([{ message: "Failed to fetch data from DB" }]);
      return;
    }
  }

  public async getBestDealProduct(response: Response): Promise<void | Product> {
    const result = await productServices.getProductBestDeal();

    if (!result || !Array.isArray(result) || result.length === 0) {
      response.status(401).json([{ message: "Failed to fetch data from DB" }]);
      return;
    }

    const updatedResult = result.map((value, index) => {
      const discount = value.discount_percentage;
      const price = value.price;

      const updatePrice = value.price - (price * discount) / 100;
      const discount_price = { ...value, final_price: updatePrice };
      return discount_price;
    });

    console.log(updatedResult);
    response.status(200).json(updatedResult);
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
      stock: number;
    };

    const { name, sku, price, detail, category, stock }: ProductData =
      request.body;

    const file: Express.Multer.File | undefined = request?.file;

    if (!name || !sku || !price || !detail || !file || !category || !stock) {
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
    uploader.cleanup();

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
      stock,
    });

    response.status(200).json({ message: "Upload success" });
    return;
  }

  public async editProduct(
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
      stock: number;
    };

    const { name, sku, price, detail, category, stock }: ProductData =
      request.body;

    const file: Express.Multer.File | undefined = request?.file;

    if (!name || !sku || !price || !detail || !file || !category || !stock) {
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
    uploader.cleanup();

    if (!result) {
      response.status(400).json({
        message: "Failed to upload image",
      });
      return;
    }

    const imageUrl = result;

    productServices.updateProductInfo({
      name,
      sku,
      price,
      detail,
      image: imageUrl,
      category: parsedCategory,
      stock,
    });

    response.status(200).json({ message: "Update product success" });
    return;
  }

  public async getProductById(response: Response): Promise<void> {
    if (!this.productID) {
      response.status(404).json([{ message: "Product ID is not defined" }]);
      return;
    }

    console.log(this.productID);

    const result = await productServices.getProductById(
      this.productID as string
    );

    if (!result || !Array.isArray(result) || result.length === 0) {
      response.status(404).json([{ message: "Product not found" }]);
      return;
    }

    const price = result[0].price as number;
    const discount = result[0].discount_percentage as number;

    const final_price = price - (price * discount) / 100;

    // getting product review data
    let ratingSum: number = 0;

    const reviewData = await reviewServices.getUserReviews(
      result[0].id as string
    );

    if (!reviewData || !Array.isArray(reviewData)) {
      response.status(400).json([{ message: "Server error, try again later" }]);
      return;
    }

    reviewData.forEach((items) => {
      ratingSum += items.rating;
    });

    const reviewSum: number = reviewData.length;

    const rating: number = ratingSum / reviewSum;

    console.log(rating);

    const responseData = {
      ...result[0],
      final_price,
      review: reviewSum,
      rating: rating,
    };
    response.status(200).json([responseData]);
    return;
  }

  public async getPoularProducts(response: Response): Promise<void> {
    try {
      const result: boolean | postgres.RowList<postgres.Row[]> =
        await productServices.getPopularProducts();

      if (!result || !Array.isArray(result) || result.length === 0) {
        response
          .status(400)
          .json([{ message: "Failed to fetch data from DB" }]);
        return;
      }

      const updatedResult = result.map((value) => ({
        ...value,
        final_price:
          value.price - (value.price * value.discount_percentage) / 100,
      }));

      response.status(200).json(updatedResult);
      return;
    } catch (error) {
      console.log(error);
      response.status(400).json([{ message: "Failed to fetch data from DB" }]);
      return;
    }
  }

  public async getProductBySerial(response: Response): Promise<Response> {
    if (!this.serial) {
      return response
        .status(400)
        .json([{ message: "Product date was not provided" }]);
    }

    console.log(this.serial);

    const data: false | postgres.RowList<postgres.Row[]> =
      await productServices.getProductBySerial(Number(this.serial));

    if (!data) {
      return response
        .status(404)
        .json([{ message: "Oops.. Server error, no product found" }]);
    }

    console.log(data);

    const finalData = data.map((items) => {
      const discountvalue: number =
        (items.price * items.discount_percentage) / 100;

      return { ...items, final_price: items.price - discountvalue };
    });

    return response.status(200).json(finalData);
  }

  public async getInitialproducts(response: Response) {
    const data: false | postgres.RowList<postgres.Row[]> =
      await productServices.getInitialProducts();

    if (!data) {
      return response
        .status(404)
        .json([{ message: "Oops.. Server error, no product found" }]);
    }

    const finalData = data.map((items) => {
      const discountvalue: number =
        (items.price * items.discount_percentage) / 100;

      return { ...items, final_price: items.price - discountvalue };
    });

    return response.status(200).json(finalData);
  }

  public async search(res: Response): Promise<Response> {
    try {
      if (!this.keyword) {
        return res
          .status(400)
          .json([{ message: "Search keyword is not provided" }]);
      }
      const results: (Record<string, any> | undefined)[] =
        await searchService.searchProducts(this.keyword);

      if (!results || !Array.isArray(results) || results.length === 0) {
        return res.status(404).json([{ message: "Product is not found" }]);
      }

      return res.status(200).json(results);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Search failed" });
    }
  }

  public async sync(res: Response) {
    try {
      const result = sync();
      res.status(200).json(result);
      return;
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json([{ message: "Failed to sync data to OpenSearch" }]);
    }
  }
}

export default ProductControllers;
