import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import TronGame2 from "./TronGame2";

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
            </Routes>
        </Router>
    );
};

export default App;