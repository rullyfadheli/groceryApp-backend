import OrdersController from "../../controllers/ordersController";
import orderServices from "../../services/orderServices";
import { Request, Response } from "express";

jest.mock("../../services/orderServices");

describe("OrdersController", () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let responseMock: Partial<Response>;
  let requestMock: Partial<Request>;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockImplementation(() => {
      return responseMock as Response;
    });

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
    const dummyResponse = [
      {
        orderid: "9TA15255E9788281R",
        customername: "RullyFA",
        orderdate: "2025-10-18T11:04:20.522Z",
        totalprice: "9.26544",
        status: "PAID",
        deliverystatus: true,
      },
    ];

    requestMock = {
      user: { role: "admin" },
    };

    (orderServices.getAdminOrderList as jest.Mock).mockResolvedValue(
      dummyResponse
    );

    const controller = new OrdersController(requestMock as Request);
    await controller.getAdminOrderList(responseMock as Response);

    expect(jsonMock).toHaveBeenCalledWith(dummyResponse);
    expect(statusMock).toHaveBeenCalledWith(200);
  });

  it("Should return status 500", async () => {
    requestMock = {
      user: { role: "admin" },
    };

    const error: Error = new Error("Internal server error");

    (orderServices.getAdminOrderList as jest.Mock).mockRejectedValue(error);

    const controller = new OrdersController(requestMock as Request);
    await controller.getAdminOrderList(responseMock as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith([
      { message: "Internal server error" },
    ]);
  });
});
