import statisticRepositories from "../repositories/statisticRepositories";
import { RowList, Row } from "postgres";

class StatisticServices {
  public async getMostPopularProductInLast5Months(): Promise<
    false | RowList<Row[]>
  > {
    try {
      const success =
        await statisticRepositories.getMostPopularProductInLast5Months();

      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new StatisticServices();
