module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts", // Exclude main server file from coverage
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testTimeout: 10000, // 10 seconds for database operations
  testPathIgnorePatterns: [
    "<rootDir>/__tests__/setup.ts",
    "<rootDir>/__tests__/mocks/",
  ],
};
