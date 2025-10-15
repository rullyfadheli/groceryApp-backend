/**
 * This repository handles all communication with OpenSearch.
 */
import osClient from "../config/opensearch-client.js";

// Types
import type { ProductData } from "../types/productType.js";

const indexName = "products";

class SearchRepository {
  async search(query: string): Promise<(Record<string, any> | undefined)[]> {
    const { body } = await osClient.search({
      index: indexName,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ["name", "description", "category"],
            fuzziness: "AUTO",
          },
        },
      },
    });

    const data = body.hits.hits.map((hit) => hit._source);
    return data;
  }

  async indexProduct(product: ProductData) {
    return await osClient.index({
      index: indexName,
      id: product.id,
      body: product,
      refresh: true,
    });
  }

  async deleteProduct(productId: string) {
    return await osClient.delete({
      index: indexName,
      id: productId,
    });
  }
}

export default new SearchRepository();
