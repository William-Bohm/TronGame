import React, {useRef, useState} from 'react';
import {
  useTronContext,
  Player,
  PlayerType,
  ControlScheme,
  Position
} from '../context/GameContext';

import { FaTrashAlt } from 'react-icons/fa';
import {MdArrowBackIos, MdArrowForwardIos, MdKeyboardArrowDown, MdKeyboardArrowUp} from 'react-icons/md';

import styled from "styled-components";

const PlayerManagerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 20px;
  font-family: 'Orbitron', sans-serif;
  color: ${({ theme }) => theme.colors.primary};
`;

const PlayerManagerHeader = styled.h2`
  margin-bottom: 0px;
`;

const PlayerCardsOuterWrapper = styled.div`
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PlayerCardsWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  margin: 0 0; // Add margin to make space for arrows

  &::-webkit-scrollbar {
    display: none; /* Hide the scrollbar */
  }
`;


const PlayerCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
  //min-height: 150px;
  text-align: center;
  position: relative;
  
  &:hover {
      box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  }

  h3 {
    margin: 0 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    margin: 0 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  select, input[type="color"] {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 5px;
    padding: 5px;
    margin-top: 5px;
  }
`;

const TrashIcon = styled(FaTrashAlt)`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  transition: color 0.1s ease;
  margin-left: 10px;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;



const ArrowButton = styled.div<{ direction: 'up' | 'down' }>`
  position: absolute;
  ${({ direction }) => (direction === 'up' ? 'top: 0;' : 'bottom: 0;')}
  left: 0;
  right: 0;
  background: linear-gradient(
    ${({ direction, theme }) =>
      direction === 'up'
        ? `to top, ${theme.colors.background}00 0%, ${theme.colors.background}FF 80%`
        : `to bottom, ${theme.colors.background}00 0%, ${theme.colors.background}FF 80%`}
  );
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; // Ensure arrows are above the cards

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 2rem;
  }

  &:hover {
    svg {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const AddPlayerButton = styled.button`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 10px 20px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 0 15px ${({ theme }) => theme.colors.primary};
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
    justify-content: space-between;
`

const PlayerManager: React.FC = () => {
  const {
    players,
    setPlayers,
      gridSize,
      gameStatus,
      availableControlSchemes,
      setAvailableControlSchemes,
      allControlSchemes,
      calculatePlayerStartPositions,
      setGameGrid,
      resetGame,
  } = useTronContext();
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({});

  const addPlayer = () => {
    if (gameStatus !== 'playing') {
      resetGame();
      let type = 'human';
      let controlScheme = getUserControlScheme();
      if (players.filter(player => player.type === 'human').length >= allControlSchemes.length) {
          type = 'bot';
      }

      let nextID = Math.max(...players.map(player => player.id), 0) + 1;
      let newPlayers = [...players, {
        ...newPlayer,
        id: nextID,
        type: type,
        position: [0, 0] as Position,
        name: 'player' + ' ' + (players.length + 1),
        score: 0,
        direction: 'right',
        controlScheme: getUserControlScheme(),
        color: getUserDefaultColor(players),
      } as Player];

      newPlayers = calculatePlayerStartPositions(newPlayers, gridSize);

      setPlayers([...newPlayers]);
      setAvailableControlSchemes(availableControlSchemes.filter(scheme => scheme !== controlScheme));
      setNewPlayer({});

    }
  };

    const updatePlayer = (id: number, field: keyof Player, value: any) => {
      if (gameStatus !== 'playing') {
        if (field === 'controlScheme') {
          const player = players.find(player => player.id === id);
          setAvailableControlSchemes([...availableControlSchemes, players.find(player => player.id === id)?.controlScheme as ControlScheme]);
          if (value === 'bot') {
            console.log('set player to bot now')
            setPlayers(players.map(p => p.id === id ? {...p, [field]: value, type: 'bot'} : p));
          } else if (player?.type === 'bot' && value !== 'bot')
            setPlayers(players.map(p => p.id === id ? {...p, [field]: value, type: 'human'} : p));
        } else {
          setPlayers(players.map(p => p.id === id ? {...p, [field]: value} : p));
        }

      }
  };


    const removePlayer = (id: number) => {
      try{
        if (gameStatus !== 'playing') {
          resetGame();
          let newPlayers = players.filter(player => player.id !== id);
          newPlayers = calculatePlayerStartPositions(newPlayers, gridSize);
          const controlScheme = players.find(player => player.id === id)?.controlScheme;
          setPlayers([...newPlayers]);

          if (controlScheme !== 'bot') {
            setAvailableControlSchemes(availableControlSchemes.filter(scheme => scheme !== controlScheme));
          }
        }
      } catch (e) {
        console.log('error baby')
        console.log(e)
      }
  };


  function getUserControlScheme(): ControlScheme {
    const usedSchemes = players.map(player => player.controlScheme);
    const availableSchemes = availableControlSchemes.filter(scheme => !usedSchemes.includes(scheme));
    return availableSchemes[0];
  }

  function getUserDefaultColor(players: Player[]): string {
    const neonColors = [
      "#FF00FF", // Magenta
      "#00FFFF", // Cyan
      "#FF0000", // Red
      "#00FF00", // Lime
      "#0000FF", // Blue
      "#FFFF00", // Yellow
      "#FE01B1", // Pink
      "#01FFFE", // Aqua
      "#FFA300", // Orange
      "#7CFC00", // Lawn green
      "#8B00FF", // Violet
      "#FF1493", // Deep pink
      "#00FF7F", // Spring green
      "#FF4500", // Orange red
      "#1E90FF", // Dodger blue
      "#FFFF33", // Yellow (lighter)
      "#FF69B4", // Hot pink
      "#00CED1", // Dark turquoise
      "#7FFF00", // Chartreuse
      "#FF6347", // Tomato
      "#00BFFF", // Deep sky blue
      "#FF00FF", // Fuchsia
      "#00FA9A", // Medium spring green
      "#FF1493", // Deep pink
      "#00FF00", // Lime (again, very noticeable)
      "#FF4081", // Pink (Material Design)
      "#64FFDA", // Teal (Material Design)
      "#FF3D00", // Deep Orange (Material Design)
      "#00E5FF", // Cyan (Material Design)
      "#76FF03"  // Light Green (Material Design)
    ];

    const usedColors = new Set(players.map(player => player.color));

    for (const color of neonColors) {
      if (!usedColors.has(color)) {
        return color;
      }
    }

    // If all colors are used, return a random bright color as a fallback
    const randomBrightColor = () => {
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 21) + 80; // 80-100%
      const l = Math.floor(Math.random() * 11) + 50; // 50-60%
      return `hsl(${h}, ${s}%, ${l}%)`;
    };

    return randomBrightColor();
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollPlayers = (direction: 'up' | 'down') => {
    if (scrollRef.current) {
      const scrollAmount = 150; // Adjust this value to change scroll distance
      scrollRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <PlayerManagerWrapper>
      <PlayerManagerHeader>Players</PlayerManagerHeader>
      <PlayerCardsOuterWrapper>
        {players.length > 2 && (
          <ArrowButton direction="up" onClick={() => scrollPlayers('up')}>
            <MdKeyboardArrowUp />
          </ArrowButton>
        )}
        <PlayerCardsWrapper ref={scrollRef}>
          <div style={{height: 10}}></div>
          {players.map(player => (

            //   player card
              <div
              style={{
                display: "flex",
                flexDirection: 'row',
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
              >
                <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0 }}>
                <PlayerCard key={player.id}>
                  {/*top row*/}
                  <TopRow>
                    {/*left*/}
                    <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'right',
                        }}
                    >
                      {/*color*/}
                      <input
                          type="color"
                          value={player.color}
                          onChange={(e) => updatePlayer(player.id, 'color', e.target.value)}
                      />
                      <div style={{width: 10}}></div>

                      {/*name*/}
                      <h3>{player.name}</h3>
                      <div style={{width: 10}}></div>

                    </div>

                    {/*right*/}
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <p>Score: {player.score}</p>
                      {/*  controls*/}
                        <select
                            value={player.controlScheme}
                            onChange={(e) => updatePlayer(player.id, 'controlScheme', e.target.value as ControlScheme)}
                        >
                          {allControlSchemes.map(scheme => (
                              <option
                                  key={scheme}
                                  value={scheme}
                                  disabled={!availableControlSchemes.includes(scheme)}
                              >
                                {scheme}
                              </option>
                          ))}
                        </select>
                    </div>
                  </TopRow>

                </PlayerCard>
                  </div>
                <TrashIcon onClick={() => removePlayer(player.id)}/>
              </div>
          ))}

        </PlayerCardsWrapper>
        {players.length > 2 && (
          <ArrowButton direction="down" onClick={() => scrollPlayers('down')}>
            <MdKeyboardArrowDown />
          </ArrowButton>
        )}
      </PlayerCardsOuterWrapper>
      <AddPlayerButton onClick={addPlayer}>
        Add New Player
      </AddPlayerButton>
    </PlayerManagerWrapper>
  );
};

export default PlayerManager;