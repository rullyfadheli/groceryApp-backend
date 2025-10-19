import AdminController from "../../../controllers/adminController";
import AdminServices from "../../../services/adminServices";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

jest.mock("../../../services/adminServices");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Admin login", () => {
  let responseMock: Partial<Response>;
  let requestMock: Partial<Request>;
  let cookieMock: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    cookieMock = jest.fn();
    statusMock = jest.fn(() => ({
      json: jsonMock,
    }));

    responseMock = {
      status: statusMock,
      cookie: cookieMock,
    };

    requestMock = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return status 400 if the email or the password was missing", async () => {
    requestMock.body = {
      email: "test_email@test.com",
      password: null,
    };

    const controller = new AdminController(requestMock as Request);
    await controller.login(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith([
      { message: "Please input the required fields" },
    ]);
  });

  it("should return status 200, access_token, and refresh_token", async () => {
    // --- ARRANGE ---

    requestMock.body = {
      email: "test_email@test.com",
      password: "test",
    };

    (AdminServices.getAdminData as jest.Mock).mockResolvedValue([
      {
        id: "1",
        username: "admin",
        email: "test_email@test.com",
        password: "hashed_password_from_db",
      },
    ]);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (jwt.sign as jest.Mock)
      .mockReturnValueOnce("random_values_wjw091") // access_token
      .mockReturnValueOnce("random_values_jw18jd"); // refresh_token

    // --- ACT ---

    const controller = new AdminController(requestMock as Request);
    await controller.login(responseMock as Response);

    // --- ASSERT ---

    expect(statusMock).toHaveBeenCalledWith(200);

    expect(cookieMock).toHaveBeenCalledWith(
      "refresh_token",
      "random_values_jw18jd",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    );

    expect(jsonMock).toHaveBeenCalledWith([
      {
        access_token: "random_values_wjw091",
      },
    ]);
  });

  it("should return status 404 if the user was not found", async () => {
    requestMock.body = {
      email: "test@email.com",
      password: "banana",
    };

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (AdminServices.getAdminData as jest.Mock).mockResolvedValue(false);

    const controller = new AdminController(requestMock as Request);
    await controller.login(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith([
      { message: "Admin data is not found" },
    ]);
  });

  it("Should return status 403 if the password was invalid", async () => {
    requestMock.body = {
      email: "test@email.com",
      password: "banana",
    };

    const mockData = [
      {
        email: "test@email.com",
        password: "test",
      },
    ];

    (AdminServices.getAdminData as jest.Mock).mockResolvedValue(mockData);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const controller = new AdminController(requestMock as Request);
    await controller.login(responseMock as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith("banana", "test");
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith([{ message: "Invalid password" }]);
  });

  it("Should return status 500 if there was a server error", async () => {
    requestMock.body = {
      email: "test@email.com",
      password: "banana",
    };

    const dbError = new Error("Connection failed");
    (AdminServices.getAdminData as jest.Mock).mockRejectedValue(dbError);

    const controller = new AdminController(requestMock as Request);
    await controller.login(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith([{ message: "Failed to login" }]);
  });
});
