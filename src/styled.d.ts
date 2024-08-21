// src/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    fontSizes: {
      small: string;
      medium: string;
      large: string;
    };
    fonts: {
      main: string;
      code: string;
    };
  }
}
