import React, {useEffect, useState, useCallback, useRef} from 'react';
import styled from 'styled-components';
import {cssFormatColors} from "../../threeJSMeterials";

const TypeWriterContainer = styled.div`
    font-family: 'Orbitron', sans-serif;
    //color: #fff;
    margin-bottom: 10px;
    line-height: 1.5;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const Cursor = styled.span`
    opacity: 1;
    animation: blink 1s infinite;

    @keyframes blink {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
    }
`;

interface TypeWriterProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
    delay?: number;
}

export const TypeWriterText: React.FC<TypeWriterProps> = ({
    text,
    speed = 50,
    onComplete,
    className,
    delay = 0
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const mounted = useRef(true);

    const typeText = useCallback(async () => {
        if (!mounted.current) return;

        await new Promise(resolve => setTimeout(resolve, delay));
        setHasStarted(true);
        setDisplayedText('');
        setIsComplete(false);

        for (let i = 0; i <= text.length; i++) {
            if (!mounted.current) return;
            await new Promise(resolve => setTimeout(resolve, speed));
            setDisplayedText(text.slice(0, i));
        }

        if (!mounted.current) return;
        setIsComplete(true);
        if (onComplete) onComplete();
    }, [text, speed, delay, onComplete]);

    useEffect(() => {
        mounted.current = true;
        typeText();

        return () => {
            mounted.current = false;
            setDisplayedText('');
            setIsComplete(false);
            setHasStarted(false);
        };
    }, [typeText]);

    if (!hasStarted) return null;

    return (
        <TypeWriterContainer className={className}>
            {displayedText}
            {!isComplete && <Cursor>|</Cursor>}
        </TypeWriterContainer>
    );
};

