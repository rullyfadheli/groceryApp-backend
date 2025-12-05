import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
class SendMail {
  private email: string;
  private token: string;

  constructor(user_email: string, user_token: string) {
    this.email = user_email;
    this.token = user_token;
  }

  public async sendMail(): Promise<boolean> {
    const gmail = process.env.USER_GMAIL as string;
    const password = process.env.GMAIL_PASSWORD as string;

    if (!gmail || !password) {
      return false;
    }

    if (!this.email || !this.token) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: " gmail",
      auth: {
        user: gmail,
        pass: password,
      },
    });

    const content: string = `Welcome to FR Grocery, please click the 
    link below to complete your registration
    https://grocery-five-chi.vercel.app//verify-email?token=${this.token}`;

    try {
      transporter.sendMail({
        from: gmail,
        to: this.email,
        subject: "Email verification",
        text: content,
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async sendResetPasswordMail(): Promise<boolean> {
    const gmail = process.env.USER_GMAIL as string;
    const password = process.env.GMAIL_PASSWORD as string;

    if (!gmail || !password) {
      return false;
    }

    if (!this.email || !this.token) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmail,
        pass: password,
      },
    });

    const content: string = `
    Welcome to FR Grocery, please click the link below to reset your password. This link will be expire in 5 minutes, don't share it to anyone!


    https://grocery-five-chi.vercel.app/reset-password?token=${this.token}`;

    try {
      transporter.sendMail({
        from: gmail,
        to: this.email,
        subject: "Reset password",
        text: content,
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default SendMail;
