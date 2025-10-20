import sql from "../config/database";

class StatisticRepositories {
  public async getAllMonthlyProductSales() {
    const query = await sql`
  SELECT
  oi.product_id,
  p.name AS product_name,
  SUM(oi.quantity) AS total_quantity_sold,
  RANK() OVER (ORDER BY SUM(oi.quantity) DESC) AS rank
  FROM ordered_items oi
  JOIN products p ON oi.product_id = p.id
  WHERE DATE_TRUNC('month', oi.created_at) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY oi.product_id, p.name
  ORDER BY total_quantity_sold DESC
  LIMIT 10;`;
    return query;
  }
}

export default new StatisticRepositories();
