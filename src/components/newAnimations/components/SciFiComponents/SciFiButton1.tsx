import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';

interface FuturisticButtonProps {
    text: string;
    onClick: () => void;
}

const lineAnimationTime = 15;

// First, define the keyframes
const slideDown = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

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
    stroke: rgba(64, 224, 208, 0.8);
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
const TextContainer = styled.div`
    font-family: 'Orbitron', sans-serif;
    background: linear-gradient(
            90deg,
            rgba(64, 224, 208, 0.2) 0%,
            rgba(64, 224, 208, 0.7) 25%,
            rgba(64, 224, 208, 0.7) 75%,
            rgba(64, 224, 208, 0.2) 100%
    );
    padding: 8px 80px;
    margin: 0;
    color: white;
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
        background: linear-gradient(
                90deg,
                rgba(64, 224, 208, 0.3) 0%,
                rgba(64, 224, 208, 0.9) 25%,
                rgba(64, 224, 208, 0.9) 75%,
                rgba(64, 224, 208, 0.3) 100%
        );
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
    stroke: rgba(64, 224, 208, 0.8);
    stroke-width: 2;
`;

const FuturisticButton: React.FC<FuturisticButtonProps> = ({
                                                               text,
                                                               onClick,
                                                           }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showLines, setShowLines] = useState<boolean>(false);

    // timer for lines
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLines(true);
        }, 1000);

        // Cleanup function
        return () => clearTimeout(timer);
    }, []);

    return (
        <ButtonContainer
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TextContainer>{text}</TextContainer>
            {showLines && (
                <div>
                    <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/*left*/}
                        <BorderPath
                            d={`
            M 3 65
            L 10 65
            L 15 100
            L 40 100
          `}
                        />
                        <BorderPath
                            d={`
            M 11 55
            L 15 10
          `}
                        />
                        <BorderPath
                            d={`
            M 8 55
            L 12 10
          `}
                        />
                        {/*    right*/}

                        <BorderPath
                            d={`
            M 97 35
            L 90 35
            L 85 0
            L 60 0
          `}
                        />
                        <BorderPath
                            d={`
            M 89 45
            L 85 90
          `}/>
                        <BorderPath
                            d={`
            M 92 45
            L 88 90
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