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

  public async sendMail() {
    const gmail = process.env.USER_GMAIL as string;
    const password = process.env.GMAIL_PASSWORD as string;

    if (!gmail || !password) {
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
    http://localhost:3000/verify-email?token=${this.token}`;

    try {
      transporter.sendMail({
        from: gmail,
        to: this.email,
        subject: "Email verification",
        text: content,
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default SendMail;
