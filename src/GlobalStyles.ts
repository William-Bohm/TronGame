// src/components/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';
import {colors, cssFormatColors} from "./threeJSMeterials";

const GlobalStyles = createGlobalStyle`
  /* Reset some default styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

body {
    font-family: ${({ theme }) => theme.fonts.main};
    //background-image: 
    //  /* Dots layer (top) */
    //  radial-gradient(
    //    circle,
    //    rgba(255, 255, 255, 0.1) 1px,
    //    transparent 1.5px
    //  ),
    //  /* Vignette effect (middle) */
    //  radial-gradient(
    //    circle at center,
    //    rgba(0, 0, 0, 1) 0%,
    //    rgba(0, 0, 0, 0.6) 100%
    //  ),
    //  /* Background image (bottom) */
    //  url('/smokeybackground.webp');
    //
    //background-size: 
    //  40px 40px,
    //  cover,
    //  cover;
    //
    //background-position: center;
    //background-repeat: repeat, no-repeat, no-repeat;
    //background-attachment: fixed;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => cssFormatColors.darkGrey};
    line-height: 1.6;
    margin: 0;
    padding: 0;
}

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1.5rem;
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }
`;

export default GlobalStyles;
