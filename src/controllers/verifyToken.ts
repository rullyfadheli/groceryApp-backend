import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

class VerifyToken {
  public verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
      }

      const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

      jwt.verify(
        token,
        ACCESS_TOKEN_SECRET,
        (
          err: jwt.VerifyErrors | null,
          decoded: string | jwt.JwtPayload | undefined
        ) => {
          if (err) {
            res.status(403).json({ message: "Access denied" });
            return;
          }
          // console.log(decoded);
          req.user = decoded;
          next();
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }

  public async verifyAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admin_token = req.headers.authorization as string;

      if (!admin_token) {
        res.status(401).json([{ message: "Access denied" }]);
        return;
      }

      const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

      if (!ACCESS_TOKEN_SECRET) {
        res.status(400).json([{ message: "Server misconfiguration" }]);
        return;
      }

      const decoded_token = jwt.verify(admin_token, ACCESS_TOKEN_SECRET);

      const { role } = decoded_token as { role: string };

      if (role !== "admin") {
        res.status(401).json([{ message: "Access denied" }]);
        return;
      }

      next();
    } catch (err) {
      res.status(401).json([{ message: "Access denied" }]);
      return;
    }
  }
}

export default new VerifyToken();

// router.get("/protected-route", verifyToken, yourController);
