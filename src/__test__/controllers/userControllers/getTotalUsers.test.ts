import userServices from "../../../services/userServices";
import UserController from "../../../controllers/userController";
import { Request, Response } from "express";

jest.mock("../../../services/userServices");

describe("UserController", () => {
  let requestMock: Partial<Request>;
  let responseMock: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn();
    jsonMock = jest.fn();

    responseMock = {
      status: statusMock,
      json: jsonMock,
    };

    statusMock.mockReturnValue(responseMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return status 200 and total users data", async () => {
    const dummyResponse = [{ total_users: "5" }];

    requestMock = {
      user: { id: "1" },
    };

    (userServices.getTotalUsers as jest.Mock).mockResolvedValue(dummyResponse);

    const controller = new UserController(requestMock as Request);
    await controller.getTotalUsers(responseMock as Response);

    expect(userServices.getTotalUsers).toHaveBeenCalledWith();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(dummyResponse);
  });

  it("should return status 500 and error message on failure", async () => {
    requestMock = {
      user: { id: "1" },
    };

    (userServices.getTotalUsers as jest.Mock).mockRejectedValue(
      new Error("Service error")
    );

    const controller = new UserController(requestMock as Request);
    await controller.getTotalUsers(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith([
      { message: "Server error, failed to fetch total users" },
    ]);
  });
});
