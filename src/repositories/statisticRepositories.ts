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

  public async getMonthlyRevenue() {
    const query = await sql`
    SELECT
    SUM(o.amount) AS monthly_revenue,
    DATE_TRUNC('month', o.created_at) AS month
    FROM orders o
    WHERE o.delivery_status = TRUE
    GROUP BY month
    LIMIT 6;`;
    return query;
  }

  public async getMostPopularCategoryThisMonth() {
    const query = await sql`
    SELECT 
    SUM(oi.quantity) AS items_sold,
    p.category,
    RANK() OVER (ORDER BY SUM(oi.quantity) DESC) AS rank
    FROM ordered_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE DATE_TRUNC('month', oi.created_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY p.category
    ORDER BY items_sold DESC
    `;

    return query;
  }
}

export default new StatisticRepositories();
