import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

class VerifyToken {
  public verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      // console.log(token);

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
          req.user = decoded as JwtPayload;
          next();
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }

  public verifyChangePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
      }

      const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET as string;

      if (!RESET_PASSWORD_SECRET) {
        res.status(500).json({ message: "Internal server error" });
        return;
      }

      jwt.verify(
        token,
        RESET_PASSWORD_SECRET,
        (
          err: jwt.VerifyErrors | null,
          decoded: string | jwt.JwtPayload | undefined
        ) => {
          if (err) {
            res.status(403).json({ message: "Access denied" });
            return;
          }
          // console.log(decoded);
          req.user = decoded as JwtPayload;
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
      const client_token = req.headers.authorization as string;

      if (!client_token) {
        res.status(401).json([{ message: "Access denied" }]);
        return;
      }

      const admin_token = client_token.split(" ")[1];

      // console.log(admin_token);

      const ACCESS_TOKEN_SECRET = process.env
        .ADMIN_ACCESS_TOKEN_SECRET as string;

      if (!ACCESS_TOKEN_SECRET) {
        res.status(400).json([{ message: "Server misconfiguration" }]);
        return;
      }

      const decoded_token = jwt.verify(
        admin_token,
        ACCESS_TOKEN_SECRET
      ) as JwtPayload;

      if (!decoded_token) {
        res.status(401).json([{ message: "Access denied" }]);
        return;
      }

      const { role } = decoded_token as { role: string };
      console.log(role);

      const allowedRoles: string[] = ["admin", "super admin"];

      if (!allowedRoles.includes(role)) {
        res.status(401).json([{ message: "Access denied" }]);
      }

      req.user = decoded_token;

      next();
    } catch (err) {
      console.log(err);
      res.status(401).json([{ message: "Access denied" }]);
      return;
    }
  }
}

export default new VerifyToken();

// router.get("/protected-route", verifyToken, yourController);
