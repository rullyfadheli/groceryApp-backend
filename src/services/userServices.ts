import userRepositories from "../repositories/userRepositories.js";
import postgres from "postgres";

class UserServices {
  public async register({
    username,
    password,
    email,
    mobile,
  }: {
    username: string;
    password: string;
    email: string;
    mobile: string;
  }) {
    try {
      await userRepositories.register({
        username,
        password,
        email,
        mobile,
      });
      return true;
    } catch (err) {
      if (err) {
        console.log(err);
        return false;
      }
    }
  }

  public async OAuthRegister({
    username,
    email,
    google_id,
  }: {
    username: string;
    email: string;
    google_id: string;
  }) {
    try {
      const user = await userRepositories.OAuthRegister({
        username,
        email,
        google_id,
        email_verified: true,
      });
      return user;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async storeRefreshToken({
    user_id,
    token,
  }: {
    user_id: string;
    token: string;
  }): Promise<boolean> {
    try {
      await userRepositories.storeRefreshToken(user_id, token);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async getUserByEmail(email: string) {
    try {
      return await userRepositories.getUserByEmail(email);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async loginUser(email: string, refresh_token: string) {
    try {
      await userRepositories.loginUser(email, refresh_token);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async logoutUser(email: string) {
    try {
      await userRepositories.logoutUser(email);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async verifyUserToken(token: string) {
    try {
      return await userRepositories.getRefreshToken(token);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async verifyEmail(verify: boolean, email: string) {
    try {
      await userRepositories.updateEmailverification(verify, email);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async editUserProfile(
    id: string,
    username: string,
    email: string,
    mobile: string
  ): Promise<boolean> {
    try {
      await userRepositories.editUserProfile(id, username, mobile, email);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async resetPassword(
    newPassword: string,
    user_id: string
  ): Promise<postgres.RowList<postgres.Row[]> | false> {
    try {
      const reset = await userRepositories.resetPassword(newPassword, user_id);
      return reset;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async getTotalUsers() {
    try {
      const users = await userRepositories.getTotalUsers();
      return users;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new UserServices();
