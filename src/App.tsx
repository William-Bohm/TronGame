import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TronGame from "./TronGame";
import MainMenu from "./components/mainMenu/MainMenu";
import ThreeScene2 from "./components/newAnimations/ThreeScene2";
import ThreeScene3 from "./components/newAnimations/ThreeScene3";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TronGame />} />
        <Route path="/menu" element={<ThreeScene3 />} />
      </Routes>
    </Router>
  );
};

export default App;