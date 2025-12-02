import statisticRepositories from "../repositories/statisticRepositories.js";
import { RowList, Row } from "postgres";

class StatisticServices {
  public async getMonthlySales(): Promise<false | RowList<Row[]>> {
    try {
      const success = await statisticRepositories.getAllMonthlyProductSales();

      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getMonthlyRevenue(): Promise<false | RowList<Row[]>> {
    try {
      const success = await statisticRepositories.getMonthlyRevenue();
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getMostPopularProductThisMonth(): Promise<RowList<
    Row[]
  > | null> {
    try {
      const data: RowList<Row[]> =
        await statisticRepositories.getMostPopularCategoryThisMonth();
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

export default new StatisticServices();
