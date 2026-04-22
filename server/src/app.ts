import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.routes';
import scoreRoutes from './routes/score.routes';
import studyRoutes from './routes/study.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    service: 'UniMar API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/games', gameRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/study', studyRoutes);

app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🌊 UniMar API running at http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
});

export default app;
