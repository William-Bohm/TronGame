import React, { useState } from 'react';
import {
  useTronContext,
  Player,
  PlayerType,
  ControlScheme,
  Position
} from './context/GameContext';

const PlayerManager: React.FC = () => {
  const {
    players,
    setPlayers,
      gridSize,
      gameStatus,
      availableControlSchemes,
      setAvailableControlSchemes,
      allControlSchemes,
      calculatePlayerStartPositions

  } = useTronContext();
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({});

  const initPlayer = () => {
    /*
    * TODO:
    * add direction logic.
    * **/
    if (gameStatus !== 'playing') {
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
        name: type + ' ' + (players.length + 1),
        score: 0,
        direction: 'right',
        controlScheme: getUserControlScheme(),
        color: getUserDefaultColor(players),
      } as Player];

      newPlayers = calculatePlayerStartPositions(newPlayers, gridSize);

      setPlayers([...newPlayers]);
      setAvailableControlSchemes(availableControlSchemes.filter(scheme => scheme !== controlScheme));
      setNewPlayer({});

      console.log(players);
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



  const removePlayer = (id: number) => {
      if (gameStatus !== 'playing') {
        setPlayers(players.filter(p => p.id !== id));
      }
  };

  const updatePlayer = (id: number, field: keyof Player, value: any) => {
      if (gameStatus !== 'playing') {
        setPlayers(players.map(p => p.id === id ? {...p, [field]: value} : p));
      }
  };

  return (
    <div>
      <h2>Players</h2>
      {players.map(player => (
        <div key={player.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Player {player.id}</h3>
          <p>Type:
            <select
              value={player.type}
              onChange={(e) => updatePlayer(player.id, 'type', e.target.value as PlayerType)}
            >
              <option value="human">Human</option>
              <option value="bot">Bot</option>
            </select>
          </p>
          <p>Position: [{player.position[0]}, {player.position[1]}]</p>
          <p>Color:
            <input
              type="color"
              value={player.color}
              onChange={(e) => updatePlayer(player.id, 'color', e.target.value)}
            />
          </p>
          <p>Score: {player.score}</p>
         {player.type === 'human' && (
          <p>Control Scheme:
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
          </p>
        )}
          <button onClick={() => removePlayer(player.id)}>Remove Player</button>
        </div>
      ))}

      <h3>Add New Player</h3>
      <div>
        <button onClick={initPlayer}>Add Player</button>
      </div>
    </div>
  );
};

export default PlayerManager;