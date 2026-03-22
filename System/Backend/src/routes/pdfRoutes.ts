import { Router } from 'express';
import { generatePdf } from '../controllers/pdfController';

const router = Router();

router.post('/generate-pdf', generatePdf);

export default router;
