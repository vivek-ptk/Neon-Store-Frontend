import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Popular from './pages/Popular';
import MemeStorm from './pages/MemeStorm';
import MemeEvolution from './pages/MemeEvolution';
import MemeCreator from './components/MemeCreator';
import './styles/global.css';

function App() {
  const [isMemeCreatorOpen, setIsMemeCreatorOpen] = useState(false);

  const openMemeCreator = () => setIsMemeCreatorOpen(true);
  const closeMemeCreator = () => setIsMemeCreatorOpen(false);

  return (
    <Router>
      <div className="App neon-bg">
        <Navbar onOpenMemeCreator={openMemeCreator} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home onOpenMemeCreator={openMemeCreator} />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/meme-storm" element={<MemeStorm />} />
            <Route path="/meme-evolution" element={<MemeEvolution />} />
          </Routes>
        </main>
        <MemeCreator 
          isOpen={isMemeCreatorOpen} 
          onClose={closeMemeCreator}
        />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#00ffff',
              border: '1px solid #00ffff',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;
