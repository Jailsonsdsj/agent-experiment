import express from 'express';
import pdfRoutes from '../../src/routes/pdfRoutes';
import gradingRoutes from '../../src/routes/gradingRoutes';
import { errorHandler } from '../../src/middlewares/errorHandler';

// Minimal Express app for testing — no CORS, no env-var requirements, no .listen().
// Mounts only the routes under test so each test feature file stays isolated.
const app = express();
app.use(express.json());
app.use(pdfRoutes);
app.use(gradingRoutes);
app.use(errorHandler);

export default app;
