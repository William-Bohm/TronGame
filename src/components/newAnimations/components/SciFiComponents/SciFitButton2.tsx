import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA, toHSLA} from "../../../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {useIsMobile} from "../../ThreeScene3";

interface FuturisticButtonProps {
    text: string;
    onClick: () => void;
}


const lineAnimationTime = 11;


// Then modify your ButtonContainer
const ButtonContainer = styled.div`
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    //padding: 5px 10px;
    padding: 0;
    transition: all 0.3s ease;
    animation: ${slideDown} 1s ease-out forwards;
`;
const SVGContainer = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;

const BorderPath = styled.path`
    fill: none;
    stroke: ${() => toRGBA(cssFormatColors.neonBlue, 0.8)};
    stroke-width: 2;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine ${lineAnimationTime}s forwards;

    @keyframes drawLine {
        to {
            stroke-dashoffset: 0;
        }
    }
`;
interface TextContainerProps {
  isMobile: boolean;
}

const TextContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: linear-gradient(
            90deg,
            ${() => toRGBA(cssFormatColors.darkGrey, 1)} 0%,
            ${() => toRGBA(cssFormatColors.darkGrey, 1)} 9%,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.5)} 50%,
            ${() => toRGBA(cssFormatColors.darkGrey, 1)} 91%,
            ${() => toRGBA(cssFormatColors.darkGrey, 1)} 100%
    );
    // background: ${cssFormatColors.neonBlue};
    padding: 8px 8px;
    min-width: ${props => props.isMobile ? '25vw' : '60vw'};
    @media (min-width: 750px) {
        min-width: ${props => props.isMobile ? '25vw' : '50vw'};
    }
    @media (max-width: 750px) {
        padding: 2px 2px;
    }
    @media (max-width: 450px) {
        min-width: ${props => props.isMobile ? '25vw' : '80vw'};
    }
    width: fit-content;
    white-space: nowrap;
    margin: 0;
    color: white;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    clip-path: polygon(
            15% 5%,
            90.5% 5%,
            85% 95%,
            9.5% 95%
    );
    //min-width: 200px;

    text-align: center;

    ${ButtonContainer}:hover & {
        color: black;
        background: linear-gradient(
                90deg,
                ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 0%,
                ${() => toRGBA(cssFormatColors.neonBlue, 0.9)} 25%,
                ${() => toRGBA(cssFormatColors.neonBlue, 0.9)} 75%,
                ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 100%
        );
    }
`;

const LeftCircleSVGContainer = styled.svg`
    position: absolute;
    left: 1%;
    top: 5%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const RightCircleSVGContainer = styled.svg`
    position: absolute;
    right: 1%;
    top: 90%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const CircleMarker = styled.circle`
    fill: ${cssFormatColors.neonBlue};
    stroke: ${() => toRGBA(cssFormatColors.neonBlue, 0.8)};;
    stroke-width: 2;
`;

const FuturisticButton2: React.FC<FuturisticButtonProps> = ({
                                                                text,
                                                                onClick,
                                                            }) => {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showLines, setShowLines] = useState<boolean>(false);

    // timer for lines
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLines(true);
        }, 300);

        // Cleanup function
        return () => clearTimeout(timer);
    }, []);

    return (
        <ButtonContainer
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TextContainer isMobile={isMobile}>{text}</TextContainer>
            {showLines && (
                <div>
                    <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
<BorderPath
    d={`
        M 3 5
        L 10 5
        L 5 90
        L 9 90
        L 14 5
    `}/>
                        {/*    right*/}
                        <BorderPath
                            d={`
        M 97 90
        L 90 90
        L 95 10
        L 91 10
        L 86 90
    `} />

                    </SVGContainer>
                    <LeftCircleSVGContainer viewBox="0 0 10 10">
                        <CircleMarker cx="5" cy="5" r="2"/>
                    </LeftCircleSVGContainer>
                    <RightCircleSVGContainer viewBox="0 0 10 10">
                        <CircleMarker cx="5" cy="5" r="2"/>
                    </RightCircleSVGContainer>
                </div>
            )}


        </ButtonContainer>
    );
};
export default FuturisticButton2;