import { Request, Response } from "express";
import postgres from "postgres";
import statisticServices from "../services/statisticServices";

class StatisticController {
  private admin_id?: string;
  constructor(req: Request) {
    this.admin_id = req.user?.id;
  }

  public async getMostPopularProduct(res: Response) {
    try {
      console.log(this.admin_id);
      if (!this.admin_id) {
        res.status(401).json([{ message: "Access denied" }]);
        return;
      }

      const success: false | postgres.RowList<postgres.Row[]> =
        await statisticServices.getMonthlySales();

      if (!success) {
        res
          .status(500)
          .json([{ message: "Server error, failed to fetch the data" }]);
        return;
      }

      console.log(success);

      if (success.length === 0) {
        res.status(404).json([{ message: "Data was not found" }]);
        return;
      }

      res.status(200).json(success);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json([{ message: "Failed to fetch the data" }]);
      return;
    }
  }

  public async getMonthlyRevenue(res: Response): Promise<void> {
    try {
      if (!this.admin_id) {
        res.status(401).json([{ message: "Access denied" }]);
        return;
      }

      const success: false | postgres.RowList<postgres.Row[]> =
        await statisticServices.getMonthlyRevenue();

      if (!success) {
        res.status(500).json([
          {
            message: "Failed to fetch the data",
          },
        ]);
        return;
      }

      const formattedData = success.map((items) => {
        const date = new Date(items.month);
        const formatDate = date.toLocaleDateString("US", {
          month: "long",
          year: "numeric",
        });
        return { ...items, month: formatDate };
      });

      res.status(200).json(formattedData);
    } catch (err) {
      console.log(err);
      res.status(500).json([
        {
          message: "Failed to fetch the data",
        },
      ]);
    }
  }

  public async getMostPopularCategory(res: Response): Promise<Response> {
    if (!this.admin_id) {
      return res.status(403).json([{ message: "Access denied" }]);
    }

    try {
      const success: postgres.RowList<postgres.Row[]> | null =
        await statisticServices.getMostPopularProductThisMonth();

      if (!success) {
        return res.status(500).json([{ message: "Internal server error" }]);
      }

      return res.status(200).json(success);
    } catch (err) {
      console.log(err);
      return res.status(500).json([{ message: "Internal server error" }]);
    }
  }
}

export default StatisticController;
