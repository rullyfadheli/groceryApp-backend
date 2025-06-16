import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import userServices from "../services/userServices.js";

class UserController {
  async register(request: Request, response: Response): Promise<void> {
    const { username, password, email, mobile } = request.body;

    if (!username || !password || !email || !mobile) {
      response.status(400).json([{ message: "Please fill required fields" }]);
      return;
    }

    const userDB = await userServices.getUserByEmail(email);

    if (userDB[0].email === email) {
      response
        .status(201)
        .json([{ message: `User with email ${email} is already exist` }]);
      return;
    }

    try {
      const saltRounds: number = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (!hashedPassword) {
        response.status(400).json([{ message: "Failed to hash password" }]);
        return;
      }

      const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
      const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

      if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
        response.status(500).json([{ message: "Server misconfiguration." }]);
        return;
      }

      let refresh_token: string;
      let access_token: string;

      try {
        refresh_token = jwt.sign(
          { username, email, mobile },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "2d" }
        );
        access_token = jwt.sign(
          { username, email, mobile },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );
      } catch (jwtError) {
        console.error("JWT Error:", jwtError);
        response.status(500).json([{ message: "Token generation failed." }]);
        return;
      }

      await userServices.register({
        username,
        password: hashedPassword,
        email,
        mobile,
        refresh_token,
      });

      response.status(200).json([access_token]);
    } catch (error) {
      console.error("Register Error:", error);
      response
        .status(400)
        .json([
          { message: "Server error, failed to register, try again later" },
        ]);
    }
  }
}

export default new UserController();
