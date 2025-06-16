import sql from "../config/database.js";

class ProductRepositories {
  async getAllProduct() {
    const query = await sql`SELECT * FROM products`;
    return query;
  }

  async getProductByCategory(category: string) {
    // console.log(category);
    const query =
      await sql`SELECT * from products WHERE category = ${category}`;
    return query;
  }

  async getBestDeal() {
    const query = await sql`SELECT * FROM products ORDER BY sold DESC LIMIT 3`;
    return query;
  }

  async insertNewproduct({
    name,
    sku,
    price,
    detail,
    image,
    category,
  }: {
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
  }) {
    if (!name || !sku || !price || !detail || !image || !category) {
      return "Please input required fields";
    }
    const query = await sql`INSERT INTO products 
    (name, sku, price, detail, image, category)
     values (${name}, ${sku}, ${price}, ${detail},${image},${category})`;

    console.log(query);
  }
}

export default new ProductRepositories();
