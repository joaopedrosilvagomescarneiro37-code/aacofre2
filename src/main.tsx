import React from 'react';
import ReactDOM from 'react-dom/client';
import { SafeScene } from './scene/SafeScene';
import { GameUI } from './ui/GameUI';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './style.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><main className="game"><SafeScene/><GameUI/></main></React.StrictMode>);
