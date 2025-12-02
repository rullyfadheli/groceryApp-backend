import productRepositories from "../repositories/productRepositories.js";
import searchRepositories from "../repositories/search.repositories.js";

// Types
import type { ProductData } from "../types/productType.js";
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

  public async getSimilarProduct(
    category: string,
    productID: string
  ): Promise<boolean | postgres.RowList<postgres.Row[]>> {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getSimilarProduct(category, productID);
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
    stock: number;
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

  public async getProductBySerial(
    serial: number
  ): Promise<postgres.RowList<postgres.Row[]> | false> {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getProductBySerial(serial);
      return product;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getInitialProducts(): Promise<
    postgres.RowList<postgres.Row[]> | false
  > {
    try {
      const product: postgres.RowList<postgres.Row[]> =
        await productRepositories.getInitialProduct();
      return product;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async createProduct(productData: {
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
    stock: number;
  }): Promise<boolean | postgres.RowList<postgres.Row[]>> {
    if (productData.price <= 0) {
      throw new Error("Price must be positive");
    }

    // 1. Insert into Postgre
    const newProduct = await this.insertNewProduct(productData);

    // 2. Index into OpenSearch
    try {
      // if (newProduct) {
      //   await searchRepositories.indexProduct(
      //     newProduct as unknown as ProductData
      //   );
      // }

      if (newProduct) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Failed to index product in OpenSearch:", error);
      return false;
    }
  }

  async updateProductInfo(productData: {
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
    stock: number;
  }): Promise<boolean | postgres.RowList<postgres.Row[]>> {
    if (productData.price <= 0) {
      throw new Error("Price must be positive");
    }

    // 1. Insert into Postgre
    const newProduct: boolean | postgres.RowList<postgres.Row[]> =
      await this.insertNewProduct(productData);

    // 2. Index into OpenSearch
    try {
      // if (newProduct) {
      //   await searchRepositories.indexProduct(
      //     newProduct as unknown as ProductData
      //   );
      // }

      if (newProduct) {
        return newProduct;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Failed to index product in OpenSearch:", error);
      return false;
    }
  }

  async deleteProductById(id: string): Promise<string | false> {
    // 1. Remove from postgre
    const deletedId: string = await productRepositories.deleteProduct(id); // return the product_id

    // 2. remove from OpenSearch
    if (deletedId) {
      try {
        // await searchRepositories.deleteProduct(id);
        return deletedId;
      } catch (error) {
        console.error("Failed to delete product from OpenSearch:", error);
        return false;
      }
    }
    return deletedId;
  }
}

export default new ProductServices();
