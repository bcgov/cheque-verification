/**
 * Frontend Test Helpers
 * Centralized utilities for React component testing
 */

import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { vi } from "vitest";
import type { ApiResponse, CheckStatus } from "../../src/types";

// Test data constants for consistent testing
export const TEST_CHEQUE_DATA = {
  valid: {
    chequeNumber: "123456",
    paymentIssueDate: "2024-01-15",
    appliedAmount: "1000.50",
  },
  invalid: {
    chequeNumber: "0",
    paymentIssueDate: "invalid-date",
    appliedAmount: "-100",
  },
};

export const MOCK_API_RESPONSES = {
  success: {
    success: true,
    data: {
      chequeNumber: "123456",
      chequeStatus: "active",
    },
  } as ApiResponse<CheckStatus>,

  failure: {
    success: false,
    error: "Cheque verification failed",
    data: {
      chequeNumber: "123456",
      chequeStatus: "inactive",
    },
  } as ApiResponse<CheckStatus>,

  notFound: {
    success: false,
    error: "Cheque not found",
  } as ApiResponse<CheckStatus>,

  networkError: {
    success: false,
    error: "Network error - please check your connection",
  } as ApiResponse<CheckStatus>,
};

/**
 * Custom render function with test providers if needed
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  // Add any providers here (Router, Context, etc.) if your app needs them
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return children;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock axios module for API testing
 */
export const createMockAxios = () => {
  return {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      timeout: 10000,
    },
  };
};

/**
 * Helper to create mock form submission events
 */
export const createMockSubmitEvent = (preventDefault = vi.fn()) => {
  return {
    preventDefault,
  } as unknown as React.FormEvent;
};

/**
 * Helper to simulate async operations in tests
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock environment variables for testing
 */
export const mockEnvironment = (overrides: Record<string, string> = {}) => {
  // Note: In test environment, import.meta.env might not be available
  // Using process.env as fallback for test environment
  const originalEnv =
    (
      globalThis as unknown as {
        import?: { meta?: { env?: Record<string, unknown> } };
      }
    ).import?.meta?.env || {};

  // Mock Vite environment variables for testing
  (
    globalThis as unknown as {
      import: { meta: { env: Record<string, string> } };
    }
  ).import = {
    meta: {
      env: {
        ...originalEnv,
        VITE_API_URL: "http://localhost:4000",
        MODE: "test",
        ...overrides,
      },
    },
  };

  return () => {
    // Restore original environment
    const typedGlobal = globalThis as unknown as {
      import?: { meta?: { env?: Record<string, unknown> } };
    };
    if (typedGlobal.import?.meta) {
      typedGlobal.import.meta.env = originalEnv;
    }
  };
};

/**
 * Helper to check if element has proper accessibility attributes
 */
export const checkAccessibility = (element: HTMLElement) => {
  return {
    hasAriaLabel: () => element.hasAttribute("aria-label"),
    hasAriaDescribedBy: () => element.hasAttribute("aria-describedby"),
    hasProperRole: () => element.hasAttribute("role"),
    isAccessible: () =>
      element.hasAttribute("aria-label") ||
      element.hasAttribute("aria-labelledby") ||
      element.tagName.toLowerCase() === "label",
  };
};

/**
 * Helper to test form validation
 */
export const testFormValidation = {
  chequeNumber: {
    valid: ["123456", "1", "9999999999999999"],
    invalid: ["", "0", "abc", "123abc", "12345678901234567"],
  },
  amount: {
    valid: ["100", "1000.50", "0.01"],
    invalid: ["", "-100", "abc", "0"],
  },
  date: {
    valid: ["2024-01-15", "2023-12-31"],
    invalid: ["", "invalid-date", "2024-13-01", "2024-01-32"],
  },
};
