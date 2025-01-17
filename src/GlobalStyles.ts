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
        font-family: ${({theme}) => theme.fonts.main};
        color: ${({theme}) => theme.colors.text};
        background-color: ${({theme}) => cssFormatColors.darkGrey};
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
        color: ${({theme}) => theme.colors.primary};
        text-decoration: none;
    }

    //@font-face {
    //    font-family: 'Orbitron';
    //    src: url('/font/Orbitron/Orbitron-VariableFont_wght.ttf') format('truetype');
    //    font-weight: 100 900;
    //    font-style: normal;
    //}
`;

export default GlobalStyles;
