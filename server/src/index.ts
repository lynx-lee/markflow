import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { exportRouter } from './routes/export.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/export', exportRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`MarkFlow Server running on http://localhost:${PORT}`);
});

export default app;
