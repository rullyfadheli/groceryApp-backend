import { Request, Response } from "express";
import AddressServices from "../../../services/addressServices";

describe("Fetching the user's address bt using user_id", () => {
  let requestMock: Partial<Request>;
  let responseMock: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({
      status: jsonMock,
      json: jsonMock,
    }));

    requestMock = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
