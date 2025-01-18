import styled, {keyframes, css} from 'styled-components';
import {useState} from "react";
import {cssFormatColors, toRGBA} from "../../../../threeJSMeterials";

const baseLineAnimationTime = 2;


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

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const slideUp = keyframes`
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: ${cssFormatColors.neonBlue};
`;

export const ModalOverlay = styled.div<{ isClosing: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    //background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1010;
    animation: ${props => props.isClosing
            ? css`${fadeIn} 0.3s ease-out reverse`
            : css`${fadeIn} 0.3s ease-out`};
`;

export const ModalContent = styled.div<{ isClosing: boolean }>`
    background-color: ${toRGBA(cssFormatColors.neonBlue, 0.1)};
    color: ${cssFormatColors.neonBlue};
    padding: 20px;
    position: relative;
    max-width: 500px;
    min-height: 300px;
    width: 90%;
    animation: ${props => props.isClosing
            ? css`${slideUp} 0.3s ease-out reverse`
            : css`${slideUp} 0.3s ease-out`};
`;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const SciFiModal: React.FC<ModalProps> = ({isOpen, onClose, children}) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const animationSpeed = 10;

    if (!isOpen) return null;

    return (
        <ModalOverlay
            onClick={handleOverlayClick}
            isClosing={isClosing}
        >
            <ModalContent isClosing={isClosing}>
                <CloseButton onClick={handleClose}>×</CloseButton>
                {children}
                <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* left top*/}
                    <BorderPath
                        d={`
        M 0 0
        L 50 0  
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={0.5}
                    />
                    <BorderPath
                        d={`
        M 0 0
        L 5 0  
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={5}
                    />

                    {/*    right top*/}
                    <BorderPath
                        d={`
        M 100 0
        L 50 0  
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={0.5}
                    />
                    <BorderPath
                        d={`
        M 100 0
        L 95 0  
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={5}
                    />

                    {/*                    left bottom*/}
                    <BorderPath
                        d={`
        M 0 100
        L 50 100  
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={0.5}
                    />
                    <BorderPath
                        d={`
        M 0 100
        L 5 100 
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={5}
                    />
                    {/*    right bottom*/}
                    <BorderPath
                        d={`
        M 100 100
        L 50 100  
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={0.5}
                    />
                    <BorderPath
                        d={`
        M 100 100
        L 95 100 
    `}
                        animationSpeed={animationSpeed} // 12 is good
                        strokeWidth={5}
                    />

                </SVGContainer>
            </ModalContent>
        </ModalOverlay>
    );
};