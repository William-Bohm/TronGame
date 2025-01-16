import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {useIsMobile} from "../../ThreeScene3";

interface FuturisticButtonProps {
    text: string;
    onClick: () => void;
}


const lineAnimationTime = 20;


// Then modify your ButtonContainer
const ButtonContainer = styled.div`
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
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
            ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 0%,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.9)} 25%,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.9)} 75%,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 100%
    );
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
    color: black;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    clip-path: polygon(
            15% 0%,
            85% 0%,
            90% 35%,
            85% 100%,
            15% 100%,
            10% 65%
    );
    //min-width: 200px;

    text-align: center;

    ${ButtonContainer}:hover & {
        color: black;
        background: linear-gradient(
                90deg,
                ${() => toRGBA(cssFormatColors.neonBlue, 1)} 0%,
                ${() => toRGBA(cssFormatColors.neonBlue, 1)} 25%,
                ${() => toRGBA(cssFormatColors.neonBlue, 1)} 75%,
                ${() => toRGBA(cssFormatColors.neonBlue, 1)} 100%
        );
    }
`;

const LeftCircleSVGContainer = styled.svg`
    position: absolute;
    left: 1%;
    top: 65%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const RightCircleSVGContainer = styled.svg`
    position: absolute;
    right: 1%;
    top: 36%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const CircleMarker = styled.circle`
    fill: none;
    stroke: ${() => toRGBA(cssFormatColors.neonBlue, 0.8)};;
    stroke-width: 2;
`;

const FuturisticButton: React.FC<FuturisticButtonProps> = ({
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
                        {/*left*/}
                        <BorderPath
                            d={`
            M 3 65
            L 10 65
            L 15.5 100
            L 40 100
          `}
                        />
                        <BorderPath
                            d={`
            M 10.5 55
            L 14.5 10
          `}
                        />
                        <BorderPath
                            d={`
            M 7.5 55
            L 11.5 10
          `}
                        />
                        {/*    right*/}

                        <BorderPath
                            d={`
            M 97 35
            L 90 35
            L 84 0
            L 60 0
          `}
                        />
                        <BorderPath
                            d={`
            M 89.5 45
            L 85.5 90
          `}/>
                        <BorderPath
                            d={`
            M 92.5 45
            L 88.5 90
          `}/>


                    </SVGContainer>
                    <LeftCircleSVGContainer viewBox="0 0 10 10">
                        <CircleMarker cx="5" cy="5" r="3"/>
                    </LeftCircleSVGContainer>
                    <RightCircleSVGContainer viewBox="0 0 10 10">
                        <CircleMarker cx="5" cy="5" r="3"/>
                    </RightCircleSVGContainer>
                </div>
            )}


        </ButtonContainer>
    );
};
export default FuturisticButton;