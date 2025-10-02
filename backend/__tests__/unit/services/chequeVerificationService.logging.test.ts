import axios from "axios";
import { ChequeVerificationService } from "../../../src/services/chequeVerificationService";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ChequeVerificationService - Logging Coverage", () => {
  let service: ChequeVerificationService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ChequeVerificationService("http://test-api");
    
    // Setup console spies
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fetchChequeData - Request Logging", () => {
    it("should log API request preparation securely", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            chequeStatus: "VALID",
            chequeNumber: 123456,
            paymentIssueDate: new Date(),
            appliedAmount: 100.0,
          },
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Preparing API request",
        {
          chequeNumberLength: 6,
          hasApiUrl: true,
          apiUrl: "http://test-api",
        }
      );
    });

    it("should log JWT authentication configuration", async () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "test-secret";

      const mockResponse = {
        data: { success: true, data: {} },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith("JWT authentication configured");

      // Restore original environment
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
    });

    it("should log warning when no JWT secret is configured", async () => {
      const warnSpy = jest.spyOn(console, "warn");
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const mockResponse = {
        data: { success: true, data: {} },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(warnSpy).toHaveBeenCalledWith(
        "No JWT secret configured - making unauthenticated request"
      );

      // Restore original environment
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it("should log API request details securely", async () => {
      const mockResponse = {
        data: { success: true, data: {} },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Making API request",
        {
          baseUrl: "http://test-api",
          chequeNumberLength: 6,
          hasAuth: false,
          timeout: 5000,
        }
      );
    });

    it("should log API request with authentication", async () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "test-secret";

      const mockResponse = {
        data: { success: true, data: {} },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Making API request",
        {
          baseUrl: "http://test-api",
          chequeNumberLength: 6,
          hasAuth: true,
          timeout: 5000,
        }
      );

      // Restore original environment
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
    });
  });

  describe("fetchChequeData - Response Logging", () => {
    it("should log successful API response securely", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            chequeStatus: "VALID",
            chequeNumber: 123456,
            paymentIssueDate: new Date(),
            appliedAmount: 100.0,
          },
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "API response received",
        {
          status: 200,
          hasData: true,
          success: true,
          dataKeys: ["chequeStatus", "chequeNumber", "paymentIssueDate", "appliedAmount"],
        }
      );
    });

    it("should log unsuccessful API response", async () => {
      const mockResponse = {
        data: {
          success: false,
          error: "Cheque not found",
        },
        status: 404,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "API response received",
        {
          status: 404,
          hasData: true, // response.data exists even for errors
          success: false,
          dataKeys: [], // no response.data.data for errors
        }
      );
    });

    it("should handle API response with no data", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: undefined,
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "API response received",
        {
          status: 200,
          hasData: true, // response.data exists
          success: true,
          dataKeys: [], // no response.data.data when data is undefined
        }
      );
    });
  });

  describe("fetchChequeData - Environment Configuration", () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should handle custom JWT configuration", async () => {
      process.env.JWT_SECRET = "custom-secret";
      process.env.JWT_ISSUER = "custom-issuer";
      process.env.JWT_AUDIENCE = "custom-audience";
      process.env.JWT_TTL = "300";

      const mockResponse = {
        data: { success: true, data: {} },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await service.fetchChequeData("123456");

      expect(consoleSpy).toHaveBeenCalledWith("JWT authentication configured");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Making API request",
        expect.objectContaining({
          hasAuth: true,
        })
      );
    });
  });
});