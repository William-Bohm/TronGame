import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
// import TronGame from "./TronGame";
// import MainMenu from "./components/mainMenu/MainMenu";
// import ThreeScene3 from "./components/newAnimations/ThreeScene3";
import TronGame2 from "./TronGame2";
import styled, {keyframes} from "styled-components";
import TronGame from "./TronGame";


const App: React.FC = () => {
    // Preload the font immediately when the app starts
    const fontPreloader = new FontFace(
        'Orbitron',
        "url('/font/Orbitron/Orbitron-VariableFont_wght.ttf')"
    );

    fontPreloader.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
    }).catch((error) => {
        console.error('Font loading failed:', error);
    });


    return (
        <Router>
            <Routes>
                <Route path="/" element={<TronGame2 directToMenu={false}/>}/>
                <Route path="/menu" element={<TronGame2 directToMenu={true} directToGame={false}/>}/>
                <Route path="/game" element={<TronGame2 directToGame={true}/>}/>
                <Route path="/old" element={<TronGame/>}/>
            </Routes>
        </Router>
    );
};

export default App;