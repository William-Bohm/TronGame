import styled from 'styled-components';

const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  font-family: 'Orbitron', sans-serif;
  color: ${({ theme }) => theme.colors.primary};
`;

const SliderLabel = styled.label`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.primary};
  text-shadow: 
    0 0 0 ${({ theme }) => theme.colors.primary},
    0 0 4px ${({ theme }) => theme.colors.primary},
    0 0 8px ${({ theme }) => theme.colors.primary};
`;

const NeonSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 80%;
    min-width: 200px;
  height: 10px;
  background: ${({ theme }) => theme.colors.background};
  outline: none;
  border-radius: 10px;
  margin-bottom: 10px;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.primary}; /* Add border */
  box-shadow: 
    0 0 1px ${({ theme }) => theme.colors.primary},
    0 0 2px ${({ theme }) => theme.colors.primary},
    0 0 3px ${({ theme }) => theme.colors.primary};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 
      0 0 0 ${({ theme }) => theme.colors.primary},
      0 0 4px ${({ theme }) => theme.colors.primary},
      0 0 8px ${({ theme }) => theme.colors.primary};
    transition: background 0.2s ease-in-out;
  }

  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 
      0 0 10px ${({ theme }) => theme.colors.primary},
      0 0 20px ${({ theme }) => theme.colors.primary},
      0 0 40px ${({ theme }) => theme.colors.primary};
    transition: background 0.2s ease-in-out;
  }
  
  &::-ms-thumb {
    width: 30px;
    height: 30px;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 
      0 0 10px ${({ theme }) => theme.colors.primary},
      0 0 20px ${({ theme }) => theme.colors.primary},
      0 0 40px ${({ theme }) => theme.colors.primary};
    transition: background 0.2s ease-in-out;
  }
`;

const SliderValue = styled.span`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  text-shadow: 
    0 0 0 ${({ theme }) => theme.colors.primary},
    0 0 4px ${({ theme }) => theme.colors.primary},
    0 0 8px ${({ theme }) => theme.colors.primary};
`;

const GameSpeedSlider: React.FC<{ gameSpeed: number, setGameSpeed: (value: number) => void }> = ({ gameSpeed, setGameSpeed }) => {
  return (
    <SliderWrapper>
      <SliderLabel>Game Speed</SliderLabel>
      <NeonSlider
        min="100"
        max="1000"
        step="100"
        value={gameSpeed}
        onChange={(e) => setGameSpeed(Number(e.target.value))}
      />
      <SliderValue>{gameSpeed} ms</SliderValue>
    </SliderWrapper>
  );
};

export default GameSpeedSlider;
