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
    await userRepositories.register({
      username,
      password,
      email,
      refresh_token,
      mobile,
    });
  }

  async getUserByEmail(email: string) {
    return await userRepositories.getUserByEmail(email);
  }
}

export default new UserServices();
