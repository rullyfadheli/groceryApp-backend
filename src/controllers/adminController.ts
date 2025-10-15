import AdminServices from "../services/adminServices.js";
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

  constructor(request: Request) {
    this.email = request.body?.email as string;
    this.username = request.body?.username;
    this.password = request.body?.password as string;
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

      response.status(200).json([{ message: "Register admin success" }]);
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
        username: string;
        email: string;
      }

      const userCredentials: UserCredentials = {
        id: userData[0].id,
        username: userData[0].username,
        email: userData[0].email,
      };

      const ADMIN_ACCESS_TOKEN_SECRET = process.env
        .ADMIN_ACCESS_TOKEN_SECRET as string;

      const access_token: string = jwt.sign(
        userCredentials,
        ADMIN_ACCESS_TOKEN_SECRET
      );

      const ADMIN_REFRESH_TOKEN_SECRET = process.env
        .ADMIN_REFRESH_TOKEN_SECRET as string;

      const refresh_token: string = jwt.sign(
        userCredentials,
        ADMIN_REFRESH_TOKEN_SECRET
      );

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
}

export default AdminController;
