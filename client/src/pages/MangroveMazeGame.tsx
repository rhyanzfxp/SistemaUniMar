import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
} from "lucide-react";
import { useSound } from "../context/SoundContext";
import EmojiImg from "../components/EmojiImg";
import ScoreSaver from "../components/game/ScoreSaver";

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
const SHARK_SPAWN_TIME = 10;
const SHARK_MOVE_DELAY = 1000; // 1 segundo entre movimentos

export default function MangroveMazeGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();
  const [gameState, setGameState] = useState<
    "start" | "playing" | "gameover" | "victory"
  >("start");
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [babiesCollected, setBabiesCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [sharkPos, setSharkPos] = useState({ x: -1, y: -1 });
  const [sharkActive, setSharkActive] = useState(false);
  const [loseReason, setLoseReason] = useState<"timeout" | "shark">("timeout");

  const stateRef = useRef<{
    gameState: "start" | "playing" | "gameover" | "victory";
    playerPos: { x: number; y: number };
    sharkPos: { x: number; y: number };
    maze: number[][];
  }>({
    gameState: "start",
    playerPos: { x: 1, y: 1 },
    sharkPos: { x: -1, y: -1 },
    maze: [],
  });
  const pressedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);
  useEffect(() => {
    stateRef.current.playerPos = playerPos;
  }, [playerPos]);
  useEffect(() => {
    stateRef.current.sharkPos = sharkPos;
  }, [sharkPos]);
  useEffect(() => {
    stateRef.current.maze = maze;
  }, [maze]);

  useEffect(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setLoseReason("timeout");
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

  // Função para encontrar caminho do tubarão em direção ao jogador (BFS simples)
  const findPathToPlayer = (
    sharkStart: { x: number; y: number },
    playerTarget: { x: number; y: number },
    currentMaze: number[][],
  ) => {
    const queue: Array<{
      x: number;
      y: number;
      path: Array<{ x: number; y: number }>;
    }> = [{ x: sharkStart.x, y: sharkStart.y, path: [] }];
    const visited = new Set<string>();
    visited.add(`${sharkStart.x},${sharkStart.y}`);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;

      if (current.x === playerTarget.x && current.y === playerTarget.y) {
        return current.path.length > 0 ? current.path[0] : null;
      }

      // Explorar vizinhos (cima, baixo, esquerda, direita)
      const neighbors = [
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
      ];

      for (const next of neighbors) {
        if (
          next.x >= 0 &&
          next.x < 24 &&
          next.y >= 0 &&
          next.y < 25 &&
          !visited.has(`${next.x},${next.y}`) &&
          currentMaze[next.y]?.[next.x] !== 1
        ) {
          visited.add(`${next.x},${next.y}`);
          queue.push({
            x: next.x,
            y: next.y,
            path: [...current.path, { x: next.x, y: next.y }],
          });
        }
      }
    }
    return null;
  };

  // Timer do tubarão se mover
  useEffect(() => {
    if (gameState !== "playing" || !sharkActive) return;

    const sharkMoveTimer = setInterval(() => {
      const nextPos = findPathToPlayer(
        stateRef.current.sharkPos,
        stateRef.current.playerPos,
        stateRef.current.maze,
      );

      if (nextPos) {
        setSharkPos(nextPos);

        // Verifica colisão com jogador
        if (
          nextPos.x === stateRef.current.playerPos.x &&
          nextPos.y === stateRef.current.playerPos.y
        ) {
          setLoseReason("shark");
          setGameState("gameover");
          playWrong();
        }
      }
    }, SHARK_MOVE_DELAY);

    return () => clearInterval(sharkMoveTimer);
  }, [gameState, sharkActive, playWrong]);

  // Ativa o tubarão após 10 segundos
  useEffect(() => {
    if (gameState === "playing") {
      const spawnTimer = setTimeout(() => {
        // Spawn do tubarão em uma posição aleatória
        const randomX = Math.floor(Math.random() * 24);
        const randomY = Math.floor(Math.random() * 25);
        setSharkPos({ x: randomX, y: randomY });
        setSharkActive(true);
      }, SHARK_SPAWN_TIME * 1000);

      return () => clearTimeout(spawnTimer);
    }
  }, [gameState]);

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
            const newMaze = prevMaze.map((row) => [...row]);
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
    [maze, playerPos, babiesCollected, playCorrect, playWrong, playFanfare],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se a tecla já está pressionada
      if (pressedKeysRef.current.has(e.key)) return;

      pressedKeysRef.current.add(e.key);

      if (["ArrowUp", "w", "W"].includes(e.key)) {
        e.preventDefault();
        movePlayer(0, -1);
      }
      if (["ArrowDown", "s", "S"].includes(e.key)) {
        e.preventDefault();
        movePlayer(0, 1);
      }
      if (["ArrowLeft", "a", "A"].includes(e.key)) {
        e.preventDefault();
        movePlayer(-1, 0);
      }
      if (["ArrowRight", "d", "D"].includes(e.key)) {
        e.preventDefault();
        movePlayer(1, 0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [movePlayer]);

  const finalScore = gameState === "victory" ? TOTAL_BABIES * 10 + timeLeft : babiesCollected * 10;

  const startGame = () => {
    setMaze(INITIAL_MAZE.map((row) => [...row]));
    setPlayerPos({ x: 1, y: 1 });
    setBabiesCollected(0);
    setTimeLeft(TIME_LIMIT);
    setSharkPos({ x: -1, y: -1 });
    setSharkActive(false);
    setLoseReason("timeout");
    setGameState("playing");
  };

  const getCellContent = (val: number, x: number, y: number) => {
    if (sharkPos.x === x && sharkPos.y === y)
      return <EmojiImg emoji="🌊" size="1.2em" />;
    if (playerPos.x === x && playerPos.y === y)
      return <EmojiImg emoji="🦀" size="1.2em" />;
    if (val === 1) return <EmojiImg emoji="🌿" size="1.2em" />;
    if (val === 2)
      return <EmojiImg emoji="🦀" size="0.9em" style={{ opacity: 0.7 }} />;
    if (val === 3) return <EmojiImg emoji="🏁" size="1.2em" />;
    return "";
  };

  const getCellBg = (val: number) => {
    if (val === 1) return "#064E3B";
    if (val === 3) return "rgba(16,185,129,0.3)";
    return "rgba(255,255,255,0.05)";
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#022C22",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 10, padding: "12px 16px" }}>
        <Link to="/games">
          <button
            className="btn-secondary"
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ArrowLeft size={12} /> Sair
          </button>
        </Link>
      </div>

      <div
        className="maze-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          gap: "20px",
        }}
      >
        {gameState === "playing" && (
          <div
            className="maze-controls-left"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              opacity: 0.8,
            }}
          >
            <button onClick={() => movePlayer(0, -1)} style={controlBtnStyle}>
              <ArrowUp size={24} />
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => movePlayer(-1, 0)} style={controlBtnStyle}>
                <ArrowLeftIcon size={24} />
              </button>
              <button onClick={() => movePlayer(1, 0)} style={controlBtnStyle}>
                <ArrowRight size={24} />
              </button>
            </div>
            <button onClick={() => movePlayer(0, 1)} style={controlBtnStyle}>
              <ArrowDown size={24} />
            </button>
          </div>
        )}

        {gameState !== "start" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
              width: "100%",
              maxWidth: "min(95vw, 80vh, 750px)",
              aspectRatio: "24/25",
              gap: "0.5px",
              background: "rgba(0,0,0,0.3)",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{
                    aspectRatio: "1",
                    background: getCellBg(cell),
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "min(3.5vw, 1.2rem)",
                    transition: "all 0.1s",
                    transform:
                      playerPos.x === x && playerPos.y === y
                        ? "scale(1.2)"
                        : "scale(1)",
                    zIndex: playerPos.x === x && playerPos.y === y ? 5 : 1,
                  }}
                >
                  {getCellContent(cell, x, y)}
                </div>
              )),
            )}
          </div>
        )}

        {gameState === "playing" && (
          <div
            className="maze-controls-right"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              opacity: 0.9,
            }}
          >
            <div
              style={{
                ...infoBoxStyle,
                color: timeLeft <= 10 ? "#EF4444" : "#E2E8F0",
              }}
            >
              <Clock size={20} /> {timeLeft}s
            </div>
            <div style={{ ...infoBoxStyle, color: "#FCD34D" }}>
              <EmojiImg emoji="🦀" size="1.2rem" /> {babiesCollected}/
              {TOTAL_BABIES}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .maze-container {
            flex-direction: column-reverse;
          }
          .maze-controls-left {
            margin-top: 10px;
          }
          .maze-controls-right {
            flex-direction: row !important;
            justify-content: center;
          }
        }
      `}</style>

      {/* OVERLAYS DE ESTADO */}
      {gameState === "start" && (
        <div style={overlayStyle}>
          <div className="glass-card" style={cardStyle}>
            <EmojiImg emoji="🦀" size="4rem" style={emojiMainStyle} />
            <h1 style={titleStyle}>Resgate no Mangue</h1>
            <p style={textStyle}>
              Salve os <strong>{TOTAL_BABIES} filhotes</strong> antes que a maré
              suba!
            </p>
            <button
              className="btn-primary"
              onClick={startGame}
              style={startButtonStyle}
            >
              Iniciar Resgate!
            </button>
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div style={overlayStyle}>
          <div className="glass-card" style={cardStyle}>
            <EmojiImg
              emoji={loseReason === "shark" ? "🌊" : "⏱️"}
              size="4rem"
              style={emojiMainStyle}
            />
            <h1 style={{ ...titleStyle, color: "#EF4444" }}>
              {loseReason === "shark"
                ? "Ah não! A maré pegou você!"
                : "Tempo Esgotado"}
            </h1>
            <p style={textStyle}>
              {loseReason === "shark"
                ? "A onda foi mais rápida... Tente novamente!"
                : ""}
            </p>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "18px", borderRadius: "14px", marginBottom: "18px" }}>
              <p style={{ color: "#94A3B8", margin: "0 0 6px" }}>Pontuação Final</p>
              <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "2.4rem", color: "#10B981", margin: 0 }}>{finalScore}</p>
            </div>
            <ScoreSaver gameId="mangrove-maze-001" score={finalScore} />
            <button
              className="btn-primary"
              onClick={startGame}
              style={startButtonStyle}
            >
              Tentar de Novo
            </button>
          </div>
        </div>
      )}

      {gameState === "victory" && (
        <div style={overlayStyle}>
          <div className="glass-card" style={cardStyle}>
            <EmojiImg emoji="🎉" size="4rem" style={emojiMainStyle} />
            <h1 style={{ ...titleStyle, color: "#FCD34D" }}>
              Missão Cumprida!
            </h1>
            <p style={textStyle}>
              Você salvou todos os {TOTAL_BABIES} filhotes!
            </p>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "18px", borderRadius: "14px", marginBottom: "18px" }}>
              <p style={{ color: "#94A3B8", margin: "0 0 6px" }}>Pontuação Final</p>
              <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "2.4rem", color: "#10B981", margin: 0 }}>{finalScore}</p>
            </div>
            <ScoreSaver gameId="mangrove-maze-001" score={finalScore} />
            <button
              className="btn-primary"
              onClick={startGame}
              style={startButtonStyle}
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ESTILOS AUXILIARES
const controlBtnStyle = {
  padding: "12px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
  cursor: "pointer",
};
const infoBoxStyle = {
  background: "rgba(0,0,0,0.4)",
  padding: "12px 16px",
  borderRadius: "12px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  fontWeight: 800,
  fontSize: "1.1rem",
  border: "1px solid rgba(16,185,129,0.2)",
};
const overlayStyle: any = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(2,6,23,0.85)",
  backdropFilter: "blur(8px)",
  zIndex: 20,
};
const cardStyle: any = {
  padding: "40px",
  maxWidth: "500px",
  textAlign: "center",
  margin: "20px",
};
const titleStyle: any = {
  fontFamily: "Outfit, sans-serif",
  fontWeight: 900,
  fontSize: "2.2rem",
  color: "#10B981",
  marginBottom: "16px",
};
const textStyle: any = {
  color: "#E2E8F0",
  marginBottom: "24px",
  lineHeight: 1.6,
};
const emojiMainStyle: any = {
  marginBottom: "16px",
  display: "block",
  margin: "0 auto 16px",
};
const startButtonStyle: any = {
  padding: "16px 32px",
  fontSize: "1.2rem",
  borderRadius: "12px",
  width: "100%",
  background: "linear-gradient(135deg, #10B981, #059669)",
  border: "none",
  color: "white",
  cursor: "pointer",
};
