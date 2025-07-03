import productRepositories from "../repositories/productRepositories.js";
import type postgres from "postgres";

class ProductServices {
  public async getAllProduct() {
    const products = await productRepositories.getAllProduct();
    // console.log(products);
    return products;
  }

  public async getProductByCategory(category: string) {
    try {
      const product = await productRepositories.getProductByCategory(category);
      return product;
    } catch (err) {
      return false;
    }
  }

  public async getProductBestDeal(): Promise<
    boolean | postgres.RowList<postgres.Row[]>
  > {
    try {
      const product = await productRepositories.getBestDeal();
      return product;
    } catch (err) {
      return false;
    }
  }

  public async insertNewProduct(productData: {
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
  }): Promise<boolean | postgres.RowList<postgres.Row[]>> {
    try {
      await productRepositories.insertNewproduct(productData);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async getProductById(
    product_id: string
  ): Promise<boolean | postgres.RowList<postgres.Row[]>> {
    try {
      const product = await productRepositories.getProductById(product_id);
      return product;
    } catch (err) {
      return false;
    }
  }
}

export default new ProductServices();
