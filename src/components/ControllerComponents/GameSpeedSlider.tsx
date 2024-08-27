import styled from 'styled-components';
import {useTronContext} from "../../context/GameContext";

const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-family: 'Orbitron', sans-serif;
  color: ${({ theme }) => theme.colors.primary};
`;

const SliderLabel = styled.label`
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.primary};
`;


const NeonSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.background};
  outline: none;
  border-radius: 10px;
  position: relative;
  border: 2px solid ${({ theme }) => theme.colors.primary}; /* Add border */
    &:hover {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
          &:hover {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }
  }

  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
          &:hover {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }

  }
  
  &::-ms-thumb {
    width: 30px;
    height: 30px;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
          &:hover {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }
  }
`;

const SliderValue = styled.span`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const GameSpeedSlider: React.FC = () => {
    const {setGameSpeed, gameSpeed} = useTronContext();
  return (
    <SliderWrapper>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <SliderLabel>Game Speed</SliderLabel>
            <SliderValue>{gameSpeed} ms</SliderValue>
        </div>
      <NeonSlider
        min="100"
        max="1000"
        step="100"
        value={gameSpeed}
        onChange={(e) => setGameSpeed(Number(e.target.value))}
      />
    </SliderWrapper>
  );
};

export default GameSpeedSlider;
