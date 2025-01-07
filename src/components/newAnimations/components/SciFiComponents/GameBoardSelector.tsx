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
    height: 350px;
    width: 300px;
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
}

const BorderPath = styled.path<BorderPathProps>`
    fill: none;
    stroke: ${() => toRGBA(cssFormatColors.neonBlue, 0.8)};
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
    color: black;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    height: 350px;
    width: 300px;
    overflow: hidden;

    clip-path: polygon(
        /* Top */ 5% 10%, /* Top-left */ 20% 10%, /* First peak on top */ 45% 10%, /* First dip on top */ 50% 15%, /* Second peak on top */ 65% 15%, /* Second dip on top */ 95% 15%, /* Third peak on top */ /* Right */ 100% 20%, /* Top-right */ 100% 25%, /* Additional point on right */ 100% 28%, /* Right edge */ 97% 31%, /* Curve inward on the right */ 97% 60%, /* Right-bottom edge */ 100% 63%, /* Additional point on right */ 100% 85%, /* Bottom-right */ /* Bottom */ 95% 90%, /* Third peak on bottom */ 65% 90%, /* Second dip on bottom */ 50% 90%, /* Second peak on bottom */ 35% 90%, /* First dip on bottom */ 18% 90%, /* First peak on bottom */ /* Left */ 5% 80%, /* Bottom-left */ 5% 80%, /* Additional point on left */ 5% 70%, /* Left-bottom edge */ 5% 35%, /* Curve inward on the left */ 0% 30%, /* Additional point on left */ 0% 15% /* Left edge */
    );

    text-align: center;

    ${ButtonContainer}:hover & {
    }
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

const GameBoardSelector: React.FC<FuturisticButtonProps> = ({
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
                {/*{text}*/}
            </TextContainer>
            {showLines && (
                <div>
                    <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/*                        all the way around*/}
                        <BorderPath
                            d={`
        M 1.7 30
        L 1.7 16
        L 6.5 9.9
        L 46 9.9
        L 51 15
        L 92.5 15
        L 98 20.5
        L 98 29
        L 95 32
        L 95 59.5
        L 98 62
        L 98 84.5
        L 92.5 90
        L 19.5 90
        L 6 79
        L 6 35
        L 1.7 30
    `}
                            animationSpeed={1} // 12 is good
                            strokeWidth={0.5}
                        />
                        {/*left thick*/}
                        <BorderPath
                            d={`
        M 4.5 30
        L 8.5 35
        L 8.5 53

    `}
                            animationSpeed={40}
                            strokeWidth={1.5}
                        />
                        {/*right thick*/}

                        <BorderPath
                            d={`
        M 95 62
        L 95 83
        L 90 88

    `}
                            animationSpeed={40}
                            strokeWidth={1.5}
                        />
                        {/*    left bars*/}
    {/*                    <BorderPath*/}
    {/*                        d={`*/}
    {/*    M 0 50*/}
    {/*    L 4.5 52*/}
    {/*`}*/}
    {/*                        animationSpeed={40}*/}
    {/*                        strokeWidth={1.5}*/}
    {/*                    />*/}
                        {Array.from({ length: 11 }).map((_, index) => (
                            <BorderPath
                                key={index}
                                d={`
                                    M 1 ${73 - (index * 4)}
                                    L 4.5 ${77 - (index * 4)} 
                                `}
                                animationSpeed={100}
                                strokeWidth={1.5}
                            />
                        ))}


                    </SVGContainer>
                </div>
            )}


        </ButtonContainer>
    );
};
export default GameBoardSelector;