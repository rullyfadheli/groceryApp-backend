import sql from "../config/database.js";

class ProductRepositories {
  public async getAllProduct() {
    const query = await sql`SELECT * FROM products`;
    return query;
  }

  public async getProductByCategory(category: string) {
    // console.log(category);
    const query =
      await sql`SELECT * from products WHERE category = ${category}`;
    return query;
  }

  public async getBestDeal() {
    const query = await sql`
    SELECT * 
    FROM products p 
    JOIN discount d ON d.product_id = p.id 
    ORDER BY discount_percentage DESC 
    LIMIT 10
  `;
    return query;
  }

  public async insertNewproduct({
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

  public async getProductById(product_id: string) {
    const query = await sql`SELECT * FROM products WHERE id = ${product_id}`;
    return query;
  }
}

export default new ProductRepositories();
