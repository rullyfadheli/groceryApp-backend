import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import userServices from "../services/userServices.js";
import SendMail from "./sendMail.js";

class UserController {
  private username?: string;
  private password?: string;
  private email?: string;
  private mobile?: number;
  private refresh_token?: string;
  private access_token?: string;

  constructor(request: Request) {
    this.username = request.body?.username;
    this.password = request.body?.password;
    this.email = request.body?.email;
    this.mobile = request.body?.mobile;
    this.refresh_token = request.cookies?.FRgrocery;
  }

  // Register
  public async register(response: Response): Promise<void> {
    if (!this.username || !this.password || !this.email || !this.mobile) {
      response.status(400).json([{ message: "Please fill required fields" }]);
      return;
    }

    const userDB = await userServices.getUserByEmail(this.email);

    if (!userDB) {
      response
        .status(400)
        .json([{ message: "Server error, failed to register" }]);
      return;
    }

    if (userDB[0]?.email === this.email) {
      response
        .status(201)
        .json([{ message: `User with email ${this.email} is already exist` }]);
      return;
    }

    try {
      const saltRounds: number = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(this.password, salt);

      const REGISTER_TOKEN_SECRET = process.env.REGISTER_TOKEN_SECRET as string;

      if (!REGISTER_TOKEN_SECRET) {
        response.status(400).json([{ message: "Server misconfiguration" }]);
        return;
      }

      if (!hashedPassword) {
        response.status(400).json([{ message: "Failed to hash password" }]);
        return;
      }
      const token = jwt.sign(
        {
          email: this.email,
          username: this.username,
          mobile: this.mobile,
        },
        REGISTER_TOKEN_SECRET,
        { expiresIn: "5m" }
      );

      const mailer = new SendMail(this.email, token);
      await mailer.sendMail();

      if (!mailer) {
        response
          .status(400)
          .json([{ message: "Server error, failed to register" }]);
        return;
      }

      const registerToDB = await userServices.register({
        username: this.username,
        password: hashedPassword,
        email: this.email,
        mobile: this.mobile,
      });

      if (!registerToDB) {
        response
          .status(400)
          .json([{ message: "Server error, failed to register" }]);
        return;
      }

      response.status(200).json([{ messasge: "Register success" }]);
      return;
    } catch (error) {
      console.error("Register Error:", error);
      response
        .status(400)
        .json([
          { message: "Server error, failed to register, try again later" },
        ]);
    }
    return;
  }

  // Login
  public async login(response: Response): Promise<void> {
    try {
      const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
      const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

      if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
        response.status(401).json([{ message: "Server misconfiguration" }]);
        return;
      }

      if (!this.email || !this.password) {
        response.status(400).json([
          {
            message: "Please fill the required fields",
          },
        ]);
        return;
      }

      const userData = await userServices.getUserByEmail(this.email as string);

      if (!userData || !userData[0]) {
        response
          .status(404)
          .json([{ message: "User not found, please register" }]);
        return;
      }

      const verifyPassword = await bcrypt.compare(
        this.password,
        userData[0].password
      );

      if (!verifyPassword) {
        response.status(401).json([{ message: "Invalid password" }]);
        return;
      }

      let access_token: string;
      let refresh_token: string;

      try {
        access_token = jwt.sign(
          {
            username: this.username,
            email: this.email,
            mobile: this.mobile,
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );

        refresh_token = jwt.sign(
          {
            username: this.username,
            email: this.email,
            mobile: this.mobile,
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "2d" }
        );
      } catch (jwtError) {
        console.log(jwtError);
        response.status(401).json([{ message: "Token generation failed" }]);
        return;
      }

      const storeTokenToDB = await userServices.loginUser(
        this.email,
        refresh_token
      );

      if (!storeTokenToDB) {
        response.status(400).json([
          {
            message: "Server error, please try again",
          },
        ]);
        return;
      }

      response.cookie("FRgrocery", refresh_token, {
        maxAge: 1000 * 60 * 60 * 24 * 2,
      });

      response.status(200).json([{ access_token }]);
      return;
    } catch (error) {
      console.log(error);
      response
        .status(401)
        .json([{ message: "User not found, please register" }]);
    }
    return;
  }

  // Logout
  public async logout(response: Response): Promise<void> {
    console.log(this.email);
    if (!this.email) {
      response.status(400).json([{ message: "Server error, email not found" }]);
      return;
    }

    const res = await userServices.logoutUser(this.email);
    if (!res) {
      response
        .status(400)
        .json([{ message: "Server error, failed to logout" }]);
      return;
    }

    response.clearCookie("FRgrocery");
    response.status(200).json([{ message: "Logout success" }]);
    return;
  }
}

export default UserController;
