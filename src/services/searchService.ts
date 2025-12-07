import searchRepositories from "../repositories/search.repositories.js";
import postgres from "postgres";

class SearchService {
  async searchProducts(
    query: string
  ): Promise<postgres.RowList<postgres.Row[]> | []> {
    if (!query || query.trim() === "") {
      return []; // Return an empty array if the query was undefined
    }

    const data = await searchRepositories.search(query);
    return data;
  }
}

export default new SearchService();
