/**
 * This repository handles all communication with OpenSearch.
 */
// import osClient from "../config/opensearch-client";
import sql from "../config/database";

// Types
import type { ProductData } from "../types/productType";

const indexName = "products";

class SearchRepository {
  // async search(query: string): Promise<(Record<string, any> | undefined)[]> {
  //   const { body } = await osClient.search({
  //     index: indexName,
  //     body: {
  //       query: {
  //         multi_match: {
  //           query: query,
  //           fields: ["name", "description", "category"],
  //           fuzziness: "AUTO",
  //         },
  //       },
  //     },
  //   });

  //   const data: ProductData[] = body.hits.hits.map(
  //     (hit: { _source: ProductData }) => hit._source
  //   );
  //   return data;
  // }

  async search(query: string) {
    const result = await sql`
      SELECT * FROM products
      WHERE name ILIKE ${"%" + query + "%"}
      OR detail ILIKE ${"%" + query + "%"}
      OR category ILIKE ${"%" + query + "%"}
    `;
    return result;
  }

  // async indexProduct(product: ProductData) {
  //   return await osClient.index({
  //     index: indexName,
  //     id: product.id,
  //     body: product,
  //     refresh: true,
  //   });
  // }

  // async deleteProduct(productId: string) {
  //   return await osClient.delete({
  //     index: indexName,
  //     id: productId,
  //   });
  // }
}

export default new SearchRepository();
