/**
 * @file Test suite for the AdminController class, focusing on the registerAdmin method.
 * @author Rully Fadheli
 */

// These imports are now implicitly available through your tsconfig.json or the import below.
import "@jest/globals";

import AdminController from "../../../controllers/adminController";
import AdminServices from "../../../services/adminServices";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

// Mock the dependencies to isolate the controller for unit testing.
jest.mock("../../../services/adminServices");
jest.mock("bcrypt");

/**
 * @describe Test suite for the AdminController.
 */
describe("AdminController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  // Before each test, reset the mock objects to ensure a clean state.
  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    // Mock the response object and its chainable methods (status, json).
    responseJson = jest.fn();
    responseStatus = jest.fn().mockImplementation(() => ({
      json: responseJson,
    }));

    mockResponse = {
      status: responseStatus,
    };
  });

  // Clear all mocks after each test to prevent side effects between tests.
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * @describe Tests for the registerAdmin method.
   */
  describe("registerAdmin", () => {
    /**
     * @test Should successfully register a new admin when all fields are provided and valid.
     */
    it("should register a new admin successfully", async () => {
      // Arrange: Set up the request body and mock the return values of dependencies.
      mockRequest.body = {
        username: "testadmin",
        email: "admin@example.com",
        password: "strongPassword123",
      };

      const hashedPassword = "hashedPassword";
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("somesalt");
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (AdminServices.insertNewAdmin as jest.Mock).mockResolvedValue(true);

      // Act: Instantiate the controller and call the method to be tested.
      const controller = new AdminController(mockRequest as Request);
      await controller.registerAdmin(mockResponse as Response);

      // Assert: Verify that the dependencies were called with the correct arguments
      // and the response was sent with the correct status and message.
      expect(bcrypt.hash).toHaveBeenCalledWith("strongPassword123", "somesalt");
      expect(AdminServices.insertNewAdmin).toHaveBeenCalledWith(
        "testadmin",
        "admin@example.com",
        hashedPassword
      );
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith([
        { message: "Register admin success" },
      ]);
    });

    /**
     * @test Should return a 400 Bad Request error if required fields are missing.
     */
    it("should return 400 if required fields are missing", async () => {
      // Arrange: Provide an incomplete request body.
      mockRequest.body = {
        username: "testadmin",
        email: "admin@example.com",
        // Password is intentionally omitted.
      };

      // Act
      const controller = new AdminController(mockRequest as Request);
      await controller.registerAdmin(mockResponse as Response);

      // Assert
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith([
        { message: "Please input the required fields" },
      ]);
      // Ensure that no hashing or database insertion was attempted.
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(AdminServices.insertNewAdmin).not.toHaveBeenCalled();
    });

    /**
     * @test Should return a 500 Internal Server Error if the service fails to insert the admin.
     */
    it("should return 500 if AdminServices.insertNewAdmin returns false", async () => {
      // Arrange: Set up a complete request body, but mock the service to fail.
      mockRequest.body = {
        username: "testadmin",
        email: "admin@example.com",
        password: "strongPassword123",
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (AdminServices.insertNewAdmin as jest.Mock).mockResolvedValue(false); // Simulate insertion failure.

      // Act
      const controller = new AdminController(mockRequest as Request);
      await controller.registerAdmin(mockResponse as Response);

      // Assert
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith([
        { message: "Failed to register new admin" },
      ]);
    });

    /**
     * @test Should return a 500 Internal Server Error on a generic exception.
     */
    it("should return 500 on a generic exception", async () => {
      // Arrange: Set up a complete request body, but mock a service to throw an error.
      mockRequest.body = {
        username: "testadmin",
        email: "admin@example.com",
        password: "strongPassword123",
      };
      const dbError = new Error("Database connection failed");
      (bcrypt.hash as jest.Mock).mockRejectedValue(dbError); // Simulate an error during hashing.

      // Act
      const controller = new AdminController(mockRequest as Request);
      await controller.registerAdmin(mockResponse as Response);

      // Assert
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith([
        { message: "Failed to register new admin" },
      ]);
    });
  });
});
