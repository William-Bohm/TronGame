// types.ts
interface Point {
    x: number;
    y: number;
}

export interface LineSegment {
    start: Point;
    end: Point;
}

interface AnimatedLineProps {
    segments: LineSegment[];
    color?: string;
    thickness?: number;
    animationDuration?: number;
    delay?: number;
}

// AnimatedLine.tsx
import styled, {keyframes} from 'styled-components';
import React, {useCallback, useEffect, useRef, useState} from 'react';

const SVGContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
`;

const LineSegmentSVG = styled.line<{
    dashLength: number;
    progress: number;
    isVisible: boolean;
}>`
    stroke-dasharray: ${(props) => props.dashLength};
    stroke-dashoffset: ${(props) =>
            props.dashLength - props.progress * props.dashLength};
    opacity: ${props => props.isVisible ? 1 : 0};
    visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
    stroke: #FF6B00;
    filter: drop-shadow(0 0 8px #FF6B00) drop-shadow(0 0 12px rgba(255, 107, 0, 0.8));
`;

export const AnimatedLine: React.FC<AnimatedLineProps> = ({
                                                              segments,
                                                              color = '#000000',
                                                              thickness = 2,
                                                          }) => {
    const [visibleSegments, setVisibleSegments] = useState<boolean[]>(
        new Array(segments.length).fill(false)
    );
    const [segmentProgress, setSegmentProgress] = useState<number[]>(
        new Array(segments.length).fill(0)
    );
    const animatingSegmentRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

// 1. Helper to get length of a segment
    function getSegmentLength(segment: LineSegment) {
        const dx = segment.end.x - segment.start.x;
        const dy = segment.end.y - segment.start.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

// 2. Suppose we define a "speed" in px/ms. For example:
    const SPEED_PX_PER_MS = 0.4; // 0.2 px/ms => 200 px/s

// ...
// Inside your animation callback
    const animate = useCallback((timestamp: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }

        const currentSegment = animatingSegmentRef.current;
        if (currentSegment >= segments.length) return;

        // figure out how long the current segment is
        const length = getSegmentLength(segments[currentSegment]);
        // how long to animate this segment, in ms
        const segmentDuration = length / SPEED_PX_PER_MS;

        // time elapsed since we started *this* segment
        const elapsed = timestamp - startTimeRef.current;
        // normalized progress in [0..1]
        const progress = Math.min(elapsed / segmentDuration, 1);

        setSegmentProgress(prev => {
            const newProgress = [...prev];
            newProgress[currentSegment] = progress;
            return newProgress;
        });

        if (progress < 1) {
            // still animating this segment
            requestAnimationFrame(animate);
        } else {
            // done with this segment
            startTimeRef.current = 0;
            animatingSegmentRef.current++;
            if (animatingSegmentRef.current < segments.length) {
                // show next segment and animate it
                setVisibleSegments(prev => {
                    const newState = [...prev];
                    newState[animatingSegmentRef.current] = true;
                    return newState;
                });
                requestAnimationFrame(animate);
            }
        }
    }, [segments]);


    useEffect(() => {
        setVisibleSegments(new Array(segments.length).fill(false));
        setSegmentProgress(new Array(segments.length).fill(0));
        animatingSegmentRef.current = 0;
        startTimeRef.current = 0;

        // Start first segment
        setVisibleSegments(prev => {
            const newState = [...prev];
            newState[0] = true;
            return newState;
        });
        requestAnimationFrame(animate);
    }, [segments, animate]);

    return (
        <SVGContainer>
            <svg
                width="100%"
                height="100%"
                style={{position: 'absolute', top: 0, left: 0}}
                preserveAspectRatio="none"
            >
                {segments.map((segment, index) => {
                    const length = Math.sqrt(
                        Math.pow(segment.end.x - segment.start.x, 2) +
                        Math.pow(segment.end.y - segment.start.y, 2)
                    );

                    return (
                        <LineSegmentSVG
                            key={index}
                            x1={segment.start.x}
                            y1={segment.start.y}
                            x2={segment.end.x}
                            y2={segment.end.y}
                            stroke={color}
                            strokeWidth={thickness}
                            dashLength={length}
                            progress={segmentProgress[index]}
                            isVisible={visibleSegments[index]}
                        />
                    );
                })}

            </svg>
        </SVGContainer>
    );
};