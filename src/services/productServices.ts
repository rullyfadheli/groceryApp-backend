import productRepositories from "../repositories/productRepositories.js";
import type postgres from "postgres";

class ProductServices {
  public async getAllProduct() {
    const products = await productRepositories.getAllProduct();
    // console.log(products);
    return products;
  }

  public async getProductByCategory(
    category: string
  ): Promise<boolean | postgres.RowList<postgres.Row[]>> {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getProductByCategory(category);
      return product;
    } catch (err) {
      return false;
    }
  }

  public async getProductBestDeal(): Promise<
    boolean | postgres.RowList<postgres.Row[]>
  > {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getBestDeal();
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
      console.log(err);
      return false;
    }
  }

  public async getPopularProducts(): Promise<
    boolean | postgres.RowList<postgres.Row[]>
  > {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getPopularProducts();
      return product;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getProductByDate(
    date: string
  ): Promise<postgres.RowList<postgres.Row[]> | false> {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getProductByDate(date);
      return product;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async get10Products(): Promise<
    postgres.RowList<postgres.Row[]> | false
  > {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.get10Product();
      return product;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new ProductServices();
