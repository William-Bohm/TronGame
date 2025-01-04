interface LineProps {
  startX: number; // percentage
  startY: number; // percentage
  endX: number; // percentage
  endY: number; // percentage
  isVisible: boolean;
  color?: string; // optional color prop
  duration?: number; // animation duration in seconds
}

import styled, { keyframes } from 'styled-components';
import React, { useMemo } from 'react';

interface Point {
  x: number;
  y: number;
}

interface MultiLineProps {
  points: Point[];
  isVisible: boolean;
  color?: string;
  duration?: number;
}


// Helper functions remain the same
const calculateLength = (start: Point, end: Point) => {
  // Convert distances to the same unit system
  const xDiff = (end.x - start.x); // As percentage of viewport width
  const yDiff = (end.y - start.y); // As percentage of viewport height

  // Convert to a common unit (e.g., viewport width units)
  const viewportRatio = window.innerWidth / window.innerHeight;
  const normalizedYDiff = yDiff * viewportRatio;

  return Math.sqrt(xDiff * xDiff + normalizedYDiff * normalizedYDiff);
};

const calculateAngle = (start: Point, end: Point) => {
  const xDiff = end.x - start.x;
  const yDiff = end.y - start.y;
  let angle =  Math.atan2(yDiff, xDiff) * (180 / Math.PI);
    console.log('angle:', angle);
    return angle;
};

const growAnimation = keyframes`
  0% {
    clip-path: inset(0 100% 0 0);
    visibility: visible;
  }
  100% {
    clip-path: inset(0 0 0 0);
    visibility: visible;
  }
`;


//
//
//  LINE
//
//

const shrinkAnimation = keyframes`
  0% {
    clip-path: inset(0 0 0 0);
    visibility: visible;
  }
  99% {
    clip-path: inset(0 100% 0 0);
    visibility: visible;
  }
  100% {
    clip-path: inset(0 100% 0 0);
    visibility: hidden;
  }
`;

const LineSegment = styled.div<{
  startX: number;
  startY: number;
  length: number;
  angle: number;
  isVisible: boolean;
  duration: number;
  delay: number;
  color: string;
  segmentDurationRatio: number;
}>`
  position: fixed;
  width: ${props => props.length}vw;  // Using vw as our base unit
  height: 2px;
  left: ${props => props.startX}vw;
  top: ${props => props.startY}vh;
  transform-origin: left center;
  transform: rotate(${props => props.angle}deg);
  background: ${props => props.color};
  box-shadow: 0 0 10px ${props => props.color},
              0 0 20px ${props => props.color},
              0 0 30px ${props => props.color};
  visibility: hidden;
  animation: ${props => props.isVisible ? growAnimation : shrinkAnimation} 
             ${props => props.duration * props.segmentDurationRatio}s 
             ${props => props.delay}s
             forwards;
`;

//
//
// MULTILINE
//
//
export const NeonMultiLine: React.FC<MultiLineProps> = ({
  points,
  isVisible,
  color = '#ff00ff',
  duration = 1
}) => {
  const segments = useMemo(() => {
    let totalLength = 0;
    const segmentLengths: number[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const length = calculateLength(points[i], points[i + 1]);
      segmentLengths.push(length);
      totalLength += length;
    }

    return points.slice(0, -1).map((point, index) => {
      const start = point;
      const end = points[index + 1];
      const segmentLength = segmentLengths[index];

      const previousLength = segmentLengths
        .slice(0, index)
        .reduce((sum, length) => sum + length, 0);

      // Calculate different delays for appearing and disappearing
      const appearDelay = (previousLength / totalLength) * duration;
      const disappearDelay = ((totalLength - previousLength - segmentLength) / totalLength) * duration;

      const segmentDurationRatio = segmentLength / totalLength;

      return {
        start,
        end,
        length: segmentLength,
        angle: calculateAngle(start, end),
        delay: isVisible ? appearDelay : disappearDelay,
        segmentDurationRatio
      };
    });
  }, [points, duration, isVisible]); // Added isVisible to dependencies

  return (
    <>
      {segments.map((segment, index) => (
        <LineSegment
          key={index}
          startX={segment.start.x}
          startY={segment.start.y}
          length={segment.length}
          angle={segment.angle}
          isVisible={isVisible}
          duration={duration}
          delay={segment.delay}
          color={color}
          segmentDurationRatio={segment.segmentDurationRatio}
        />
      ))}
    </>
  );
};
