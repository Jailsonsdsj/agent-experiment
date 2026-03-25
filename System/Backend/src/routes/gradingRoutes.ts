import { Router } from 'express';
import { gradeExam } from '../controllers/gradingController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.post(
  '/grade',
  upload.fields([
    { name: 'answerKey', maxCount: 1 },
    { name: 'responses', maxCount: 1 },
  ]),
  gradeExam,
);

export default router;
