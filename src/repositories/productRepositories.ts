import sql from "../config/database.js";

class ProductRepositories {
  public async getAllProduct() {
    const query = await sql`SELECT 
    p.*,
    d.discount_percentage
    FROM products p
    LEFT JOIN discount d ON p.id = d.product_id`;
    return query;
  }

  public async getProductByCategory(category: string) {
    // console.log(category);
    const query = await sql`
    SELECT 
    p.*,
    d.discount_percentage
     from products p
    LEFT JOIN discount d ON p.id = d.product_id 
    WHERE category = ${category}`;
    return query;
  }

  public async getSimilarProduct(category: string, productID: string) {
    // console.log(category);
    const query = await sql`
    SELECT 
    p.*,
    d.discount_percentage
     from products p
    LEFT JOIN discount d ON p.id = d.product_id 
    WHERE category = ${category} AND p.id != ${productID} LIMIT 10`;
    return query;
  }

  public async getBestDeal() {
    const query = await sql`
    SELECT p.*,
    d.discount_percentage 
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
    stock,
  }: {
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
    stock: number;
  }) {
    if (!name || !sku || !price || !detail || !image || !category) {
      return "Please input required fields";
    }
    const query = await sql`INSERT INTO products 
    (name, sku, price, detail, image, category, stock)
     values (${name}, ${sku}, ${price}, ${detail},${image},${category}, ${stock})`;

    console.log(query);
  }

  async updateProductInfo({
    id,
    name,
    sku,
    price,
    detail,
    image,
    category,
    stock,
  }: {
    id: string;
    name: string;
    sku: string;
    price: number;
    detail: string;
    image: string;
    category: string;
    stock: number;
  }) {
    const query = await sql`
      UPDATE products 
      (name, sku, price, detail, image, category, stock) 
      VALUES (${name}, ${sku}, ${price}, ${detail}, ${image}, ${category}, ${stock}) 
      WHERE id = ${id} RETURNING *`;
    return query;
  }

  public async getProductById(product_id: string) {
    console.log(product_id);
    const query = await sql`
    SELECT
    p.*,
    d.discount_percentage,
    r.comment,
    r.rating 
    FROM products p 
    LEFT JOIN discount d ON p.id = d.product_id
    LEFT JOIN  user_reviews r ON p.id = r.product_id
    WHERE p.id = ${product_id}
  `;
    return query;
  }

  public async getPopularProducts() {
    const query = await sql`
    SELECT 
      p.id AS product_id,
      p.name,
      p.price,
      p.detail,
      p.image,
      p.category,
      p.stock,
      p.sold,
      d.discount_percentage 
    FROM products p 
    LEFT JOIN discount d ON p.id = d.product_id
      ORDER BY sold DESC LIMIT 5`;
    return query;
  }

  public async getInitialProduct() {
    const query = await sql`
    SELECT
      p.id, 
      p.*,
      d.discount_percentage 
    FROM products p 
    LEFT JOIN discount d ON p.id = d.product_id
    ORDER BY p.serial_id ASC 
    LIMIT 15
  `;
    return query;
  }

  public async getProductBySerial(serial: number) {
    const query = await sql`
    SELECT 
    p.*,
    d.discount_percentage,
    d.product_id
    FROM products p
    LEFT JOIN discount d ON p.id = d.product_id
    WHERE (p.serial_id > ${serial})
    ORDER BY p.serial_id ASC
  `;
    return query;
  }

  public async deleteProduct(product_id: string): Promise<string> {
    const query = await sql`
    DELETE FROM products WHERE id = ${product_id}`;
    return query[0].id;
  }
}

export default new ProductRepositories();
