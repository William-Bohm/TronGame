import styled from 'styled-components';
import {cssFormatColors} from "../../threeJSMeterials";

interface RingsProps {
  size?: number;
  color?: string;
  $isSelected?: boolean; // new prop for the filled circle state
}

const SVGWrapper = styled.svg<RingsProps>`
  height: ${props => props.size}px;
  width: ${props => props.size}px;
`;

const BaseCircle = styled.circle<{ color?: string }>`
  fill: none;
  stroke: ${cssFormatColors.neonBlue};
  stroke-width: 42;
  stroke-miterlimit: 10;
`;

// New styled component for the filled center circle
const CenterCircle = styled.circle<{ color: string }>`
  fill: ${props => props.color};
`;

const InnerRing = styled(BaseCircle)`
  stroke-dasharray: 50, 90, 200, 30, 40, 0;
`;

const OuterRing = styled(BaseCircle)`
  stroke-linecap: square;
  stroke-dasharray: 120, 20, 110, 20, 140;
`;

const OuterThinRing = styled(BaseCircle)`
  stroke-width: 16;
  stroke-linecap: square;
`;

const AnimatedRings: React.FC<RingsProps> = ({
  size = 500,
  color = cssFormatColors.neonBlue,
  $isSelected = false
}) => {
  return (
    <SVGWrapper
      size={size}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 1000 1000"
    >
      {$isSelected && (
        <CenterCircle
            color={color}
          cx="500"
          cy="500"
          r="200" // You can adjust this radius to make the center circle larger or smaller
        />
      )}
      <InnerRing cx="500" cy="500" r="290">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 500 500"
          to="360 500 500"
          dur="10s"
          repeatCount="indefinite"
        />
      </InnerRing>
      <OuterRing cx="500" cy="500" r="366.8">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 500 500"
          to="-360 500 500"
          dur="15s"
          repeatCount="indefinite"
        />
      </OuterRing>
      <OuterThinRing cx="500" cy="500" r="385.1" />
    </SVGWrapper>
  );
};

export default AnimatedRings;