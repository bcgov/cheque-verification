import '@testing-library/jest-dom';
import type { ChangeEvent, ReactNode } from 'react';
import { vi, beforeEach } from 'vitest';

vi.mock('@bcgov/design-system-react-components', async () => {
  const React = await import('react');
  const { createElement } = React;

  const Header = (
    { title, children, ...props }:
      { title: string; children?: ReactNode } & Record<string, unknown>
  ) =>
    createElement(
      'header',
      { role: 'banner', ...props },
      createElement('h1', { style: { margin: 0 } }, title),
      children ?? null
    );

  const Footer = (
    { children, ...props }:
      { children?: ReactNode } & Record<string, unknown>
  ) => createElement('footer', { role: 'contentinfo', ...props }, children ?? null);

  const Button = (
    {
      children,
      onPress,
      isDisabled,
      type = 'button',
      ...buttonProps
    }: {
      children: ReactNode;
      onPress?: () => void;
      isDisabled?: boolean;
      type?: string;
    } & Record<string, unknown>
  ) =>
    createElement(
      'button',
      {
        type,
        disabled: isDisabled,
        onClick: onPress,
        ...buttonProps,
      },
      children
    );

  const TextField = (
    {
      label,
      value,
      onChange,
      type = 'text',
      isRequired,
      errorMessage,
      id,
      ...inputProps
    }: {
      label: string;
      value: string;
      onChange: (next: string) => void;
      type?: string;
      isRequired?: boolean;
      errorMessage?: string;
      id?: string;
    } & Record<string, unknown>
  ) => {
    const sanitized = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const inputId = id ?? `field-${sanitized}`;
    const errorId = `${inputId}-error`;

    return createElement(
      'label',
      { htmlFor: inputId, style: { display: 'block' } },
      createElement('span', { style: { display: 'block', marginBottom: '4px' } }, label),
      createElement('input', {
        id: inputId,
        type,
        value,
        required: isRequired,
        'aria-invalid': errorMessage ? 'true' : undefined,
        'aria-describedby': errorMessage ? errorId : undefined,
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
        ...inputProps,
      }),
      errorMessage
        ? createElement(
            'span',
            { id: errorId, role: 'alert', style: { display: 'block', marginTop: '4px' } },
            errorMessage
          )
        : null
    );
  };

  const InlineAlert = (
    {
      title,
      description,
      variant,
      ...alertProps
    }: {
      title?: string;
      description?: string;
      variant?: string;
    } & Record<string, unknown>
  ) =>
    createElement(
      'div',
      { role: 'note', 'data-variant': variant, ...alertProps },
      title ? createElement('strong', null, title) : null,
      description ? createElement('span', null, description) : null
    );

  return {
    Header,
    Footer,
    Button,
    TextField,
    InlineAlert,
  };
});

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:4000',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
  },
  writable: true,
});

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeEach(() => {
  vi.clearAllMocks();
});
