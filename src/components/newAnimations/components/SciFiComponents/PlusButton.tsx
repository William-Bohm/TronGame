import React from 'react';
import styled, {keyframes} from 'styled-components';
import {Plus} from 'react-feather';
import {cssFormatColors, toRGBA} from "../../../../threeJSMeterials";

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const ButtonWrapper = styled.button`
    position: relative;
    width: 60px;
    height: 60px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    overflow: visible;
`;

const StyledSVG = styled.svg`
    position: absolute;
    width: 100%;
    height: 100%;
    animation: ${spin} 20s linear infinite;
    filter: drop-shadow(0 0 5px ${toRGBA(cssFormatColors.neonBlue, 1)});
`;

const IconWrapper = styled.div`
    position: relative;
    z-index: 2;
    color: ${toRGBA(cssFormatColors.neonBlue, 1)};
    filter: drop-shadow(0 0 3px ${toRGBA(cssFormatColors.neonBlue, 0.2)});
    transition: transform 0.3s ease-in-out;

    ${ButtonWrapper}:hover & {
        transform: scale(1.4);
    }
`;

interface NeonButtonProps {
    onClick?: () => void;
    size?: number;
}

export const CircleButton: React.FC<NeonButtonProps> = ({
                                                            onClick,
                                                            size = 60
                                                        }) => {
    const neonBlueRGBA = toRGBA(cssFormatColors.neonBlue, 1);

    return (
        <ButtonWrapper onClick={onClick} style={{width: size, height: size}}>
            <StyledSVG viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={neonBlueRGBA}
                    strokeWidth="1"
                    strokeDasharray="10 5"
                />

                <path
                    d="M 30,50 L 40,50 M 60,50 L 70,50 M 50,30 L 50,40 M 50,60 L 50,70"
                    stroke={neonBlueRGBA}
                    strokeWidth="1"
                />
                {[0, 90, 180, 270].map((angle) => (
                    <circle
                        key={angle}
                        cx={50 + 30 * Math.cos((angle * Math.PI) / 180)}
                        cy={50 + 30 * Math.sin((angle * Math.PI) / 180)}
                        r="2"
                        fill={neonBlueRGBA}
                    />
                ))}
            </StyledSVG>

            <IconWrapper>
                <Plus size={32}/>
            </IconWrapper>
        </ButtonWrapper>
    );
};