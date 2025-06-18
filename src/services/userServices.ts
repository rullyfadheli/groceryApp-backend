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
    } catch (err) {
      if (err) {
        console.log(err);
        return false;
      }
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

  public async loginUser(refresh_token: string) {
    try {
      await userRepositories.loginUser(refresh_token);
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default new UserServices();
