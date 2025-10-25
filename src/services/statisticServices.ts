import statisticRepositories from "../repositories/statisticRepositories";
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
}

export default new StatisticServices();
