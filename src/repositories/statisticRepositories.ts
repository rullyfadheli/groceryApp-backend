import sql from "../config/database";

class StatisticRepositories {
  public async getMostPopularProductInLast5Months() {
    const query = await sql`
    SELECT
    COUNT(oi.id) AS total_orders,
    SUM (oi.quantity) AS total_quantity
    FROM ordered_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '4 months'
    AND oi.created_at < DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    GROUP BY p.category
    ORDER BY total_quantity 
    `;

    return query;
  }
}

export default new StatisticRepositories();
