import React, {useEffect, useRef, useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../threeJSMeterials";
import {slideDown} from "./SciFiSlideDownAnimation";
import {useIsMobile} from "../intro/ThreeScene3";
import {CircleButton} from "./PlusButton";
import {darken, lighten} from "polished";
import {ControlScheme, Player, Position, useTronContext} from "../../context/GameContext";
import {FaTrashAlt} from "react-icons/fa";
import AnimatedRings from "./AnimatedRings";
import {useSound} from "../../context/AudioContext";

interface FuturisticButtonProps {
    text: string;
    onClick: () => void;
    directToMenu: boolean;
}


const baseLineAnimationTime = 2;


// Then modify your ButtonContainer
const ButtonContainer = styled.div`
    position: relative;
    //cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    //margin-top: -9.5%;
    //border: 2px solid red;

    //padding: 5px 10px;
    transition: all 0.3s ease;
    animation: ${slideDown} 1s ease-out forwards;
    //border: 2px solid red;

    height: 100%;
    width: 100%;
    min-width: 300px;
    max-width: 400px;
    max-height: 500px;

    aspect-ratio: 4 / 5;
    //@media (min-width: 1600px) {
    //    width: 80%;
    //}

    //@media (max-width: 1400px) {
    //    aspect-ratio: 2 / 3;
    //}
    //@media (max-width: 1200px) {
    //    aspect-ratio: 3 / 5;
    //}
    //@media (max-width: 1000px) {
    //    //aspect-ratio: 5 / 5;
    //    width: 90%
    //}
    //@media (max-width: 900px) {
    //    aspect-ratio: 5 / 5;
    //}
    //
    //
    //@media (max-width: 650px) {
    //    aspect-ratio: 3 / 5;
    //}
`;
const SVGContainer = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    isolation: isolate;
`;

interface BorderPathProps {
    strokeWidth?: number;
    $animationSpeed?: number;  // Add $ prefix here
    color?: string;
}

const BorderPath = styled.path<BorderPathProps>`
    fill: none;
    stroke: ${props => props.color || toRGBA(cssFormatColors.neonBlue, 1)};
    stroke-width: ${props => props.strokeWidth || 2}px;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine ${props => props.$animationSpeed || baseLineAnimationTime}s forwards;
    @keyframes drawLine {
        to {
            stroke-dashoffset: 0;
        }
    }
`;

const PlusButton = styled.div`
    position: absolute;
    top: 80%;
    left: 89%;
    transform: translate(-50%, -50%);
`;

const TextElement = styled.div`
    position: absolute;
    top: 20.5%;
    left: 25%;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', sans-serif;

    font-weight: 500;
    font-size: 1.7rem;
    width: 90%; // Control text width

    @media (max-width: 450px) {
        left: 30%;
    }
    @media (max-width: 375px) {
        font-size: 1.5rem;
    }

    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none;

    //@media (max-width: 1250px) {
    //    left: 30%;
    //    font-size: 2rem;
    //}
    //
    //@media (max-width: 1000px) {
    //    font-size: 2.5rem;
    //}
    //@media (max-width: 650px) {
    //    left: 30%;
    //    font-size: 2rem;
    //}
    //@media (max-width: 450px) {
    //    left: 30%;
    //    font-size: 1.5rem;
    //}
`;

const InnerContent = styled.div<{ $isMobile?: boolean }>`
    position: absolute;
    width: 75%;
    height: 58%;
    top: 28.5%;
    left: 6%;
    padding-left: 10px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    overflow-y: auto; // Add this to enable vertical scrolling
    overflow-x: hidden; // Add this to prevent horizontal scrolling if not needed

    /* Custom scrollbar styling */

    &::-webkit-scrollbar {
        width: 8px;
        display: block; // Ensures scrollbar is always visible
    }

    &::-webkit-scrollbar-track {
        background: ${({theme}) => theme.colors.background || '#f1f1f1'};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({theme}) => theme.colors.primary};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({theme}) => theme.colors.primary}dd; // Adding slight transparency on hover
    }
`;

const TrashIcon = styled(FaTrashAlt)`
    cursor: pointer;
    color: ${({theme}) => theme.colors.primary};
    transition: color 0.1s ease;
    //margin-left: 10px;

    &:hover {
        color: ${({theme}) => theme.colors.secondary};
    }
`;


const PlayerCard = styled.div`
        // background: ${({theme}) => theme.colors.background};
        // border: 2px solid ${({theme}) => theme.colors.primary};
    border-radius: 10px;
    padding: 5px;
    width: 100%;
    margin: 3px 0;
    margin-right: 5px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${({theme}) => theme.colors.primary};

    &:hover {
        border: 2px solid ${({theme}) => theme.colors.primary};
    }
`;

const PlayerName = styled.div`
    margin-right: 0;
    color: ${({theme}) => theme.colors.primary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: pointer;
`;

const PlayerNameInput = styled.input`
    margin-right: 0;
    color: ${({theme}) => theme.colors.primary};
    font-family: inherit;
    font-size: inherit;
    background: transparent;
    border: none;
    width: 100%;
    max-width: 200px;
    z-index: 1000;

    &:focus {
        outline: none;
        border-bottom: 2px solid ${({theme}) => theme.colors.primary};
        box-shadow: 0 2px 8px -4px ${({theme}) => theme.colors.primary};
    }
`;

const CustomSelect = styled.select`
    appearance: none; /* This removes the dropdown arrow */
    background: transparent;
    border-radius: 4px;
    padding: 3px;
    color: inherit;
    font-size: 0.9em;
    cursor: pointer;
    outline: none;
    text-align: center; /* This centers the text */
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none;
`;

const SelectWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 10px;
    margin-right: 10px;
`;


const PlayerControls = styled.div`
    display: flex;
    align-items: center;
    //gap: 10px;
`;

interface TextContainerProps {
    $isMobile: boolean;
}

const TextContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    // background: 
    //     radial-gradient(
    //         circle at center,
        //         ${() => toRGBA(cssFormatColors.neonBlue, 0.4)} 0%,
        //         ${() => toRGBA(cssFormatColors.neonBlue, 0.3)} 50%,
        //         ${() => toRGBA(cssFormatColors.neonBlue, 0.2)} 80%
    //     ),
        //     ${() => toRGBA(cssFormatColors.darkGrey, .2)}; 
    margin: 0;

    color: ${() => toRGBA(cssFormatColors.darkGrey, 0.8)};
    transition: all 0.3s ease;
    padding: 8px 8px;
    height: 100%;
    width: 100%;
    min-width: 300px;
    max-width: 400px;
    max-height: 500px;
    overflow: hidden;
    clip-path: polygon(
            7% 10%,
            20% 10%,
            35% 10%,
            37% 13%, /* turn*/ 65% 13%,
            68% 16%, /* turn*/ 75% 16%,
            92% 16%, /* turn*/ 95% 19%,
            95% 31%,
            95% 70%,
            98% 73%, /* turn*/ 98% 87%,
            95% 90%, /* turn*/ 65% 90%,
            40% 90%,
            37% 93%, /* turn*/ 12% 93%,
            5% 86%,
            5% 35%,
            0% 30%,
            0% 17%
    );
    text-align: center;

    ${ButtonContainer}:hover & {
    }
`;

const HeaderContainer = styled.div<TextContainerProps>`
    font-family: 'Orbitron', sans-serif;
    background: ${() => toRGBA(cssFormatColors.neonBlue, 0.75)};
    //padding: '8px 8px';
    margin: 0;
    color: orangered;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    height: 100%;
    width: 100%;
    overflow: hidden;
    //min-width: 280px;

    clip-path: polygon(
            8% 11%,
            34% 11%,
            36% 14%,
            64% 14%,
            67% 17%,
                /* right corner*/ 92% 17%,
            94% 19%,
            94% 21%,
            92% 19%,
            88% 19%,
                /* bottom bump*/ 92% 19%,
            70% 19%,
            67% 19%,
            60% 19%,
            52% 27%,
            7% 27%,
            2% 23%,
            2% 17%
    );

    text-align: center;
`;


const LeftCircleSVGContainer = styled.svg`
    position: absolute;
    left: 0;
    top: 65%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const RightCircleSVGContainer = styled.svg`
    position: absolute;
    right: 0;
    top: 36%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    pointer-events: none;
`;

const CircleMarker = styled.circle`
    fill: none;
    stroke: ${() => toRGBA(cssFormatColors.neonBlue, 0.8)};;
    stroke-width: 2;
`;


//
// Color picker
//
interface CustomColorPickerProps {
    player: Player;
    updatePlayer: (id: number, field: keyof Player, value: any) => void;
}

const ColorPickerWrapper = styled.div`
    position: relative;
    cursor: pointer;
    //border: 1px solid deeppink;
    display: inline-block; // This will make it only as large as its content
    line-height: 0; // This can help with any unexpected spacing
`;

const HiddenInput = styled.input`
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
    visibility: hidden;
    margin: 0;
    padding: 0;
    border: 0;
`;

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({player, updatePlayer}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <ColorPickerWrapper onClick={handleClick}>
            <HiddenInput
                ref={inputRef}
                type="color"
                value={player.color}
                onChange={(e) => updatePlayer(player.id, 'color', e.target.value)}
            />
            <AnimatedRings
                size={40}
                $isSelected={true}
                color={player.color}
            />
        </ColorPickerWrapper>
    );
};

const EditablePlayerName = ({player, updatePlayer}: {
    player: Player,
    updatePlayer: (id: number, field: keyof Player, value: any) => void
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(player.name);
    const MAX_LENGTH = 20;

    const handleBlur = () => {
        setIsEditing(false);
        updatePlayer(player.id, 'name', tempName);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempName(e.target.value.slice(0, MAX_LENGTH));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <>
            {isEditing ? (
                <PlayerNameInput
                    type="text"
                    value={tempName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_LENGTH}
                    autoFocus
                />
            ) : (
                <PlayerName onClick={() => setIsEditing(true)}>
                    {player.name}
                </PlayerName>
            )}
        </>
    );
};

const PlayerSelector: React.FC<FuturisticButtonProps> = ({
                                                             text,
                                                             onClick,
                                                             directToMenu

                                                         }) => {
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
    //
    //
    // animation variables
    //
    //
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showLines, setShowLines] = useState<boolean>(false);
    const [showDiagnolArrayLines, setShowDiagnolArrayLines] = useState<boolean>(false);
    const [topThickBar, setTopThickBar] = useState<boolean>(false);
    const [topThickOne, setTopThickOne] = useState<boolean>(false);
    const [topThickTwo, setTopThickTwo] = useState<boolean>(false);
    const [topThickThree, setTopThickThree] = useState<boolean>(false);
    const [topThickFour, setTopThickFour] = useState<boolean>(false);
    const [topThickFive, setTopThickFive] = useState<boolean>(false);
    const [topThickSix, setTopThickSix] = useState<boolean>(false);
    const [topThickSeven, setTopThickSeven] = useState<boolean>(false);
    const [topThickEight, setTopThickEight] = useState<boolean>(false);
    const [randomThickBottomBar, setRandomThickBottomBar] = useState<boolean>(false);
    // const topThickStartTime = 1000;
    // const thickBarSpeed = 10;
    // const repeatBarSpeed = 10;
    const thickBarSpeed = 10;
    const thinBarSpeed = directToMenu ? 0.001 : 10;
    const repeatBarSpeed = 100;

    // repeated bars vars
    const [topRepeatedBars, setTopRepeatedBars] = useState<boolean>(false);
    const [bottomRepeatedBars, setBottomRepeatedBars] = useState<boolean>(false);
    const {
        withSound,
    } = useSound();

    // timer for lines
    useEffect(() => {
        let topThickStartTime = 1000;
        let repeatedBarsStartTimie = 2700;

        if (directToMenu) {
            topThickStartTime = 0;
            repeatedBarsStartTimie = 1700;
            // If intro is complete, set all states immediately
            setShowLines(true);
        }

        // If intro is not complete, use timeouts
        const timers: NodeJS.Timeout[] = [];

        const timer1 = setTimeout(() => {
            setShowLines(true);
        }, 300);
        timers.push(timer1);

        // thick bars
        const timer2 = setTimeout(() => {
            setTopThickTwo(true);
        }, topThickStartTime);
        timers.push(timer2);

        const timer3 = setTimeout(() => {
            setTopThickOne(true);
        }, topThickStartTime + 50);
        timers.push(timer3);

        const timer4 = setTimeout(() => {
            setTopThickThree(true);
        }, topThickStartTime + 500);
        timers.push(timer4);

        const timer5 = setTimeout(() => {
            setTopThickFour(true);
        }, topThickStartTime + 550);
        timers.push(timer5);

        const timer6 = setTimeout(() => {
            setTopThickFive(true);
        }, topThickStartTime + 925);
        timers.push(timer6);

        const timer7 = setTimeout(() => {
            setTopThickSix(true);
        }, topThickStartTime + 1075);
        timers.push(timer7);

        const timer8 = setTimeout(() => {
            setTopThickSeven(true);
        }, topThickStartTime + 1750);
        timers.push(timer8);

        // repeated bars
        const timer9 = setTimeout(() => {
            setTopRepeatedBars(true);
            setBottomRepeatedBars(true);
            setRandomThickBottomBar(true);
        }, repeatedBarsStartTimie);
        timers.push(timer9);

        // Cleanup function to clear all timeouts
        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [directToMenu]); // Add directToMenu to dependency array
    //
    //
    // player manager logic
    //
    //

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
                name: 'player' + ' ' + (nextID),
                score: 0,
                direction: 'right',
                controlScheme: controlScheme,
                color: getUserDefaultColor(players),
                alive: true,
            } as Player];

            newPlayers = calculatePlayerStartPositions(newPlayers, gridSize);

            setPlayers([...newPlayers]);
            if (controlScheme !== 'bot') {
                setAvailableControlSchemes(availableControlSchemes.filter(scheme => scheme !== controlScheme));
            }
            setNewPlayer({});
            console.log(players);

        }
    };

    const updatePlayer = (id: number, field: keyof Player, value: any) => {
        if (gameStatus !== 'playing') {
            if (field === 'controlScheme') {
                const player = players.find(player => player.id === id);
                const oldScheme = player?.controlScheme;

                // Create new array of control schemes
                let newSchemes = [...availableControlSchemes];

                // Add old scheme back if it's not 'bot'
                if (oldScheme !== 'bot') {
                    newSchemes.push(oldScheme as ControlScheme);
                }

                // Remove new scheme if it's not 'bot'
                if (value !== 'bot') {
                    newSchemes = newSchemes.filter(scheme => scheme !== value);
                }

                console.log('Updated schemes:', newSchemes);
                setAvailableControlSchemes(newSchemes);

                // Update player with new control scheme
                setPlayers(players.map(p => {
                    if (p.id === id) {
                        if (value === 'bot') {
                            return {...p, controlScheme: value, type: 'bot'};
                        } else if (player?.type === 'bot' && value !== 'bot') {
                            return {...p, controlScheme: value, type: 'human'};
                        } else {
                            return {...p, controlScheme: value};
                        }
                    }
                    return p;
                }));
            } else {
                setPlayers(players.map(p => p.id === id ? {...p, [field]: value} : p));
            }
        }
    };
    const removePlayer = (id: number) => {
        console.log('remove player')
        try {
            if (gameStatus !== 'playing') {
                resetGame();
                const controlScheme = players.find(player => player.id === id)?.controlScheme;
                let newPlayers = players.filter(player => player.id !== id);
                newPlayers = calculatePlayerStartPositions(newPlayers, gridSize);
                setPlayers([...newPlayers]);

                if (controlScheme && controlScheme !== 'bot') {
                    setAvailableControlSchemes([...availableControlSchemes, controlScheme]);
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
        if (availableSchemes.length > 0) {
            return availableSchemes[0];
        } else {
            return 'bot';
        }
    }

    function getUserDefaultColor(players: Player[]): string {
        const neonColors = [
            "#FF00FF", // Magenta
            "#00FF00", // Lime
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
            "#FF0000", // Red
            "#FF6347", // Tomato
            "#00BFFF", // Deep sky blue
            "#FF00FF", // Fuchsia
            "#00FA9A", // Medium spring green
            "#FF1493", // Deep pink
            "#00FF00", // Lime (again, very noticeable)
            "#FF4081", // Pink (Material Design)
            "#FF3D00", // Deep Orange (Material Design)
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


    return (
        <ButtonContainer>
            <TextContainer $isMobile={isMobile}>
                <HeaderContainer $isMobile={isMobile}>
                </HeaderContainer>
                <TextElement>
                    Players
                </TextElement>
                <InnerContent>
                    {players.map(player => (
                        <PlayerCard key={player.id}>
                            <PlayerControls>
                                <CustomColorPicker player={player} updatePlayer={updatePlayer}/>
                                <EditablePlayerName player={player} updatePlayer={updatePlayer}/>
                            </PlayerControls>

                            <PlayerControls>
                                <SelectWrapper>
                                    <CustomSelect
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
                                    </CustomSelect>
                                    <TrashIcon
                                        // onClick={() => removePlayer(player.id)}
                                        onClick={() => withSound(() => removePlayer(player.id))()}

                                    />
                                </SelectWrapper>
                            </PlayerControls>
                        </PlayerCard>
                    ))}
                </InnerContent>
                <PlusButton
                    // onClick={addPlayer}
                    onClick={() => withSound(() => addPlayer())()}
                >
                    <CircleButton/>
                </PlusButton>

            </TextContainer>
            {showLines && (
                <div>
                    <SVGContainer viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/*                        all the way around*/}
                        <BorderPath
                            d={`
        M 0.5 30.5
        L 0.5 17
        L 8 9.5
        L 35 9.5
        L 37 12.5
        L 65.5 12.5
        L 68.5 15.5
        L 91.5 15.5
        L 94.5 19
        L 94.5 69.5
        L 97.5 72.5
        L 97.5 87
        L 94 90.5
        L 40 90.5
        L 37 93.5
        L 12.5 93.5
        L 5.5 86
        L 5.5 35.5
        L 0.5 30.5
    `}
                            $animationSpeed={thinBarSpeed} // 12 is good
                            strokeWidth={0.5}
                        />

                        {/*top thicks*/}

                        {topThickOne && (
                            <BorderPath
                                d={`
        M 37 11.8
        L 67.5 11.8

    `}
                                $animationSpeed={thickBarSpeed}
                                strokeWidth={2}
                            />
                        )}
                        {topThickTwo && (<BorderPath
                            d={`
        M 37.5 11.17
        L 36.5 11.8

    `}
                            $animationSpeed={thickBarSpeed}
                            strokeWidth={1}
                        />)}
                        {topThickThree && (<BorderPath
                            d={`
        M 66.5 11.8
        L 69.5 14.8

    `}
                            $animationSpeed={thickBarSpeed}
                            strokeWidth={3}
                        />)}
                        {topThickFour && (<BorderPath
                            d={`
        M 68.5 14
        L 92 14

    `}
                            $animationSpeed={thickBarSpeed}
                            strokeWidth={3.5}
                        />)}
                        {topThickFive && (<BorderPath
                            d={`
        M 91 13.05
        L 95.5 18.2

    `}
                            $animationSpeed={thickBarSpeed}
                            strokeWidth={2.5}
                        />)}
                        {topThickSix && (<BorderPath
                            d={`
        M 95.5 17.5
        L 95.5 69.5

    `}
                            $animationSpeed={thickBarSpeed}
                            strokeWidth={1.8}
                        />)}
                        {topThickSeven && (<BorderPath
                            d={`
        M 95.7 69
        L 95 70

    `}
                            $animationSpeed={thickBarSpeed}
                            strokeWidth={1.8}
                        />)}

                        {bottomRepeatedBars && (
                            <>
                                {Array.from({length: 17}).map((_, index) => (
                                    <BorderPath
                                        key={index}
                                        d={`
            M ${88 - (index * 3)} 94.5
            L ${91 - (index * 3)} 91.5
        `}
                                        $animationSpeed={repeatBarSpeed}
                                        strokeWidth={1.5}
                                    />
                                ))}</>
                        )}

                        {/*             top           repeats*/}
                        {topRepeatedBars && (
                            <>
                                {Array.from({length: 8}).map((_, index) => (
                                    <BorderPath
                                        key={index}
                                        d={`
            M ${89 - (index * 3)} 13
            L ${91 - (index * 3)} 15
        `}
                                        $animationSpeed={repeatBarSpeed}
                                        strokeWidth={1.5}
                                        color={toRGBA(cssFormatColors.darkGrey, 1)}
                                    />
                                ))}</>
                        )}

                        {/*    random bottom bar*/}
                        {randomThickBottomBar && (
                            <BorderPath
                                d={`
        M 30 91.5
        L 13.5 91.5
        L 9.5 87.5

    `}
                                $animationSpeed={thickBarSpeed}
                                strokeWidth={1.5}
                            />
                        )}


                    </SVGContainer>
                </div>
            )}
        </ButtonContainer>
    );
};
export default PlayerSelector;