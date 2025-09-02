import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateJWT, validateJWTClaims } from "../../src/middleware/auth";

// Mock jsonwebtoken
jest.mock("jsonwebtoken");
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment - ensure AUTH_DISABLED is not set by default
    process.env = {
      ...originalEnv,
      AUTH_DISABLED: undefined,
    };
    delete process.env.AUTH_DISABLED;

    // Setup mock request/response objects
    req = {
      path: "/api/v1/cheque/123456",
      header: jest.fn(),
    } as Partial<Request>;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("authenticateJWT", () => {
    describe("when AUTH_DISABLED is true", () => {
      it("should bypass authentication and call next()", () => {
        process.env.AUTH_DISABLED = "true";

        authenticateJWT(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe("when path includes /health", () => {
      it("should bypass authentication for health check endpoints", () => {
        // Create a new request object with health path
        const healthReq = {
          ...req,
          path: "/health",
        } as Request;
        process.env.JWT_SECRET = "test-secret";

        authenticateJWT(healthReq, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it("should bypass authentication for nested health endpoints", () => {
        // Create a new request object with nested health path
        const healthReq = {
          ...req,
          path: "/api/v1/health",
        } as Request;
        process.env.JWT_SECRET = "test-secret";

        authenticateJWT(healthReq, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe("when JWT_SECRET is not configured", () => {
      it("should return 500 error", () => {
        delete process.env.JWT_SECRET;

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Server authentication is not configured",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("when Authorization header is missing", () => {
      it("should return 401 error for missing header", () => {
        process.env.JWT_SECRET = "test-secret";
        (req.header as jest.Mock).mockReturnValue(undefined);

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Authorization header with Bearer token required",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 401 error for non-Bearer header", () => {
        process.env.JWT_SECRET = "test-secret";
        (req.header as jest.Mock).mockReturnValue("Basic token123");

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Authorization header with Bearer token required",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("when token is empty", () => {
      it("should return 401 error for Bearer without token", () => {
        process.env.JWT_SECRET = "test-secret";
        (req.header as jest.Mock).mockReturnValue("Bearer ");

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Token is required",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("when token verification succeeds", () => {
      it("should call next() and attach payload to request", () => {
        process.env.JWT_SECRET = "test-secret";
        process.env.JWT_ISSUER = "test-issuer";
        process.env.JWT_AUDIENCE = "test-audience";
        process.env.JWT_CLOCK_TOLERANCE = "15";

        const mockPayload = { sub: "test-user", exp: Date.now() + 3600 };
        (req.header as jest.Mock).mockReturnValue("Bearer valid-token");
        (mockedJwt.verify as jest.Mock).mockReturnValue(mockPayload);

        authenticateJWT(req as Request, res as Response, next);

        expect(mockedJwt.verify).toHaveBeenCalledWith(
          "valid-token",
          "test-secret",
          {
            algorithms: ["HS256"],
            issuer: "test-issuer",
            audience: "test-audience",
            clockTolerance: 15,
          }
        );
        expect(req.jwtPayload).toBe(mockPayload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it("should use default values when env vars not set", () => {
        process.env.JWT_SECRET = "test-secret";
        // Don't set JWT_ISSUER, JWT_AUDIENCE, or JWT_CLOCK_TOLERANCE

        const mockPayload = { sub: "test-user" };
        (req.header as jest.Mock).mockReturnValue("Bearer valid-token");
        (mockedJwt.verify as jest.Mock).mockReturnValue(mockPayload);

        authenticateJWT(req as Request, res as Response, next);

        expect(mockedJwt.verify).toHaveBeenCalledWith(
          "valid-token",
          "test-secret",
          {
            algorithms: ["HS256"],
            issuer: undefined,
            audience: undefined,
            clockTolerance: 10, // Default value
          }
        );
        expect(next).toHaveBeenCalled();
      });
    });

    describe("when token verification fails", () => {
      beforeEach(() => {
        process.env.JWT_SECRET = "test-secret";
        (req.header as jest.Mock).mockReturnValue("Bearer invalid-token");
      });

      it("should return 401 for expired token", () => {
        (mockedJwt.verify as jest.Mock).mockImplementation(() => {
          throw new jwt.TokenExpiredError("Token expired", new Date());
        });

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Token has expired",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 401 for malformed token", () => {
        (mockedJwt.verify as jest.Mock).mockImplementation(() => {
          throw new jwt.JsonWebTokenError("Invalid token");
        });

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid token format",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 401 for other verification errors", () => {
        (mockedJwt.verify as jest.Mock).mockImplementation(() => {
          throw new Error("Some other error");
        });

        authenticateJWT(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Token verification failed",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe("validateJWTClaims", () => {
    const requiredClaims = {
      purpose: "cheque-api-access",
      sub: "cheque-backend-service",
    };

    describe("when jwtPayload is not present", () => {
      it("should return 401 error", () => {
        delete req.jwtPayload;

        const middleware = validateJWTClaims(requiredClaims);
        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error:
            "JWT payload not found. Ensure authenticateJWT middleware runs first.",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("when claims match", () => {
      it("should call next()", () => {
        req.jwtPayload = {
          purpose: "cheque-api-access",
          sub: "cheque-backend-service",
          iat: Date.now(),
        };

        const middleware = validateJWTClaims(requiredClaims);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe("when claims don't match", () => {
      it("should return 403 error for wrong purpose", () => {
        req.jwtPayload = {
          purpose: "wrong-purpose",
          sub: "cheque-backend-service",
          iat: Date.now(),
        };

        const middleware = validateJWTClaims(requiredClaims);
        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid JWT claims",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 403 error for wrong subject", () => {
        req.jwtPayload = {
          purpose: "cheque-api-access",
          sub: "wrong-service",
          iat: Date.now(),
        };

        const middleware = validateJWTClaims(requiredClaims);
        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid JWT claims",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 403 error for missing claims", () => {
        req.jwtPayload = {
          iat: Date.now(),
          // Missing required claims
        };

        const middleware = validateJWTClaims(requiredClaims);
        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid JWT claims",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe("with no required claims", () => {
      it("should call next() when no claims required", () => {
        req.jwtPayload = { iat: Date.now() };

        const middleware = validateJWTClaims({});
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });
  });
});
