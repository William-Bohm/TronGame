import React, { useEffect, useState, useCallback } from 'react';
import TronGame from "./TronGame";
import ThreeScene from "./components/animations/ThreeScene";
import CubeToLetter from "./components/animations/cubeToLetter";


const App: React.FC = () => {
  return (
      <div>
          <CubeToLetter/>
          {/*<ThreeScene/>*/}
        {/*<TronGame/>*/}
      </div>
  );
};

export default App;