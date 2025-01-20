import React, {useEffect, useRef, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA, toHSLA} from "../../../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {useIsMobile} from "../../ThreeScene3";
import {Player} from "../../../../context/GameContext";
import AnimatedRings from "./AnimatedRings";

interface FuturisticButtonProps {
    player: Player;
}


const lineAnimationTime = 11;


// Then modify your ButtonContainer
const ButtonContainer = styled.div`
    position: relative;
    //cursor: pointer;
    display: flex;
    align-items: end;
    justify-content: center;
    padding: 0;
    transition: all 0.3s ease;
    animation: ${slideDown} 1s ease-out forwards;
    //border: 1px solid greenyellow;
    min-height: 60px;
    height: 60px;
    min-width: 320px;
    width: 320px;
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

const baseLineAnimationTime = 2;

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

interface TextContainerProps {
    isMobile: boolean;
}

const TextContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: ${() => toRGBA(cssFormatColors.neonBlue, 0.2)};
    padding: 8px 30px 8px 20px;
        // min-width: ${props => props.isMobile ? '25vw' : '300px'};
    height: 45px;
    width: 300px;
    white-space: nowrap;
    margin: 0;
    color: white;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    clip-path: polygon(
            5% 0%,
            100% 0%,
            95% 100%,
            0% 100%
    );
    flex-direction: row;
    display: flex;
    justify-content: space-between;
    align-content: space-between;
    text-align: left;
`;

const LeftTextContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: ${() => toRGBA(cssFormatColors.neonBlue, 0.2)};
    padding: 8px 30px 8px 20px;
        // min-width: ${props => props.isMobile ? '25vw' : '300px'};
    height: 45px;
    width: 300px;
    white-space: nowrap;
    margin: 0;
    color: white;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    clip-path: polygon(
            0% 0%,
            95% 0%,
            100% 100%,
            5% 100%
    );
    flex-direction: row;
    display: flex;
    justify-content: space-between;
    align-content: space-between;
    text-align: left;
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


export const PlayerScoreComponents: React.FC<FuturisticButtonProps> = ({
                                                                   player
                                                               }) => {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showBaseLines, setShowBaseLines] = useState<boolean>(false);
    const [showMediumLines, setShowMediumLines] = useState<boolean>(false);
    const [showLargeLines, setShowLargeLines] = useState<boolean>(false);
    // timer for lines
    useEffect(() => {
        setTimeout(() => {
            setShowBaseLines(true);
        }, 0);

        setTimeout(() => {
            setShowMediumLines(true);
        }, 1000);

        setTimeout(() => {
            setShowLargeLines(true);
        }, 1300);


    }, []);

    return (
        <ButtonContainer
            // onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TextContainer isMobile={isMobile}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <AnimatedRings
                        size={40}
                        isSelected={true}
                        color={player.color}
                    />
                    <PlayerNameContainer style={{paddingLeft: 6}}>{player.name}
                    </PlayerNameContainer>
                </div>
                <div>{player.score}</div>
            </TextContainer>
            <div>
                <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                    {showBaseLines && (<BorderPath
                        d={`
        M 4 100
        L 9 24
        L 100 24
    `}
                        animationSpeed={10} // 12 is good
                        strokeWidth={2}/>)}

                    {showMediumLines && (
                        <BorderPath
                            d={`
        M 25 24
        L 26 21
        L 100 21
    `}
                            animationSpeed={10} // 12 is good
                            strokeWidth={5}/>
                    )}

                    {showLargeLines && (
                        <BorderPath
                            d={`
        M 55 22                 
        L 56 17
        L 100 17
    `}
                            animationSpeed={10} // 12 is good
                            strokeWidth={10}/>
                    )}


                </SVGContainer>
            </div>


        </ButtonContainer>
    );
};

const PlayerNameContainer = styled.div`
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const LeftPlayerScoreComponent: React.FC<FuturisticButtonProps> = ({
                                                                   player
                                                               }) => {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showBaseLines, setShowBaseLines] = useState<boolean>(false);
    const [showMediumLines, setShowMediumLines] = useState<boolean>(false);
    const [showLargeLines, setShowLargeLines] = useState<boolean>(false);
    // timer for lines
    useEffect(() => {
        setTimeout(() => {
            setShowBaseLines(true);
        }, 0);

        setTimeout(() => {
            setShowMediumLines(true);
        }, 1000);

        setTimeout(() => {
            setShowLargeLines(true);
        }, 1300);
    }, []);

    return (
        <ButtonContainer
            // onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <LeftTextContainer isMobile={isMobile}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <AnimatedRings
                        size={40}
                        isSelected={true}
                        color={player.color}
                    />
                    <PlayerNameContainer style={{paddingLeft: 6}}>{player.name}
                    </PlayerNameContainer>
                </div>
                <div>{player.score}</div>
            </LeftTextContainer>
            <div>
                <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                    {showBaseLines && (<BorderPath
                        d={`
        M 96 100
        L 91 24
        L 0 24
    `}
                        animationSpeed={10} // 12 is good
                        strokeWidth={2}/>)}

                    {showMediumLines && (
                        <BorderPath
                            d={`
        M 75 24
        L 74 21
        L 0 21
    `}
                            animationSpeed={10} // 12 is good
                            strokeWidth={5}/>
                    )}

                    {showLargeLines && (
                        <BorderPath
                            d={`
        M 45 22                 
        L 44 17
        L 0 17
    `}
                            animationSpeed={10} // 12 is good
                            strokeWidth={10}/>
                    )}


                </SVGContainer>
            </div>


        </ButtonContainer>
    );
};

