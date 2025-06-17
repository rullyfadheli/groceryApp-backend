import userRepositories from "../repositories/userRepositories.js";

class UserServices {
  async register({
    username,
    password,
    email,
    refresh_token,
    mobile,
  }: {
    username: string;
    password: string;
    refresh_token: string;
    email: string;
    mobile: number;
  }) {
    try {
      await userRepositories.register({
        username,
        password,
        email,
        refresh_token,
        mobile,
      });
    } catch (err) {
      if (err) {
        console.log(err);
        return null;
      }
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await userRepositories.getUserByEmail(email);
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

export default new UserServices();
