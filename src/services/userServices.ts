import userRepositories from "../repositories/userRepositories.js";

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
    mobile: number;
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
      });
      return user;
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
}

export default new UserServices();
