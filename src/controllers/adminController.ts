import AdminServices from "../services/adminServices.ts";
import postgres from "postgres";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import { Request, Response } from "express";

class AdminController {
  private email?: string;
  private password?: string;
  private username?: string;
  private refresh_token?: string;

  constructor(request: Request) {
    this.email = request.body?.email as string;
    this.username = request.body?.username;
    this.password = request.body?.password as string;
    this.refresh_token = request.cookies?.refresh_token as string;
  }

  public async registerAdmin(response: Response) {
    if (!this.email || !this.username || !this.password) {
      response
        .status(400)
        .json([{ message: "Please input the required fields" }]);
      return;
    }

    try {
      console.log(this.username);
      const salt: string = await bcrypt.genSalt(10);

      const hashedPassword: string = await bcrypt.hash(this.password, salt);

      const success: boolean = await AdminServices.insertNewAdmin(
        this.username,
        this.email,
        hashedPassword
      );

      if (!success) {
        response
          .status(500)
          .json([{ message: "Failed to register new admin" }]);
        return;
      }

      response.status(200).json([{ message: "Login success" }]);
      return;
    } catch (error) {
      console.log(error);
      response.status(500).json([{ message: "Failed to register new admin" }]);
      return;
    }
  }

  public async login(response: Response) {
    if (!this.email || !this.password) {
      response
        .status(400)
        .json([{ message: "Please input the required fields" }]);
      return;
    }

    try {
      const userData: false | postgres.RowList<postgres.Row[]> =
        await AdminServices.getAdminData(this.email);

      if (!userData) {
        response.status(404).json([{ message: "Admin data is not found" }]);
        return;
      }
      const hashedPassword = userData[0].password as string;

      const verifyPassword: boolean = await bcrypt.compare(
        this.password,
        hashedPassword
      );

      if (!verifyPassword) {
        response.status(403).json([{ message: "Invalid password" }]);
        return;
      }

      interface UserCredentials {
        id: string;
        name: string;
        email: string;
        role: string;
      }

      const userCredentials: UserCredentials = {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
        role: userData[0].role,
      };

      // console.log(userCredentials);

      const ADMIN_ACCESS_TOKEN_SECRET = process.env
        .ADMIN_ACCESS_TOKEN_SECRET as string;

      const access_token: string = jwt.sign(
        userCredentials,
        ADMIN_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      const ADMIN_REFRESH_TOKEN_SECRET = process.env
        .ADMIN_REFRESH_TOKEN_SECRET as string;

      const refresh_token: string = jwt.sign(
        userCredentials,
        ADMIN_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "2D",
        }
      );

      const updateRefreshToken: boolean =
        await AdminServices.updateRefreshToken(
          userData[0].id,
          ADMIN_REFRESH_TOKEN_SECRET
        );

      if (!updateRefreshToken) {
        response
          .status(500)
          .json([{ message: "Failed to update login credentials" }]);
        return;
      }

      response.cookie("refresh_token", refresh_token, {
        maxAge: 1000 * 60 * 60 * 2,
        path: "/",
        httpOnly: true,
      });

      response.status(200).json([{ access_token }]);
      return;
    } catch (error) {
      console.log(error);
      response.status(500).json([{ message: "Failed to login" }]);
      return;
    }
  }

  public async generateAdminToken(response: Response): Promise<void> {
    try {
      console.log("cookie" + this.refresh_token);

      if (!this.refresh_token) {
        // console.log(this.refresh_token);
        response
          .status(401)
          .json([{ message: "Session expired, please login" }]);
        return;
      }

      const ADMIN_REFRESH_TOKEN_SECRET = process.env
        .ADMIN_REFRESH_TOKEN_SECRET as string;
      const ADMIN_ACCESS_TOKEN_SECRET = process.env
        .ADMIN_ACCESS_TOKEN_SECRET as string;

      if (!ADMIN_REFRESH_TOKEN_SECRET) {
        response.status(400).json([{ message: "Server misconfiguration" }]);
        return;
      }

      interface TokenPayload extends jwt.JwtPayload {
        id: string;
        name: string;
        email: string;
        role: string;
      }

      const decoded_refresh_token = jwt.verify(
        this.refresh_token,
        ADMIN_REFRESH_TOKEN_SECRET
      ) as TokenPayload;

      console.log(decoded_refresh_token);

      if (!decoded_refresh_token) {
        response.status(401).json([{ message: "Invalid token" }]);
        return;
      }

      const { id, name, email, role } = decoded_refresh_token;

      if (!id || !name || !email || !role) {
        response.redirect("http://localhost:3000/login");
        return;
      }
      const verifyAdmin: Promise<false | postgres.RowList<postgres.Row[]>> =
        AdminServices.getAdminData(email);

      if (!verifyAdmin) {
        response
          .status(401)
          .json([{ message: "Session expired, please login" }]);
        return;
      }

      const newAccessToken: string = jwt.sign(
        { id, name, email, role },
        ADMIN_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      // console.log("access_token" + newAccessToken);

      response.status(200).json([{ access_token: newAccessToken }]);
      return;
    } catch (error) {
      console.log(error);
      response.redirect("localhost:3000/login");
    }
  }
}

export default AdminController;
