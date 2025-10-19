import AdminController from "../controllers/adminController.js";
import express, { Request, Response } from "express";

const adminRouter = express.Router();

// adminRouter.get("/get-admin-profile", (req: Request, res: Response) => {
//   new AdminController(req).registerAdmin(res);
// });

adminRouter.post("/register-admin", (req: Request, res: Response) => {
  new AdminController(req).registerAdmin(res);
});

adminRouter.post("/login-admin", (req: Request, res: Response) => {
  new AdminController(req).login(res);
});

adminRouter.get("/admin-token", (req: Request, res: Response) => {
  new AdminController(req).generateAdminToken(res);
});

export default adminRouter;
