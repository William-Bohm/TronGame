// SciFiButton.tsx
import styled from 'styled-components';
import {cssFormatColors} from "../../../../threeJSMeterials";

const ButtonContainer = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    
    img {
      filter: brightness(1.2);
    }
    
    span {
      filter: brightness(1.2);
    }
  }
`;

const ArrowIcon = styled.img`
  width: 56px;
  height: 40px;
  transition: all 0.3s ease;
   transform: scale(-1, -1); 
`;

const ButtonText = styled.span`
  font-size: 26px;
    font-family: 'Orbitron', sans-serif;
    color: ${cssFormatColors.neonBlue};
  transition: all 0.3s ease;
    margin-left: -5px;
`;

interface SciFiButtonProps {
  onClick?: () => void;
}

export const SciFiButton: React.FC<SciFiButtonProps> = ({ onClick }) => {
  return (
    <ButtonContainer onClick={onClick}>
      <ArrowIcon
        src="/sci_fi_arrows/tripple_sci_fi_arrow.svg"
        alt="Settings Arrow"
      />
      <ButtonText>Settings</ButtonText>
    </ButtonContainer>
  );
};