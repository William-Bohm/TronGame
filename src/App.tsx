import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TronGame from "./TronGame";
import MainMenu from "./components/mainMenu/MainMenu";

const App: React.FC = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<TronGame />} />
          <Route path="/game" element={<MainMenu />} />
        </Routes>
    </Router>
  );
};

export default App;