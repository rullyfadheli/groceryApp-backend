import statisticServices from "../../../services/statisticServices";
import StatisticController from "../../../controllers/statisticController";
import { Request, Response } from "express";

jest.mock("../../../services/statisticServices");

describe("Admin controller", () => {
  let requestMock: Partial<Request>;
  let responseMock: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    responseMock = {
      status: statusMock,
      json: jsonMock,
    };
    requestMock = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return status 200", async () => {
    requestMock.user = {
      id: "1",
    };

    const dummyResponse = [
      {
        product_id: "461003cb-10f6-460e-81fc-742d80d12969",
        product_name: "Cocacola",
        total_quantity_sold: 6,
        rank: 1,
      },
      {
        product_id: "e8fda117-1c21-41b8-a509-02e96697acb2",
        product_name: "Pepsi",
        total_quantity_sold: 4,
        rank: 2,
      },
      {
        product_id: "6d79a944-ee30-48e0-8fa7-ca0cacb63bc7",
        product_name: "banana",
        total_quantity_sold: 1,
        rank: 3,
      },
    ];

    (statisticServices.getMonthlySales as jest.Mock).mockResolvedValue(
      dummyResponse
    );

    await new StatisticController(requestMock as Request).getMostPopularProduct(
      responseMock as Response
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(dummyResponse);
  });
});
