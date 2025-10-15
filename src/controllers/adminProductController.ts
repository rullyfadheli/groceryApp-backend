import productServices from "../services/productServices.js";
import { Request, Response } from "express";

class AdminProductController {
  private name?: string;
  private sku?: string;
  private price?: number;
  private detail?: string;
  private image?: string;
  private category?: string;

  constructor(request: Request) {
    this.name = request.body?.name;
    this.sku = request.body?.sku;
    this.price = request.body?.price;
    this.detail = request.body?.detail;
    this.image = request.body?.image;
  }
}
