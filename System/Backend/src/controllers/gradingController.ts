import { NextFunction, Request, Response } from 'express';
import { GradingMode } from '../types';
import { parseAnswerKey, parseStudentResponses } from '../services/csvService';
import { gradeExams } from '../services/gradingService';

const VALID_GRADING_MODES: readonly GradingMode[] = ['strict', 'lenient'];

export function gradeExam(req: Request, res: Response, next: NextFunction): void {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const answerKeyFile = files?.['answerKey']?.[0];
    const responsesFile = files?.['responses']?.[0];
    const gradingMode = req.body?.gradingMode as string | undefined;

    if (!answerKeyFile || !responsesFile) {
      res.status(400).json({ error: 'Both answerKey and responses CSV files are required.' });
      return;
    }

    if (!gradingMode || !VALID_GRADING_MODES.includes(gradingMode as GradingMode)) {
      res.status(400).json({ error: 'gradingMode must be "strict" or "lenient".' });
      return;
    }

    if (gradingMode === 'lenient') {
      res.status(501).json({ error: 'Lenient grading mode is not yet implemented.' });
      return;
    }

    const answerKey = parseAnswerKey(answerKeyFile.buffer.toString('utf-8'));
    const responses = parseStudentResponses(responsesFile.buffer.toString('utf-8'));
    const results = gradeExams(answerKey, responses, gradingMode as GradingMode);

    res.json(results);
  } catch (err) {
    next(err);
  }
}
