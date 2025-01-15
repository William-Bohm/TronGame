// src/theme.ts
import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#000000',
  },
  fontSizes: {
    small: '12px',
    medium: '16px',
    large: '20px',
  },
  fonts: {
    main: '"Orbitron", sans-serif',  // Updated this
    code: '"Courier New", monospace',
  },
};

export const darkTheme: DefaultTheme = {
  colors: {
    primary: '#7DFDFE',
    secondary: '#6c757d',
    background: '#121414',
    text: '#ffffff',
  },
  fontSizes: {
    small: '12px',
    medium: '16px',
    large: '20px',
  },
  fonts: {
    main: '"Orbitron", sans-serif',  // Updated this
    code: '"Courier New", monospace',
  },
};
