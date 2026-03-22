import express, { Request, Response } from 'express';
import helloRoutes from './routes/helloRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

app.use(helloRoutes);

app.listen(PORT, () => {
  console.log('Hello World');
  console.log(`Server running on http://localhost:${PORT}`);
});
