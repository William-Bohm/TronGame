import React, { useState } from 'react';
import styled from 'styled-components';
import {useTronContext} from "../../context/GameContext";

const SelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: start;
  font-family: 'Orbitron', sans-serif;
  color: ${({ theme }) => theme.colors.primary};
`;

const Label = styled.label`
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.primary};

`;

const Dropdown = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 1.2rem;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  margin-bottom: 20px;
  outline: none;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  font-size: 1.2rem;
  padding: 10px 20px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  margin-top: 10px;

  &:hover {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;


const Input = styled.input`
  width: 100px;
  padding: 5px;
  font-size: 1.2rem;
  margin: 10px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 5px;
  outline: none;
`;

// Fix for Modal
const Modal = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  box-shadow: 0 0 20px ${({ theme }) => theme.colors.primary};
  z-index: 1000;
`;

// Fix for Overlay
const Overlay = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const BoardSizeSelector: React.FC<{
}> = () => {
   const {
     updateGridSize,
     gridSize,
       gameStatus,
desiredDirections
  } = useTronContext();
  const [selectedSize, setSelectedSize] = useState('10x10');
  const [isCustom, setIsCustom] = useState(false);

  const [newWidth, setNewWidth] = useState(gridSize.width);
  const [newHeight, setNewHeight] = useState(gridSize.height);

  const handleGridSizeUpdate = () => {
    updateGridSize(newWidth, newHeight);
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustom(true);
    } else {
      const [width, height] = value.split('x').map(Number);
      setNewWidth(width);
      setNewHeight(height);
      setIsCustom(false);
      updateGridSize(width, height);
    }
    setSelectedSize(value);
  };

  const handleCustomSubmit = () => {
    setIsCustom(false);
    handleGridSizeUpdate();
  };

  return (
    <>
      <SelectorWrapper>
        <Label>Board Size</Label>
        <Dropdown value={selectedSize} onChange={handleSelectionChange}>
          <option value="10x10">10x10</option>
          <option value="50x50">50x50</option>
          <option value="100x100">100x100</option>
          <option value="200x200">200x200</option>
          <option value="custom">Custom</option>
        </Dropdown>
      </SelectorWrapper>

      {isCustom && (
        <>
          <Overlay isVisible={isCustom} />
          <Modal isVisible={isCustom}>
            <h3>Custom Board Size</h3>
            <div>
              <Label>Width:</Label>
              <Input
                type="number"
                value={newWidth}
                onChange={(e) => setNewWidth(Number(e.target.value))}
                min="5"
                max="50"
              />
            </div>
            <div>
              <Label>Height:</Label>
              <Input
                type="number"
                value={newHeight}
                onChange={(e) => setNewHeight(Number(e.target.value))}
                min="5"
                max="50"
              />
            </div>
            <Button onClick={handleCustomSubmit}>
              Set Custom Size
            </Button>
          </Modal>
        </>
      )}
    </>
  );
};

export default BoardSizeSelector;
