import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {TronProvider} from "./context/GameContext";
import './app.css';
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
      <TronProvider>
        <App />
      </TronProvider>
);
// root.render(
//   <React.StrictMode>
//       <TronProvider>
//         <App />
//       </TronProvider>
//   </React.StrictMode>
// );