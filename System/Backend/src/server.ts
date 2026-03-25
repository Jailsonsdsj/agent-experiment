import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helloRoutes from './routes/helloRoutes';
import pdfRoutes from './routes/pdfRoutes';
import gradingRoutes from './routes/gradingRoutes';
import { errorHandler } from './middlewares/errorHandler';

const PORT = process.env.PORT ?? '3333';
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  console.error('Missing required environment variable: FRONTEND_URL');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use(helloRoutes);
app.use(pdfRoutes);
app.use(gradingRoutes);

app.use(errorHandler);

app.listen(Number(PORT), () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
