import React, {useState, useRef, useEffect} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {MAX_GAME_SPEED, STEP_THROUGH_SPEED} from "../../context/GameContext";


interface CircleSliderProps {
    min?: number;
    max?: number;
    value: number;
    onChange: (value: number) => void;
    directToMenu: boolean;
}

const typeAnimation = keyframes`
    from {
        width: 0
    }
    to {
        width: 100%
    }
`;

const cursorAnimation = keyframes`
    from, to {
        border-color: transparent
    }
    50% {
        border-color: ${cssFormatColors.neonBlue}
    }
`;

const ComponentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    animation: ${slideDown} 1s ease-out forwards;
    //border: 2px solid deeppink;
    padding: 0 40px;
    max-height: 300px;

`;

const TypedTitle = styled.h2<{ $directToMenu?: boolean }>`
    font-family: 'Orbitron', sans-serif;
    color: ${cssFormatColors.neonBlue};
    text-align: center;
    margin: 0;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    margin-bottom: 10px;
    animation: ${typeAnimation} 1s steps(40, end);
    animation-delay: ${props => props.$directToMenu ? '0s' : '1s'};
    width: 0;
    animation-fill-mode: forwards;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const NonTypedTitle = styled.h2`
    font-family: 'Orbitron', sans-serif;
    color: ${cssFormatColors.neonBlue};
    text-align: center;
    margin: 0;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    margin-bottom: 10px;
    animation-fill-mode: forwards; /* Keeps the final state after animation ends */
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none;
`;

const SliderContainer = styled.div`
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    //border: 1px solid greenyellow;
`;

const CircleTrack = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: transparent;
`;

const CircleProgress = styled.div<{ $progress: number }>`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
            ${cssFormatColors.neonBlue} ${props => props.$progress * 360}deg,
            #2a2a2a ${props => props.$progress * 360}deg 360deg
    );
    mask: radial-gradient(
            transparent 90px,
            #000 91px,
            #000 100px,
            transparent 101px
    );
    filter: drop-shadow(0 0 10px ${() => toRGBA(cssFormatColors.neonBlue, 0.5)});
`;

const Handle = styled.div<{ $angle: number }>`
    position: absolute;
    width: 30px;
    height: 10px;
    cursor: pointer;
    transform: rotate(${props => props.$angle - 90}deg); // Added +90 here
    z-index: 2;

    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: ${cssFormatColors.neonBlue};
        transform-origin: center left;
        transform: translateX(90px) perspective(10px) rotateY(-5deg);
        box-shadow: 0 0 15px ${cssFormatColors.neonBlue};
    }
`;

const DottedInnerCircle = styled.div`
    position: absolute;
    width: 130px; // smaller than main circle
    height: 130px;
    border-radius: 50%;
    border: 2px dotted ${cssFormatColors.neonBlue};
    filter: drop-shadow(0 0 5px ${cssFormatColors.neonBlue});
    animation: rotate 30s linear infinite;

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;

const Value = styled.div`
    font-size: 32px;
    color: ${cssFormatColors.neonBlue};
    text-shadow: 0 0 10px ${cssFormatColors.neonBlue};
    font-family: 'Orbitron', sans-serif;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
        z-index: 1000;
    cursor: pointer; // Add this
`;

const Input = styled.input`
    font-size: 32px;
    color: ${cssFormatColors.neonBlue};
    text-shadow: 0 0 10px ${cssFormatColors.neonBlue};
    font-family: 'Orbitron', sans-serif;
    text-align: center;
    max-width: 80px;
    z-index: 1000;
    background: transparent;
    width: 100%;
    border: none;
    -moz-appearance: textfield; /* Remove arrows in Firefox */
    
    /* Remove arrows in Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    
    &:focus {
        outline: none;
        border-bottom: none;
        // box-shadow: 0 2px 8px ${cssFormatColors.neonBlue};
    }
`;

const MarkerLine = styled.div<{ $angle: number }>`
    position: absolute;
    width: 20px; // Length of the line
    height: 2px;
    background: ${cssFormatColors.neonBlue};
    transform-origin: left center;
    transform: rotate(${props => props.$angle}deg) translateX(100px); // 100px is the radius of your circle
`;

const Marker = styled.div<{ $angle: number }>`
    position: absolute;
    width: 40px;
    height: 20px;
    color: ${cssFormatColors.neonBlue};
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center;
    transform: rotate(${props => props.$angle}deg) translateY(-117px) rotate(-${props => props.$angle}deg);
    font-family: 'Orbitron', sans-serif;
`;

const MarkerValue = styled.div`
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none;
`;

const DIAL_SPAN_DEGREES = 330;

export const CircleSlider: React.FC<CircleSliderProps> = ({
                                                              min = STEP_THROUGH_SPEED,
                                                              max = MAX_GAME_SPEED,
                                                              value,
                                                              onChange,
    directToMenu
                                                          }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const calculateAngle = (clientX: number, clientY: number) => {
        if (!containerRef.current) return 0;

        const rect = containerRef.current.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        // Calculate angle based on mouse position relative to center
        let angle = Math.atan2(clientY - center.y, clientX - center.x);

        // Convert to degrees and normalize
        let degrees = (angle * 180) / Math.PI;
        degrees = degrees + 90; // Rotate by 90 degrees to match your layout
        if (degrees < 0) degrees += 360;

        return degrees;
    };

    const getAngleForValue = (speed: number) => {
        const speedProgress = (speed - min) / (max - min);
        return speedProgress * DIAL_SPAN_DEGREES;
    };

    const getValueFromAngle = (degrees: number) => {
        const values = Array.from({length: max - min + 1}, (_, index) => min + index);
        return values.reduce((nearestValue, currentValue) => {
            const nearestDistance = Math.abs(((degrees - getAngleForValue(nearestValue) + 540) % 360) - 180);
            const currentDistance = Math.abs(((degrees - getAngleForValue(currentValue) + 540) % 360) - 180);
            return currentDistance < nearestDistance ? currentValue : nearestValue;
        });
    };

    const clampValue = (newValue: number) =>
        Math.max(min, Math.min(max, Math.round(newValue)));

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        onChange(getValueFromAngle(calculateAngle(e.clientX, e.clientY)));
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, min, max, onChange]); // Added missing dependencies

    const angle = getAngleForValue(value);
    const progress = angle / 360;

    const handleValueChange = (newValue: number) => {
        onChange(clampValue(newValue));
    };


    return (
        <ComponentWrapper>
            <TypedTitle $directToMenu={directToMenu}>Game Speed</TypedTitle>
            <SliderContainer ref={containerRef}>
                <CircleTrack/>
                <CircleProgress $progress={progress}/>
                <Handle
                    $angle={angle}
                    onMouseDown={handleMouseDown}
                >
                </Handle>
                <DottedInnerCircle/>
                {isEditing ? (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleValueChange(Number(e.target.value))}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                    />
                ) : (
                    <Value onClick={() => setIsEditing(true)}>
                        {value === STEP_THROUGH_SPEED ? 'STEP' : value}
                    </Value>
                )} {Array.from({length: max - min + 1}, (_, index) => min + index).map((markerValue) => (
                <React.Fragment key={markerValue}>
                    <Marker $angle={getAngleForValue(markerValue)}>
                        <MarkerValue>{markerValue === STEP_THROUGH_SPEED ? 'STEP' : markerValue}</MarkerValue>
                    </Marker>
                </React.Fragment>
            ))}
            </SliderContainer>
        </ComponentWrapper>
    );
};
