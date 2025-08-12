import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Application configuration settings
 * Centralizes all environment variable handling and validation
 */
export interface AppConfig {
  port: number;
  apiUrl: string;
  frontendUrl: string;
  environment: string;
}

/**
 * Validates and returns application configuration
 * @returns Application configuration object
 * @throws Error if required environment variables are missing
 */
export const getConfig = (): AppConfig => {
  const config: AppConfig = {
    port: parseInt(process.env.PORT || "4000", 10),
    apiUrl: process.env.API_URL || "http://localhost:3000",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    environment: process.env.NODE_ENV || "development",
  };

  // Validate required configuration
  if (!config.apiUrl) {
    throw new Error("API_URL environment variable is required");
  }

  // Validate port is a valid number
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error("PORT must be a valid port number between 1 and 65535");
  }

  return config;
};
