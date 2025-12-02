import StatisticController from "../controllers/statisticController.js";
import verifyToken from "../controllers/verifyToken.js";

import express, { Response, Request } from "express";

const statisticRouter = express.Router();

statisticRouter.get(
  "/most-popular-products",
  verifyToken.verifyAdmin,
  (req: Request, res: Response) => {
    new StatisticController(req).getMostPopularProduct(res);
  }
);

statisticRouter.get(
  "/monthly-revenue",
  verifyToken.verifyAdmin,
  (req: Request, res: Response) => {
    new StatisticController(req).getMonthlyRevenue(res);
  }
);

statisticRouter.get(
  "/popular-category",
  verifyToken.verifyAdmin,
  (req: Request, res: Response) => {
    new StatisticController(req).getMostPopularCategory(res);
  }
);

export default statisticRouter;
