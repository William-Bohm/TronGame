import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TronGame from "./TronGame";
import MainMenu from "./components/mainMenu/MainMenu";
import ThreeScene3 from "./components/newAnimations/ThreeScene3";
import TronGame2 from "./TronGame2";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TronGame />} />
        <Route path="/menu" element={<ThreeScene3 />} />
        <Route path="/main" element={<TronGame2 />} />
      </Routes>
    </Router>
  );
};

export default App;