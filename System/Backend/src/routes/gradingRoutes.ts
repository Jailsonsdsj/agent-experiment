import { Router } from 'express';
import { gradeExam } from '../controllers/gradingController';

const router = Router();

router.post('/grade', gradeExam);

export default router;
