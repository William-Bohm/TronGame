import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {useIsMobile} from "../../ThreeScene3";

interface FuturisticButtonProps {
    text: string;
    onClick: () => void;
}


const baseLineAnimationTime = 2;


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
    //height: 100%;
    width: 100%;
    min-width: 300px;

    aspect-ratio: 4 / 5;
    @media (min-width: 1600px) {
        width: 80%;
    }

    @media (max-width: 1400px) {
        aspect-ratio: 2 / 3;
    }
    @media (max-width: 1200px) {
        aspect-ratio: 3 / 5;
    }
    @media (max-width: 1000px) {
        aspect-ratio: 5 / 5;
        width: 90%
    }
    @media (max-width: 900px) {
        aspect-ratio: 5 / 5;
    }


    @media (max-width: 650px) {
        aspect-ratio: 3 / 5;
    }
`;
const SVGContainer = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;

interface BorderPathProps {
   strokeWidth?: number;
   animationSpeed?: number;
   color?: string;
}

const BorderPath = styled.path<BorderPathProps>`
   fill: none;
   stroke: ${props => props.color || toRGBA(cssFormatColors.neonBlue, 1)};
   stroke-width: ${props => props.strokeWidth || 2}px;
   stroke-dasharray: 1000;
   stroke-dashoffset: 1000;
   animation: drawLine ${props => props.animationSpeed || baseLineAnimationTime}s forwards;
   @keyframes drawLine {
       to {
           stroke-dashoffset: 0;
       }
   }
`;

const TextElement = styled.div`
    position: absolute;
    top: 20%;
    left: 20%;
    transform: translate(-50%, -50%);
        font-family: 'Orbitron', sans-serif;

    font-weight: 500;
    font-size: 2.5rem;
    width: 90%; // Control text width
`;
interface TextContainerProps {
    isMobile: boolean;
}

const TextContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: radial-gradient(
            circle at center,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.4)} 0%,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 50%,
            ${() => toRGBA(cssFormatColors.neonBlue, 0.2)} 80%
    );
    padding: '8px 8px';
    margin: 0;
    color: ${() => toRGBA(cssFormatColors.darkGrey, 0.8)};
    transition: all 0.3s ease;
    height: 100%;
    width: 100%;

    overflow: hidden;

    clip-path: polygon(
            7% 10%,
            20% 10%,
            35% 10%,
            37% 13%, /* turn*/ 65% 13%,
            68% 16%, /* turn*/ 75% 16%,
            92% 16%, /* turn*/ 95% 19%,
            95% 31%,
            95% 70%,
            98% 73%, /* turn*/ 98% 87%,
            95% 90%, /* turn*/ 65% 90%,
            40% 90%,
            37% 93%, /* turn*/ 12% 93%,
            5% 86%,
            5% 35%,
            0% 30%,
            0% 17%
    );

    text-align: center;

    ${ButtonContainer}:hover & {
    }
`;

const HeaderContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: ${() => toRGBA(cssFormatColors.neonBlue, 0.5)};
    //padding: '8px 8px';
    margin: 0;
    color: orangered;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    height: 100%;
    width: 100%;
    overflow: hidden;
    min-width: 300px;

    clip-path: polygon(
            8% 11%,
            34% 11%,
            36% 14%,
            64% 14%,
            67% 17%,
            
            /* right corner*/
            92% 17%,
            94% 19%,
            94% 21%,
            92% 19%,
            88% 19%,
            
            /* bottom bump*/
            92% 19%,
            70% 19%,
            67% 19%,
            60% 19%,
            
            52% 27%,
            7% 27%,
            1% 23%,
            1% 17%
    );

    text-align: center;
`;


const LeftCircleSVGContainer = styled.svg`
    position: absolute;
    left: 0;
    top: 65%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const RightCircleSVGContainer = styled.svg`
    position: absolute;
    right: 0;
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

const PlayerSelector: React.FC<FuturisticButtonProps> = ({
                                                             text,
                                                             onClick,
                                                         }) => {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showLines, setShowLines] = useState<boolean>(false);
    const [showDiagnolArrayLines, setShowDiagnolArrayLines] = useState<boolean>(false);
    // const []


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
            <TextContainer isMobile={isMobile}>
                <HeaderContainer isMobile={isMobile}>
                </HeaderContainer>
                <TextElement>Players</TextElement>
            </TextContainer>
            {showLines && (
                <div>
                    <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/*                        all the way around*/}
                        <BorderPath
                            d={`
        M 0.5 30.5
        L 0.5 17
        L 8 9.5
        L 36.5 9.5
        L 38.5 12.5
        L 65.5 12.5
        L 68.5 15.5
        L 91.5 15.5
        L 94.5 19
        L 94.5 69.5
        L 97.5 72.5
        L 97.5 87
        L 94 90.5
        L 41 90.5
        L 38 93.5
        L 12.5 93.5
        L 5.5 86
        L 5.5 35.5
        L 0.5 30.5
    `}
                            animationSpeed={1} // 12 is good
                            strokeWidth={0.5}
                        />

                        {/*top thicks*/}

                        <BorderPath
                            d={`
        M 38.5 11.8
        L 67.5 11.8

    `}
                            animationSpeed={1}
                            strokeWidth={2}
                        />
                        <BorderPath
                            d={`
        M 39 11.17
        L 38 11.8

    `}
                            animationSpeed={1}
                            strokeWidth={1}
                        />
                        <BorderPath
                            d={`
        M 66.5 11.8
        L 69.5 14.8

    `}
                            animationSpeed={1}
                            strokeWidth={3}
                        />
                        <BorderPath
                            d={`
        M 68.5 14
        L 92 14

    `}
                            animationSpeed={1}
                            strokeWidth={3.5}
                        />
                        <BorderPath
                            d={`
        M 91 13.05
        L 95.5 18.2

    `}
                            animationSpeed={1}
                            strokeWidth={2.5}
                        />
                        <BorderPath
                            d={`
        M 95.5 17.5
        L 95.5 69.5

    `}
                            animationSpeed={1}
                            strokeWidth={1.8}
                        />
                        <BorderPath
                            d={`
        M 95.7 69
        L 95 70

    `}
                            animationSpeed={1}
                            strokeWidth={1.8}
                        />


                        {/*             bottom           repeats*/}
                        {Array.from({length: 17}).map((_, index) => (
                            <BorderPath
                                key={index}
                                d={`
            M ${88 - (index * 3)} 94.5
            L ${91 - (index * 3)} 91.5
        `}
                                animationSpeed={100}
                                strokeWidth={1.5}
                            />
                        ))}

                        {/*             top           repeats*/}
                        {Array.from({length: 8}).map((_, index) => (
                            <BorderPath
                                key={index}
                                d={`
            M ${89 - (index * 3)} 13
            L ${91 - (index * 3)} 15
        `}
                                animationSpeed={100}
                                strokeWidth={1.5}
                                color={toRGBA(cssFormatColors.darkGrey, 1)}
                            />
                        ))}


                    </SVGContainer>
                </div>
            )}


        </ButtonContainer>
    );
};
export default PlayerSelector;