import statisticServices from "../../../services/statisticServices";
import StatisticController from "../../../controllers/statisticController";
import { Request, Response } from "express";

jest.mock("../../../services/statisticServices");

describe("StatisticControllers", () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let responseMock: Partial<Response>;
  let requestMock: Partial<Request>;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn();
    responseMock = {
      status: statusMock,
      json: jsonMock,
    };

    statusMock.mockReturnValue(responseMock);

    requestMock = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return status 200 and a valid data", async () => {
    requestMock = {
      user: {
        id: "1",
      },
    };

    const dummyResponse = [
      {
        items_sold: "10",
        category: "Cold Drinks & Juices",
        rank: "1",
      },
    ];

    (
      statisticServices.getMostPopularProductThisMonth as jest.Mock
    ).mockResolvedValue(dummyResponse);

    const controller = new StatisticController(requestMock as Request);
    await controller.getMostPopularCategory(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenLastCalledWith(dummyResponse);
  });

  it("Should return status 500", async () => {
    requestMock = {
      user: {
        id: "1",
      },
    };

    const dummyResponse = new Error("Internal server error");

    (
      statisticServices.getMostPopularProductThisMonth as jest.Mock
    ).mockRejectedValue(dummyResponse);

    const controller = new StatisticController(requestMock as Request);
    await controller.getMostPopularCategory(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith([
      { message: "Internal server error" },
    ]);
  });
});
