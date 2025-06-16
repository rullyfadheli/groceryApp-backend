import productRepositories from "../repositories/productRepositories.js";

class ProductServices {
  async getAllProduct() {
    const products = await productRepositories.getAllProduct();
    // console.log(products);
    return products;
  }

  async getProductByCategory(category: string) {
    const product = await productRepositories.getProductByCategory(category);
    return product;
  }

  async getProductBestDeal() {
    const product = await productRepositories.getBestDeal();
    return product;
  }

  async insertNewProduct(productData: {
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
  }) {
    await productRepositories.insertNewproduct(productData);
  }
}

export default new ProductServices();
