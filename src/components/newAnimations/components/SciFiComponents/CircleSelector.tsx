import React, {useState, useRef, useEffect} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";


interface CircleSliderProps {
    min?: number;
    max?: number;
    value: number;
    onChange: (value: number) => void;
}

const SliderContainer = styled.div`
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
        animation: ${slideDown} 1s ease-out forwards;
`;

const CircleTrack = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: transparent;
`;

const CircleProgress = styled.div<{ progress: number }>`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
            ${cssFormatColors.neonBlue} ${props => props.progress * 360}deg,
            #2a2a2a ${props => props.progress * 360}deg 360deg
    );
    mask: radial-gradient(
            transparent 90px,
            #000 91px,
            #000 100px,
            transparent 101px
    );
    filter: drop-shadow(0 0 10px ${() => toRGBA(cssFormatColors.neonBlue, 0.5)});
`;

const Handle = styled.div<{ angle: number }>`
    position: absolute;
    width: 30px;
    height: 10px;
    cursor: pointer;
    transform: rotate(${props => props.angle - 90}deg); // Added +90 here
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
`;

const MarkerLine = styled.div<{ angle: number }>`
    position: absolute;
    width: 20px; // Length of the line
    height: 2px;
    background: ${cssFormatColors.neonBlue};
    transform-origin: left center;
    transform: rotate(${props => props.angle}deg) translateX(100px); // 100px is the radius of your circle
`;

const Marker = styled.div<{ angle: number }>`
    position: absolute;
    width: 40px;
    height: 20px;
    color: ${cssFormatColors.neonBlue};
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center;
    transform: rotate(${props => props.angle}deg) translateY(-117px) rotate(-${props => props.angle}deg);
    font-family: 'Orbitron', sans-serif;
`;

export const CircleSlider: React.FC<CircleSliderProps> = ({
                                                              min = 1,
                                                              max = 1000,
                                                              value,
                                                              onChange
                                                          }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

        useEffect(() => {
        let startTime: number;
        const duration = 2000; // 2 seconds in milliseconds
        const startValue = 0;
        const targetValue = 500;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use easing function for smoother animation (optional)
            const eased = -Math.cos(progress * Math.PI) / 2 + 0.5;
            const currentValue = startValue + (targetValue - startValue) * eased;

            onChange(Math.round(currentValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, []);

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

        // Normalize to 0-1 range
        return degrees / 360;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const progress = calculateAngle(e.clientX, e.clientY);
        const newValue = Math.round(progress * (max - min) + min);
        onChange(Math.max(min, Math.min(max, newValue)));
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, min, max, onChange]); // Added missing dependencies

    const progress = (value - min) / (max - min);
    const angle = progress * 360;

    return (
        <SliderContainer ref={containerRef}>
            <CircleTrack/>
            <CircleProgress progress={progress}/>
            <Handle
                angle={angle}
                onMouseDown={handleMouseDown}
            >
            </Handle>
            <DottedInnerCircle/>
            <Value>{value}</Value>
            {[
                {value: 0, angle: 0},
                {value: 125, angle: 45},
                {value: 250, angle: 90},
                {value: 375, angle: 135},
                // {value: 500, angle: 180},
                {value: 625, angle: 225},
                {value: 750, angle: 270},
                {value: 875, angle: 315}
            ].map(({value, angle}) => (
                <React.Fragment key={value}>
                    <Marker angle={angle}>
                        {value}
                    </Marker>
                </React.Fragment>
            ))}
        </SliderContainer>
    );
};