import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

// Types
import type { UserProfileData } from "../types/UserType.js";
import postgres from "postgres";

// Services
import userServices from "../services/userServices.js";
import SendMail from "./sendMail.js";

class UserController {
  private username?: string;
  private password?: string;
  private email?: string;
  private mobile?: string;
  private refresh_token?: string;
  private user_id?: string;
  private verify_email_token?: string;
  private auth_email?: string;
  private reset_password?: string;

  // Admin access
  private admin_id?: string;

  constructor(request: Request) {
    this.username = request.body?.username;
    this.password = request.body?.password;
    this.email = request.body?.email;
    this.mobile = request.body?.mobile;
    this.refresh_token = request.cookies?.refresh_token;
    this.verify_email_token = request.query?.token as string;
    this.auth_email = request?.user?.email;
    this.user_id = request?.user?.id;
    this.reset_password = request?.body?.reset_password;
    this.admin_id = request?.user?.id;
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

      if (!hashedPassword) {
        response.status(400).json([{ message: "Failed to hash password" }]);
        return;
      }

      const REGISTER_TOKEN_SECRET = process.env.REGISTER_TOKEN_SECRET as string;

      if (!REGISTER_TOKEN_SECRET) {
        response.status(400).json([{ message: "Server misconfiguration" }]);
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

      response.status(200).json([
        {
          messasge:
            "Register success, please check your email to verify your registration",
        },
      ]);
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

  // Verify registration

  public async verifyRegistration(response: Response): Promise<void> {
    try {
      if (
        !this.verify_email_token ||
        typeof this.verify_email_token !== "string"
      ) {
        console.log(this.verify_email_token);
        response.status(401).json([{ message: "Token has expired" }]);
        return;
      }

      const REGISTER_TOKEN_SECRET = process.env.REGISTER_TOKEN_SECRET as string;

      if (!REGISTER_TOKEN_SECRET) {
        response.status(401).json([{ message: "Token has expired" }]);
        return;
      }

      const decoded_token = jwt.verify(
        this.verify_email_token,
        REGISTER_TOKEN_SECRET
      );

      const { email } = decoded_token as { email: string };

      if (!email) {
        response.status(401).json([{ message: "Invalid token" }]);
        return;
      }

      const verify = await userServices.verifyEmail(true, email);

      if (!verify) {
        response.status(401).json([{ message: "Token has expired" }]);
        return;
      }

      response
        .status(200)
        .json([{ message: "The user's email has verified succesfully" }]);
      return;
    } catch (error) {
      console.log(error);
      response.status(401).json([{ message: "Token has expired" }]);
      return;
    }
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

      const userData: false | postgres.RowList<postgres.Row[]> =
        await userServices.getUserByEmail(this.email as string);

      if (!userData || !userData[0]) {
        response
          .status(404)
          .json([{ message: "User not found, please register" }]);
        return;
      }

      const verifyPassword: boolean = await bcrypt.compare(
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
            id: userData[0].id,
            username: userData[0].username,
            email: this.email,
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );

        refresh_token = jwt.sign(
          {
            id: userData[0].id,
            username: userData[0].username,
            email: this.email,
          },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "2d" }
        );
      } catch (jwtError) {
        console.log(jwtError);
        response.status(401).json([{ message: "Token generation failed" }]);
        return;
      }

      const storeTokenToDB: boolean = await userServices.loginUser(
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

      response.cookie("refresh_token", refresh_token, {
        maxAge: 1000 * 60 * 60 * 24 * 2,
        path: "/",
        sameSite: "none" as const,
        secure: true,
        httpOnly: true,
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
    try {
      console.log(this.auth_email);
      if (!this.auth_email) {
        response
          .status(400)
          .json([{ message: "Server error, email not found" }]);
        return;
      }

      const res: boolean = await userServices.logoutUser(this.auth_email);
      if (!res) {
        response
          .status(400)
          .json([{ message: "Server error, failed to logout" }]);
        return;
      }

      response.cookie("refresh_token", "", {
        maxAge: 0,
        path: "/",
        sameSite: "none" as const,
        secure: true,
        httpOnly: true,
      });
      response.status(200).json([{ message: "Logout success" }]);
      return;
    } catch (err) {
      console.log(err);
      response
        .status(500)
        .json([{ message: "Server error, failed to signout" }]);
      return;
    }
  }

  async passwordResetRequest(response: Response): Promise<void> {
    try {
      const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET as string;

      if (!RESET_PASSWORD_SECRET) {
        response.status(500).json([{ message: "Server misconfiguration" }]);
        return;
      }

      if (!this.email) {
        response.status(400).json([{ message: "Please input your email" }]);
        return;
      }

      // if (!this.user_id || !this.auth_email) {
      //   response.status(404).json([{ message: "User is not found" }]);
      //   return;
      // }

      const verifyUser: false | postgres.RowList<postgres.Row[]> =
        await userServices.getUserByEmail(this.email);

      if (!verifyUser) {
        response.status(404).json([{ message: "User is not found" }]);
        return;
      }

      const jwtPayload = {
        id: verifyUser[0].id,
        email: this.auth_email,
        password: this.reset_password,
      };

      const token: string = jwt.sign(jwtPayload, RESET_PASSWORD_SECRET, {
        expiresIn: "5m",
      });

      if (!token) {
        response
          .status(500)
          .json([{ message: "Server error, please try again later" }]);
        return;
      }

      const sendMail: boolean = await new SendMail(
        this.email,
        token
      ).sendResetPasswordMail();

      if (!sendMail) {
        response
          .status(500)
          .json([{ message: "Failed to send the verification email" }]);
        return;
      }

      response.status(200).json([
        {
          message:
            "We've sent a reset password email to your account, please check your inbox",
        },
      ]);
      return;
    } catch (err) {
      console.log(err);
      response
        .status(500)
        .json([
          { message: "Reset password request failed, please try again later" },
        ]);
    }
    return;
  }

  async resetPassword(response: Response): Promise<void> {
    try {
      if (!this.reset_password) {
        response
          .status(400)
          .json([{ message: "Please type your new password" }]);
        return;
      }

      console.log(this.user_id);

      if (!this.user_id) {
        response.status(404).json([{ message: "User is not found" }]);
        return;
      }

      const salt: string = await bcrypt.genSalt(10);

      const hashedPassword: string = await bcrypt.hash(
        this.reset_password,
        salt
      );

      if (!hashedPassword) {
        response.status(500).json([
          {
            message: "Failed to reset your password, please try again later",
          },
        ]);
        return;
      }

      const dbResponse: false | postgres.RowList<postgres.Row[]> =
        await userServices.resetPassword(hashedPassword, this.user_id);

      if (!dbResponse) {
        response
          .status(500)
          .json([{ message: "Server error, failed to reset password" }]);
      }

      response
        .status(200)
        .json([{ message: "Password was reseted successfully" }]);
      return;
    } catch (error) {
      console.log(error);
      response
        .status(500)
        .json([{ message: "Server error, failed to reset password" }]);
      return;
    }
  }

  // Refreshing session token
  public async generateUserToken(response: Response): Promise<void> {
    try {
      console.log("cookie" + this.refresh_token);

      if (!this.refresh_token) {
        // console.log(this.refresh_token);
        response
          .status(401)
          .json([{ message: "Session expired, please login" }]);
        return;
      }

      const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
      const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

      if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
        response.status(400).json([{ message: "Server misconfiguration" }]);
        return;
      }
      const refresh_token: string = this.refresh_token;
      const userDB = userServices.verifyUserToken(refresh_token);

      if (!userDB) {
        response
          .status(401)
          .json([{ message: "Session expired, please login" }]);
        return;
      }

      const decoded_token = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET) as {
        id: string;
        username: string;
        email: string;
      };

      // console.log(decoded_token);

      const { id, username, email } = decoded_token;

      if (!id || !username || !email) {
        response.redirect("https://grocery-five-chi.vercel.app/login");
        return;
      }

      const newAccessToken: string = jwt.sign(
        { id, username, email },
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      // console.log("access_token" + newAccessToken);

      response.status(200).json([{ access_token: newAccessToken }]);
      return;
    } catch (error) {
      console.log(error);
      response.redirect("https://grocery-five-chi.vercel.app/login");
    }
  }

  public async getUserProfile(response: Response): Promise<void> {
    try {
      if (!this.auth_email) {
        response.status(401).json([{ message: "Invalid token, please login" }]);
        return;
      }

      const getDataFromDB: false | postgres.RowList<postgres.Row[]> =
        await userServices.getUserByEmail(this.auth_email);
      // console.log(getDataFromDB);

      if (!getDataFromDB) {
        response.status(400).json([{ message: "Error, user not found" }]);
        return;
      }

      const address = getDataFromDB.map(({ address, address_id }) => ({
        id: address_id,
        address,
      }));
      // console.log(address);

      const userProfile = getDataFromDB.map(
        ({ address, address_id, ...rest }) => ({
          ...rest,
        })
      );

      const finalData = [userProfile[0], address] as unknown as UserProfileData;
      // console.log(finalData);

      response.status(200).json(finalData);
      return;
    } catch (err) {
      console.log(err);
      response.status(401).json([{ message: "Invalid token" }]);
    }
  }

  public async editUserProfile(response: Response): Promise<void> {
    if (!this.user_id) {
      response.status(400).json([{ message: "Server error, user not found" }]);
      return;
    }

    if (!this.username || !this.email || !this.mobile) {
      response.status(400).json([{ message: "Please fill required fields" }]);
      return;
    }

    try {
      const data: boolean = await userServices.editUserProfile(
        this.user_id,
        this.username,
        this.email,
        String(this.mobile)
      );

      if (!data) {
        response
          .status(400)
          .json([{ message: "Server error, failed to update profile" }]);
        return;
      }

      response.status(200).json([{ message: "Profile updated successfully" }]);
      return;
    } catch (error) {
      console.log(error);
      response
        .status(400)
        .json([{ message: "Server error, failed to update profile" }]);
      return;
    }
  }

  public async getTotalUsers(res: Response): Promise<Response> {
    if (!this.admin_id) {
      return res.status(403).json([{ message: "Access denied" }]);
    }
    try {
      const success = await userServices.getTotalUsers();

      if (!success) {
        return res
          .status(500)
          .json([{ message: "Server error, failed to fetch total users" }]);
      }

      return res.status(200).json(success);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json([{ message: "Server error, failed to fetch total users" }]);
    }
  }
}

export default UserController;
