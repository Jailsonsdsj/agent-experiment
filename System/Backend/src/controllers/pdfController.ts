import { NextFunction, Request, Response } from 'express';
import { GeneratePdfRequestBody } from '../types';
import { generateExamZip } from '../services/pdfService';

const VALID_IDENTIFICATION_MODES = ['letters', 'powers-of-two'] as const;

function isValidRequestBody(body: unknown): body is GeneratePdfRequestBody {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;

  const exam = b['exam'];
  if (typeof exam !== 'object' || exam === null) return false;
  const e = exam as Record<string, unknown>;
  if (typeof e['title'] !== 'string' || e['title'].trim() === '') return false;
  if (typeof e['teacherName'] !== 'string' || e['teacherName'].trim() === '') return false;
  if (!VALID_IDENTIFICATION_MODES.includes(e['identificationMode'] as never)) return false;

  const questions = b['questions'];
  if (!Array.isArray(questions) || questions.length === 0) return false;
  for (const q of questions) {
    if (typeof q !== 'object' || q === null) return false;
    const qObj = q as Record<string, unknown>;
    if (typeof qObj['statement'] !== 'string' || qObj['statement'].trim() === '') return false;
    if (!Array.isArray(qObj['alternatives']) || qObj['alternatives'].length === 0) return false;
  }

  const copies = b['copies'];
  if (typeof copies !== 'number' || !Number.isInteger(copies) || copies < 1) return false;

  return true;
}

export async function generatePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!isValidRequestBody(req.body)) {
    res.status(400).json({
      error:
        'Invalid request body. Required: exam (title, teacherName, identificationMode), questions (non-empty array with statement and alternatives), copies (integer ≥ 1).',
    });
    return;
  }

  try {
    const zipBuffer = await generateExamZip(req.body);
    const filename = `${req.body.exam.title.replace(/[^a-z0-9_\-. ]/gi, '_')}.zip`;
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (err) {
    next(err);
  }
}
