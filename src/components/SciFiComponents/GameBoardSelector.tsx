import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {useIsMobile} from "../intro/ThreeScene3";
import AnimatedRings from "./AnimatedRings";
import {useTronContext} from "../../context/GameContext";
import {useSound} from "../../context/AudioContext";
import {div} from "shader-composer/fun";

interface FuturisticButtonProps {
    text: string;
    onClick: () => void;
    directToMenu: boolean;
}


const baseLineAnimationTime = 2;


// Then modify your ButtonContainer
const ButtonContainer = styled.div`
    position: relative;
    //cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    transition: all 0.3s ease;
    animation: ${slideDown} 1s ease-out forwards;
    //height: 350px;
    //width: 300px;
    height: 100%;
    width: 100%;
    min-width: 300px;
    max-width: 400px;
    max-height: 500px;
    aspect-ratio: 4 / 5;
        // border: 2px solid ${cssFormatColors.neonBlue};
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
    $animationSpeed?: number;  // Add $ prefix here
    color?: string;
}

const BorderPath = styled.path<BorderPathProps>`
    fill: none;
    stroke: ${props => props.color || toRGBA(cssFormatColors.neonBlue, 1)};
    stroke-width: ${props => props.strokeWidth || 2}px;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine ${props => props.$animationSpeed || baseLineAnimationTime}s forwards;
    @keyframes drawLine {
        to {
            stroke-dashoffset: 0;
        }
    }
`;

const InnerContent = styled.div<{ isMobile?: boolean }>`
    position: absolute;
    width: 80%;
    height: 52%;
    top: 32%;
    left: 12%;
    padding-left: 10px;
    margin: 0 auto; // This will center it horizontally
    //border: 2px solid red;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: space-between;
`;

const TextElement = styled.div`
    position: absolute;
    top: 22%;
    left: 33%;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', sans-serif;
    color: ${cssFormatColors.darkGrey};

    font-weight: 600;
    width: 90%; // Control text width
    font-size: 1.7rem;
    @media (max-width: 375px) {
        font-size: 1.5rem;
        left: 36%;
    }
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none;
`;

const HeaderContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: ${() => toRGBA(cssFormatColors.neonBlue, 0.75)};
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
            8% 12%,
            44% 12%,
            49% 17%,
            93% 17%,
            86% 20%,
            70% 20%,
            58% 29%,
            10% 29%,
            4% 23%,
            4% 17%
    );

    text-align: center;
`;

interface TextContainerProps {
    $isMobile: boolean;
}

const TextContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    // background: 
    //     radial-gradient(
    //         circle at center,
        //         ${() => toRGBA(cssFormatColors.neonBlue, 0.4)} 0%,
        //         ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 50%,
        //         ${() => toRGBA(cssFormatColors.neonBlue, 0.2)} 80%
    //     ),
        //     ${() => toRGBA(cssFormatColors.darkGrey, .2)}; 
    padding: '8px 8px';
    margin: 0;
    color: black;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    //height: 350px;
    //width: 300px;
    height: 100%;
    width: 100%;
    overflow: hidden;

    clip-path: polygon(
        /* Top */ 5% 10%, /* Top-left */ 20% 10%, /* First peak on top */ 45% 10%, /* First dip on top */ 50% 15%, /* Second peak on top */ 65% 15%, /* Second dip on top */ 95% 15%, /* Third peak on top */ /* Right */ 100% 20%, /* Top-right */ 100% 25%, /* Additional point on right */ 100% 28%, /* Right edge */ 97% 31%, /* Curve inward on the right */ 97% 60%, /* Right-bottom edge */ 100% 63%, /* Additional point on right */ 100% 85%, /* Bottom-right */ /* Bottom */ 95% 90%, /* Third peak on bottom */ 65% 90%, /* Second dip on bottom */ 50% 90%, /* Second peak on bottom */ 35% 90%, /* First dip on bottom */ 18% 90%, /* First peak on bottom */ /* Left */ 5% 80%, /* Bottom-left */ 5% 80%, /* Additional point on left */ 5% 70%, /* Left-bottom edge */ 5% 35%, /* Curve inward on the left */ 0% 30%, /* Additional point on left */ 0% 15% /* Left edge */
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
    stroke: ${() => toRGBA(cssFormatColors.neonBlue, 0.8)};
    stroke-width: 2;
`;

// grid selector
const Container = styled.div`
    display: flex;
    flex-direction: column;
    //gap: 16px;
    width: 100%;
`;

const SelectorButton = styled.button<{ $isSelected: boolean }>`
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding-top: 4px;
    background: none;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    color: ${cssFormatColors.neonBlue};
    transition: border-color 0.2s ease;

    &:hover {
        border-color: ${() => toRGBA(cssFormatColors.neonBlue, 0.4)};
    }
`;

const ButtonText = styled.span`
    font-size: 16px;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none;
`;

interface GridOption {
    width: number;
    height: number;
    label: string;
}

const gridOptions: GridOption[] = [
    {width: 10, height: 10, label: '10 x 10'},
    {width: 50, height: 50, label: '50 x 50'},
    {width: 100, height: 100, label: '100 x 100'},
    {width: 200, height: 200, label: '200 x 200'},
];

const GameBoardSelector: React.FC<FuturisticButtonProps> = ({
                                                                text,
                                                                onClick,
                                                                directToMenu
                                                            }) => {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showLines, setShowLines] = useState<boolean>(false);
    const [showDiagnolArrayLines, setShowDiagnolArrayLines] = useState<boolean>(false);
    const [showThickLines, setShowThickLines] = useState<boolean>(false);
    const {updateGridSize, gridSize} = useTronContext();
    const {
        withSound,
    } = useSound();
    const isSelected = (option: GridOption) =>
        gridSize.width === option.width && gridSize.height === option.height;

    const handleSelect = (option: GridOption) => {
        updateGridSize(option.width, option.height);
    };

    // timer for lines
    useEffect(() => {
        if (directToMenu) {
            setShowLines(true);
            setTimeout(() => {
                setShowThickLines(true);
            }, 200);

            setTimeout(() => {
                setShowDiagnolArrayLines(true);
            }, 1000);
        }


        const timer = setTimeout(() => {
            setShowLines(true);
        }, 300);

        setTimeout(() => {
            setShowThickLines(true);
        }, 1200);

        setTimeout(() => {
            setShowDiagnolArrayLines(true);
        }, 2000);

        // Cleanup function
        return () => clearTimeout(timer);
    }, []);

    const thinLineSpeed = directToMenu ? 0.001 : 10;

    return (
        <ButtonContainer>
            <TextContainer $isMobile={isMobile}>
                <HeaderContainer $isMobile={isMobile}>
                </HeaderContainer>
                <TextElement>Game Board</TextElement>
                <InnerContent>
                    <Container>
                        {gridOptions.map((option) => (
                            <SelectorButton
                                key={`${option.width}x${option.height}`}
                                $isSelected={isSelected(option)}
                                // onClick={() => handleSelect(option)}
                                onClick={() => withSound(() => handleSelect(option))()}

                            >
                                <AnimatedRings
                                    size={40}
                                    $isSelected={isSelected(option)}

                                />
                                <ButtonText>{option.label}</ButtonText>
                            </SelectorButton>
                        ))}
                    </Container>
                </InnerContent>
                {/*{text}*/}
            </TextContainer>
            {showLines && (
                <div>
                    <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/*                        all the way around*/}
                        <BorderPath
                            d={`
        M 3 30
        L 3 16
        L 7.5 9.9
        L 45.5 9.9
        L 50.5 15
        L 92.5 15
        L 97 20.5
        L 97 28
        L 94 31
        L 94 59.5
        L 97 63
        L 97 84.5
        L 92.5 90
        L 19.5 90
        L 7.7 79
        L 7.7 35
        L 3 30
    `}
                            $animationSpeed={thinLineSpeed} // 12 is good
                            strokeWidth={0.5}
                        />

                        {showThickLines && (
                            <>
                                {/*left thick*/}
                                <BorderPath
                                    d={`
        M 5.7 30
        L 9.7 34.5
        L 9.7 53

    `}
                                    $animationSpeed={40}
                                    strokeWidth={1.5}
                                />
                                {/*right thick*/}

                                <BorderPath
                                    d={`
        M 95 63
        L 95 84
        L 91.5 88.5

    `}
                                    $animationSpeed={40}
                                    strokeWidth={1.5}
                                />
                            </>
                        )}

                        {/*    left bars*/}
                        {/*                    <BorderPath*/}
                        {/*                        d={`*/}
                        {/*    M 0 50*/}
                        {/*    L 4.5 52*/}
                        {/*`}*/}
                        {/*                        $animationSpeed={40}*/}
                        {/*                        strokeWidth={1.5}*/}
                        {/*                    />*/}
                        {showDiagnolArrayLines && (
                            <>
                                {Array.from({length: 11}).map((_, index) => (
                                    <BorderPath
                                        key={index}
                                        d={`
                                    M 1 ${73 - (index * 4)}
                                    L 4.5 ${77 - (index * 4)} 
                                `}
                                        $animationSpeed={100}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </>
                        )}


                    </SVGContainer>
                </div>
            )}


        </ButtonContainer>
    );
};
export default GameBoardSelector;