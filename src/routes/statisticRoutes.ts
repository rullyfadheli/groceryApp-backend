import StatisticController from "../controllers/statisticController";
import verifyToken from "../controllers/verifyToken";

import express, { Response, Request } from "express";

const statisticRouter = express.Router();

statisticRouter.get(
  "/most-popular-products",
  verifyToken.verifyAdmin,
  (req: Request, res: Response) => {
    new StatisticController(req).getMostPopularProduct(res);
  }
);

export default statisticRouter;
