import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
} from "lucide-react";
import { useSound } from "../context/SoundContext";
import EmojiImg from "../components/EmojiImg";

// 0 = Caminho, 1 = Parede, 2 = Filhote, 3 = Saída
const INITIAL_MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const TOTAL_BABIES = 6;
const TIME_LIMIT = 60;

export default function MangroveMazeGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "victory">("start");
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [babiesCollected, setBabiesCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const stateRef = useRef({ gameState: "start" });
  useEffect(() => { stateRef.current.gameState = gameState; }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("gameover");
            playWrong();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, playWrong]);

  // FUNÇÃO DE MOVIMENTO CORRIGIDA
  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (stateRef.current.gameState !== "playing") return;

      const nx = playerPos.x + dx;
      const ny = playerPos.y + dy;

      // 1. Verifica limites
      if (nx >= 0 && nx < 24 && ny >= 0 && ny < 25) {
        const cell = maze[ny][nx];

        // 2. Se for parede, não faz nada
        if (cell === 1) return;

        // 3. Se for caranguejo (valor 2)
        if (cell === 2) {
          playCorrect();
          // Remove o caranguejo do labirinto antes de atualizar o score
          setMaze((prevMaze) => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[ny][nx] = 0;
            return newMaze;
          });
          // Soma exatamente +1 ao score
          setBabiesCollected((prev) => prev + 1);
        }

        // 4. Se for a saída (valor 3)
        if (cell === 3) {
          if (babiesCollected >= TOTAL_BABIES) {
            setGameState("victory");
            playFanfare();
          } else {
            playWrong();
            return; // Impede de entrar na bandeira se não tiver todos
          }
        }

        // 5. Atualiza a posição apenas no final
        setPlayerPos({ x: nx, y: ny });
      }
    },
    [maze, playerPos, babiesCollected, playCorrect, playWrong, playFanfare]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); movePlayer(0, -1); }
      if (["ArrowDown", "s", "S"].includes(e.key)) { e.preventDefault(); movePlayer(0, 1); }
      if (["ArrowLeft", "a", "A"].includes(e.key)) { e.preventDefault(); movePlayer(-1, 0); }
      if (["ArrowRight", "d", "D"].includes(e.key)) { e.preventDefault(); movePlayer(1, 0); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const startGame = () => {
    setMaze(INITIAL_MAZE.map((row) => [...row]));
    setPlayerPos({ x: 1, y: 1 });
    setBabiesCollected(0);
    setTimeLeft(TIME_LIMIT);
    setGameState("playing");
  };

  const getCellContent = (val: number, x: number, y: number) => {
    if (playerPos.x === x && playerPos.y === y) return <EmojiImg emoji="🦀" size="1.1rem" />;
    if (val === 1) return <EmojiImg emoji="🌿" size="1.1rem" />;
    if (val === 2) return <EmojiImg emoji="🦀" size="0.865rem" style={{ opacity: 0.7 }} />;
    if (val === 3) return <EmojiImg emoji="🏁" size="1.1rem" />;
    return "";
  };

  const getCellBg = (val: number) => {
    if (val === 1) return "#064E3B";
    if (val === 3) return "rgba(16,185,129,0.3)";
    return "rgba(255,255,255,0.05)";
  };

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 80px)", backgroundColor: "#022C22", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      
      <div style={{ position: "relative", zIndex: 10, padding: "12px 16px" }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <ArrowLeft size={12} /> Sair
          </button>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", padding: "10px", gap: "20px" }}>
        {gameState === "playing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.8 }}>
            <button onClick={() => movePlayer(0, -1)} style={controlBtnStyle}><ArrowUp size={20} /></button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => movePlayer(-1, 0)} style={controlBtnStyle}><ArrowLeftIcon size={20} /></button>
              <button onClick={() => movePlayer(1, 0)} style={controlBtnStyle}><ArrowRight size={20} /></button>
            </div>
            <button onClick={() => movePlayer(0, 1)} style={controlBtnStyle}><ArrowDown size={20} /></button>
          </div>
        )}

        {gameState !== "start" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", width: "min(80vh, 750px)", height: "min(80vh, 750px)", gap: "0.5px", background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div key={`${x}-${y}`} style={{ aspectRatio: "1", background: getCellBg(cell), borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", transition: "all 0.1s", transform: playerPos.x === x && playerPos.y === y ? "scale(1.2)" : "scale(1)", zIndex: playerPos.x === x && playerPos.y === y ? 5 : 1 }}>
                  {getCellContent(cell, x, y)}
                </div>
              ))
            )}
          </div>
        )}

        {gameState === "playing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", opacity: 0.9 }}>
            <div style={{ ...infoBoxStyle, color: timeLeft <= 10 ? "#EF4444" : "#E2E8F0" }}>
              <Clock size={20} /> {timeLeft}s
            </div>
            <div style={{ ...infoBoxStyle, color: "#FCD34D" }}>
              <EmojiImg emoji="🦀" size="1.2rem" /> {babiesCollected}/{TOTAL_BABIES}
            </div>
          </div>
        )}
      </div>

      {/* OVERLAYS DE ESTADO */}
      {gameState === "start" && (
        <div style={overlayStyle}>
          <div className="glass-card" style={cardStyle}>
            <EmojiImg emoji="🦀" size="4rem" style={emojiMainStyle} />
            <h1 style={titleStyle}>Resgate no Mangue</h1>
            <p style={textStyle}>
              Salve os <strong>{TOTAL_BABIES} filhotes</strong> antes que a maré suba!
            </p>
            <button className="btn-primary" onClick={startGame} style={startButtonStyle}>Iniciar Resgate!</button>
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div style={overlayStyle}>
          <div className="glass-card" style={cardStyle}>
            <EmojiImg emoji="⏱️" size="4rem" style={emojiMainStyle} />
            <h1 style={{ ...titleStyle, color: "#EF4444" }}>Tempo Esgotado</h1>
            <button className="btn-primary" onClick={startGame} style={startButtonStyle}>Tentar de Novo</button>
          </div>
        </div>
      )}

      {gameState === "victory" && (
        <div style={overlayStyle}>
          <div className="glass-card" style={cardStyle}>
            <EmojiImg emoji="🎉" size="4rem" style={emojiMainStyle} />
            <h1 style={{ ...titleStyle, color: "#FCD34D" }}>Missão Cumprida!</h1>
            <p style={textStyle}>Você salvou todos os {TOTAL_BABIES} filhotes!</p>
            <button className="btn-primary" onClick={startGame} style={startButtonStyle}>Jogar Novamente</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ESTILOS AUXILIARES
const controlBtnStyle = { padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", cursor: "pointer" };
const infoBoxStyle = { background: "rgba(0,0,0,0.4)", padding: "12px 16px", borderRadius: "12px", display: "flex", gap: "8px", alignItems: "center", fontWeight: 800, fontSize: "1.1rem", border: "1px solid rgba(16,185,129,0.2)" };
const overlayStyle: any = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)", zIndex: 20 };
const cardStyle: any = { padding: "40px", maxWidth: "500px", textAlign: "center", margin: "20px" };
const titleStyle: any = { fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "2.2rem", color: "#10B981", marginBottom: "16px" };
const textStyle: any = { color: "#E2E8F0", marginBottom: "24px", lineHeight: 1.6 };
const emojiMainStyle: any = { marginBottom: "16px", display: "block", margin: "0 auto 16px" };
const startButtonStyle: any = { padding: "16px 32px", fontSize: "1.2rem", borderRadius: "12px", width: "100%", background: "linear-gradient(135deg, #10B981, #059669)", border: "none", color: "white", cursor: "pointer" };