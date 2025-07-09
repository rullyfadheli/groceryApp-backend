import { google } from "googleapis";
import crypto from "crypto";
import { Request, Response } from "express";
import session from "express-session";
import url from "url";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// services
import userServices from "../services/userServices.js";
import { ref } from "process";

declare module "express-session" {
  interface SessionData {
    state?: string;
  }
}

class OAuthController {
  public async getGoogleAuthUrl(req: Request, res: Response): Promise<void> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID as string,
      process.env.GOOGLE_CLIENT_SECRET as string,
      process.env.GOOGLE_REDIRECT_URI as string
    );

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const state: string = crypto.randomBytes(32).toString("hex");

    // console.log("State:", state);

    req.session.state = state as string;

    const authorizationUrl: string = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
      state: state,
      prompt: "consent",
    });

    // console.log(authorizationUrl);

    res.redirect(authorizationUrl);

    // return authorizationUrl;
  }

  public async handleGoogleCallback(
    req: Request,
    res: Response
  ): Promise<void> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID as string,
      process.env.GOOGLE_CLIENT_SECRET as string,
      process.env.GOOGLE_REDIRECT_URI as string
    );

    const q = url.parse(req.url, true).query;

    if (q.error) {
      console.log("Error:" + q.error);
      res.redirect("http://localhost:3000/login");
      return;
    }

    if (q.state !== req.session.state) {
      console.log("State mismatch. Possible CSRF attack");
      res
        .status(401)
        .json([{ message: "State mismatch. Possible CSRF attack" }]);

      return;
    }

    const code = Array.isArray(q.code) ? q.code[0] : q.code;

    if (!code) {
      res.end("No code provided");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data || !data.email || !data.name) {
      res
        .status(400)
        .json([{ message: "Invalid user data received from Google" }]);
      return;
    }

    const email = data.email as string;
    const username = data.name as string;
    const google_id = data.id as string;

    // console.log(data);

    const user = await userServices.OAuthRegister({
      username,
      email,
      google_id,
    });

    console.log(user);

    if (!user || !Array.isArray(user) || user.length === 0) {
      res.status(404).json([{ message: "User not found" }]);
      return;
    }

    const access_token = jwt.sign(
      { email: user[0].email, id: user[0].id, username: user[0].username },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "10m" }
    );

    const refresh_token = jwt.sign(
      { email: user[0].email, id: user[0].id, username: user[0].username },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "2D" }
    );

    const storeTokenToDB: boolean = await userServices.storeRefreshToken({
      user_id: user[0].id,
      token: refresh_token,
    });

    if (!storeTokenToDB) {
      res
        .status(400)
        .json([{ message: "Login failed, please try again later" }]);
      return;
    }

    res.redirect(
      `http://localhost:3000/auth/google/callback?refresh_token=${refresh_token}&access_token=${access_token}`
    );
    return;
  }
}

export default OAuthController;
