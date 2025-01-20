// AudioControllerModal.tsx
import React from 'react';
// AudioControlStyles.ts
import styled from 'styled-components';
import {useSound} from "../../../../context/AudioContext";
import {cssFormatColors} from "../../../../threeJSMeterials";
import {TypeWriterText} from "./TypeWriterText";

export const AudioControlContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    width: 100%;
    //max-width: 400px;

`;

export const ControlSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const SliderContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

export const Label = styled.label`
    color: ${cssFormatColors.neonBlue};
    font-size: 1.2rem;
    //text-transform: uppercase;
    letter-spacing: 2px;
        // text-shadow: 0 0 10px ${cssFormatColors.neonBlue};
`;

export const Slider = styled.input<{ disabled: boolean }>`
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: transparent;
    border-radius: 2px;
    outline: none;
    opacity: ${props => props.disabled ? 0.5 : 1};
    transition: opacity 0.2s;

    &::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        background: ${cssFormatColors.darkGrey};
        border-radius: 2px;
    }

    &::-moz-range-track {
        width: 100%;
        height: 4px;
        background: ${cssFormatColors.darkGrey};
        border-radius: 2px;
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: ${cssFormatColors.neonBlue};
        border-radius: 50%;
        cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
        box-shadow: ${props => props.disabled ? 'none' : `0 0 10px ${cssFormatColors.neonBlue}`};
        margin-top: -8px;
    }
`;

// AudioControlStyles.ts
export const SwitchContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

export const SwitchLabel = styled.span`
    color: ${cssFormatColors.neonBlue};
    font-size: 1.2rem;
    //text-transform: uppercase;
    letter-spacing: 2px;
        // text-shadow: 0 0 10px ${cssFormatColors.neonBlue};
`;

export const SwitchTrack = styled.div<{ isActive: boolean }>`
    position: relative;
    width: 60px;
    height: 30px;
    background: ${props => props.isActive ? cssFormatColors.neonBlue + '33' : '#1a1a1a'};
    border: 2px solid ${cssFormatColors.neonBlue};
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: ${props => props.isActive ? 1 : 0.5};
    // box-shadow: ${props => props.isActive ? `0 0 10px ${cssFormatColors.neonBlue}` : 'none'};

    &:hover {
        box-shadow: 0 0 15px ${cssFormatColors.neonBlue};
    }
`;

export const SwitchKnob = styled.div<{ isActive: boolean }>`
    position: absolute;
    top: 2px;
    left: ${props => props.isActive ? 'calc(100% - 24px)' : '2px'};
    width: 22px;
    height: 22px;
    background: ${cssFormatColors.neonBlue};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px ${cssFormatColors.neonBlue};

    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        opacity: ${props => props.isActive ? 0.8 : 0.3};
        transition: all 0.3s ease;
    }
`;

export const StatusText = styled.span<{ isActive: boolean }>`
    color: ${cssFormatColors.neonBlue};
    font-size: 0.9rem;
    //text-transform: uppercase;
    letter-spacing: 1px;
    opacity: ${props => props.isActive ? 1 : 0.6};
        // text-shadow: ${props => props.isActive ? `0 0 5px ${cssFormatColors.neonBlue}` : 'none'};
`;

interface SwitchProps {
    isActive: boolean;
    onToggle: () => void;
    label: string;
}

const Switch: React.FC<SwitchProps> = ({isActive, onToggle, label}) => {
    return (
        <SwitchContainer>
            <SwitchLabel>{label}</SwitchLabel>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <SwitchTrack isActive={isActive} onClick={onToggle}>
                    <SwitchKnob isActive={isActive}/>
                </SwitchTrack>
                <StatusText isActive={isActive}>
                    {isActive ? 'On' : 'Off'}
                </StatusText>
            </div>
        </SwitchContainer>
    );
};

interface AudioControllerModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export const AudioControllerContent: React.FC = () => {
    const {
        isMusicEnabled,
        musicVolume,
        isSoundEffectsEnabled,
        soundEffectsVolume,
        toggleMusicEnabled,
        setMusicVolume,
        toggleSoundEffects,
        setSoundEffectsVolume
    } = useSound();

    return (
        <AudioControlContainer>
            {/* Title section is handled by your TypeWriterText component */}
            <div style={{fontSize: 30, textAlign: 'center'}}>
                <TypeWriterText
                    text="Audio Settings"
                    delay={0}
                    speed={30}
                />
            </div>

            <ControlSection>
                <SliderContainer>
                    <Label>
                        <Switch
                            isActive={isMusicEnabled}
                            onToggle={toggleMusicEnabled}
                            label="Music Volume"
                        />
                    </Label>
                    <Slider
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                        disabled={!isMusicEnabled}
                    />
                </SliderContainer>
            </ControlSection>

            <ControlSection>
                <SliderContainer>
                    <Switch
                        isActive={isSoundEffectsEnabled}
                        onToggle={toggleSoundEffects}
                        label="Sound Effects"
                    /> <Slider
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={soundEffectsVolume}
                    onChange={(e) => setSoundEffectsVolume(parseFloat(e.target.value))}
                    disabled={!isSoundEffectsEnabled}
                />
                </SliderContainer>
            </ControlSection>
        </AudioControlContainer>
    );
};
