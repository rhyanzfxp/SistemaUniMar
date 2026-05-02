import { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import GamesHub from './pages/GamesHub';
import GamePlay from './pages/GamePlay';
import Leaderboard from './pages/Leaderboard';
import Learn from './pages/Learn';
import EcosystemGame from './pages/EcosystemGame';
import PollutionSimulator from './pages/PollutionSimulator';
import OceanCleanupGame from './pages/OceanCleanupGame';
import TurtleRunnerGame from './pages/TurtleRunnerGame';
import CoralDefenderGame from './pages/CoralDefenderGame';
import MangroveMazeGame from './pages/MangroveMazeGame';
import { useSound } from './context/SoundContext';

function AppInner() {
  const { recordUserInteraction } = useSound();
  const unlockedRef = useRef(false);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      recordUserInteraction();
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, [recordUserInteraction]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#050D1A',
      }}
      className="ocean-bg"
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/ecossistema" element={<EcosystemGame />} />
          <Route path="/games/poluicao" element={<PollutionSimulator />} />
          <Route path="/games/limpeza" element={<OceanCleanupGame />} />
          <Route path="/games/tartaruga" element={<TurtleRunnerGame />} />
          <Route path="/games/defensor" element={<CoralDefenderGame />} />
          <Route path="/games/mangue" element={<MangroveMazeGame />} />
          <Route path="/games/:slug" element={<GamePlay />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

