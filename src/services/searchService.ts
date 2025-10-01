import searchRepositories from "../repositories/search.repositories.js";

class SearchService {
  async searchProducts(
    query: string
  ): Promise<(Record<string, any> | undefined)[]> {
    if (!query || query.trim() === "") {
      return []; // Return an empty array if the query was undefined
    }

    const data = await searchRepositories.search(query);
    return data;
  }
}

export default new SearchService();
