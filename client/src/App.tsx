import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import GamesHub from './pages/GamesHub';
import GamePlay from './pages/GamePlay';
import Leaderboard from './pages/Leaderboard';
import Learn from './pages/Learn';
import EcosystemGame from './pages/EcosystemGame';

export default function App() {
  return (
    <BrowserRouter>
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
            <Route path="/games/:slug" element={<GamePlay />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

