import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

class VerifyUserToken {
  public verifyToken(req: Request, res: Response, next: NextFunction) {
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
        (err: jwt.VerifyErrors | null, decoded: any) => {
          if (err) {
            res.status(403).json({ message: "Invalid token" });
            return;
          }

          req.body = decoded;
          next();
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
}
const verifyToken = new VerifyUserToken();
export default verifyToken.verifyToken.bind(verifyToken);

// router.get("/protected-route", verifyToken, yourController);
