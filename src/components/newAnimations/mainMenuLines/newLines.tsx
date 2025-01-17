// types.ts
import {colors, cssFormatColors, toRGBA} from "../../../threeJSMeterials";

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
import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import AnimationManager from "./MainMenuAnimationManager";

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
    isComplete: boolean;
}>`
    stroke-dasharray: ${(props) => props.dashLength};
    stroke-dashoffset: ${(props) =>
            props.dashLength - props.progress * props.dashLength};
    opacity: ${props => props.isVisible ? 1 : 0};
    visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
    stroke: ${cssFormatColors.neonBlue};
    
    filter: ${props => props.isComplete ? 
        `drop-shadow(0 0 8px ${cssFormatColors.neonBlue}) drop-shadow(0 0 12px ${toRGBA(cssFormatColors.neonBlue, 0.8)})` : 
        'none'};
    transition: filter 0.3s ease; /* Optional: smooth transition when filter is applied */
`;

export const AnimatedLine: React.FC<AnimatedLineProps> = ({
                                                              segments,
                                                              color = '#000000',
                                                              thickness = 2,
                                                          }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [visibleSegments, setVisibleSegments] = useState<boolean[]>(
        new Array(segments.length).fill(false)
    );
        const [isAnimationComplete, setIsAnimationComplete] = useState(false);

    const [segmentProgress, setSegmentProgress] = useState<number[]>(
        new Array(segments.length).fill(0)
    );
    const animatingSegmentRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const idRef = useRef<string>(useId());

// 1. Helper to get length of a segment
    function getSegmentLength(segment: LineSegment) {
        const dx = segment.end.x - segment.start.x;
        const dy = segment.end.y - segment.start.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

// 2. Suppose we define a "speed" in px/ms. For example:
    const SPEED_PX_PER_MS = 1; // 0.2 px/ms => 200 px/s

// ...
// Inside your animation callback
    const animate = useCallback((timestamp: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }

        const currentSegment = animatingSegmentRef.current;
        if (currentSegment >= segments.length) {
            AnimationManager.getInstance().removeAnimation(idRef.current);
            return;
        }

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

        if (progress >= 1) {
                     if (animatingSegmentRef.current === segments.length - 1) {
                // Last segment is complete
                setIsAnimationComplete(true);
            }
            startTimeRef.current = 0;
            animatingSegmentRef.current++;

            if (animatingSegmentRef.current < segments.length) {
                setVisibleSegments(prev => {
                    const newState = [...prev];
                    newState[animatingSegmentRef.current] = true;
                    return newState;
                });
            } else {
                AnimationManager.getInstance().removeAnimation(idRef.current);
            }
        }
    }, [segments]);


   useEffect(() => {
        setVisibleSegments(new Array(segments.length).fill(false));
        setSegmentProgress(new Array(segments.length).fill(0));
        animatingSegmentRef.current = 0;
        startTimeRef.current = 0;
        setIsMounted(true);

        return () => {
            setIsMounted(false);
            AnimationManager.getInstance().removeAnimation(idRef.current);
        };
    }, [segments]);

    useEffect(() => {
        if (isMounted) {
            setVisibleSegments(prev => {
                const newState = [...prev];
                newState[0] = true;
                return newState;
            });
            AnimationManager.getInstance().addAnimation(idRef.current, animate);
        }
    }, [isMounted, animate]);

    if (!isMounted) {
        return (
            <SVGContainer>
                <svg
                    width="100%"
                    height="100%"
                    style={{position: 'absolute', top: 0, left: 0}}
                    preserveAspectRatio="none"
                />
            </SVGContainer>
        );
    }
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
                            isComplete={isAnimationComplete}
                        />
                    );
                })}

            </svg>
        </SVGContainer>
    );
};