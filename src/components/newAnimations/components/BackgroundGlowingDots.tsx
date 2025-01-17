// BackgroundGlowingDots.tsx
import React, {useEffect, useState} from 'react';
import styled, {keyframes} from 'styled-components';

interface Dot {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
}


const moveUpAndFade = keyframes`
    0% {
        opacity: 0;
        transform: translateY(0);
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 0;
        transform: translateY(-80px);
    }
`;

const Dot = styled.div<{ size: number; duration: number }>`
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    box-shadow: 0 0 ${props => props.size * 2}px ${props => props.size / 2}px rgba(255, 255, 255, 0.5),
    0 0 ${props => props.size}px ${props => props.size / 4}px rgba(255, 255, 255, 0.5);
    animation: ${moveUpAndFade} ${props => props.duration}s ease-in-out forwards;
`;

const DotContainer = styled.div`
    position: fixed;
    top: 5%;
    left: 10%;
    width: 90%;
    height: 85%;
    z-index: -1;
    pointer-events: none;
`;

const GlowingDots: React.FC = () => {
    const [dots, setDots] = useState<Dot[]>([]);

    useEffect(() => {
        const createDot = () => {
            const duration = Math.random() * 2000 + 2000; // Random between 2000ms and 4000ms
            const newDot: Dot = {
                id: Math.random(),
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 8 + 8,
                duration: duration / 1000  // Convert to seconds for CSS animation
            };

            setDots(prevDots => [...prevDots, newDot]);

            setTimeout(() => {
                setDots(prevDots => prevDots.filter(dot => dot.id !== newDot.id));
            }, duration);
        };

        const interval = setInterval(createDot, 450);
        return () => clearInterval(interval);
    }, []);

    return (
        <DotContainer>
            {dots.map(dot => (
                <Dot
                    key={dot.id}
                    size={dot.size}
                    duration={dot.duration}
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                    }}
                />
            ))}
        </DotContainer>
    );
};

export default GlowingDots;