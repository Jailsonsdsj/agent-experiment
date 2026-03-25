import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import {
  Alternative,
  AnswerKeyRow,
  ExamIdentificationMode,
  GeneratePdfRequestBody,
  QuestionPayload,
} from '../types';
import { shuffle } from '../utils/shuffle';
import { buildAnswerKeyCsv } from './csvService';

const LETTER_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const POWER_LABELS = [1, 2, 4, 8, 16, 32, 64, 128];

const MARGIN = 50;
const HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 30;

function getAlternativeLabel(index: number, mode: ExamIdentificationMode): string {
  if (mode === 'letters') return LETTER_LABELS[index] ?? String(index + 1);
  return String(POWER_LABELS[index] ?? Math.pow(2, index));
}

function deriveAnswer(shuffledAlts: Alternative[], mode: ExamIdentificationMode): string {
  if (mode === 'letters') {
    return shuffledAlts
      .map((alt, i) => (alt.isCorrect ? getAlternativeLabel(i, mode) : ''))
      .filter(Boolean)
      .join('');
  }
  return String(
    shuffledAlts.reduce(
      (sum, alt, i) => sum + (alt.isCorrect ? (POWER_LABELS[i] ?? Math.pow(2, i)) : 0),
      0,
    ),
  );
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, teacherName: string, date: string): void {
  const y = MARGIN;
  doc.fontSize(9).fillColor('#555555');
  doc.text(title, MARGIN, y, { width: 200, align: 'left', lineBreak: false });
  doc.text(teacherName, MARGIN + 200, y, { width: 180, align: 'center', lineBreak: false });
  doc.text(date, MARGIN + 380, y, { width: 150, align: 'right', lineBreak: false });
  doc.moveTo(MARGIN, y + 16).lineTo(doc.page.width - MARGIN, y + 16).strokeColor('#cccccc').stroke();
  doc.fillColor('#000000');

  // Reset cursor to the top-left of the content area so body text flows from the left
  doc.x = doc.page.margins.left;
  doc.y = doc.page.margins.top;
}

// Footer is drawn after all content is added (bufferPages mode) to avoid triggering
// pdfkit's auto-pagination check, which would cause infinite recursion via pageAdded.
function drawFooter(doc: PDFKit.PDFDocument, examNumber: number): void {
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  const y = doc.page.height - MARGIN - 14;
  doc.moveTo(MARGIN, y - 4).lineTo(doc.page.width - MARGIN, y - 4).strokeColor('#cccccc').stroke();
  doc.fontSize(9).fillColor('#555555').text(`Exam #${examNumber}`, MARGIN, y, {
    width: doc.page.width - MARGIN * 2,
    align: 'center',
    lineBreak: false,
  });
  doc.fillColor('#000000');

  doc.page.margins.bottom = originalBottomMargin;
}

function buildExamPdf(
  examNumber: number,
  exam: GeneratePdfRequestBody['exam'],
  shuffledQuestions: Array<{ question: QuestionPayload; shuffledAlts: Alternative[] }>,
  date: string,
): Promise<{ pdf: Buffer; answerKeyRow: AnswerKeyRow }> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
      margins: { top: MARGIN + HEADER_HEIGHT, bottom: MARGIN + FOOTER_HEIGHT, left: MARGIN, right: MARGIN },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      resolve({
        pdf: Buffer.concat(chunks),
        answerKeyRow: {
          examNumber,
          answers: shuffledQuestions.map((sq) => deriveAnswer(sq.shuffledAlts, exam.identificationMode)),
        },
      });
    });
    doc.on('error', reject);

    const pageOptions = { size: 'A4' as const };

    doc.on('pageAdded', () => {
      drawHeader(doc, exam.title, exam.teacherName, date);
    });

    doc.addPage(pageOptions);

    shuffledQuestions.forEach((sq, qIndex) => {
      const { question, shuffledAlts } = sq;

      if (doc.y > doc.page.height - MARGIN - FOOTER_HEIGHT - 80) {
        doc.addPage(pageOptions);
      }

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`${qIndex + 1}. ${question.statement}`, { paragraphGap: 4 });

      doc.font('Helvetica').fontSize(10);

      shuffledAlts.forEach((alt, aIndex) => {
        const label = getAlternativeLabel(aIndex, exam.identificationMode);
        doc.text(`   ${label}) ${alt.description}`, { paragraphGap: 2 });
      });

      const answerPrompt =
        exam.identificationMode === 'letters' ? 'Answer: _____________' : 'Sum: _____________';

      doc.moveDown(0.4).text(answerPrompt, { paragraphGap: 12 }).moveDown(0.8);
    });

    doc.moveDown(1);
    if (doc.y > doc.page.height - MARGIN - FOOTER_HEIGHT - 60) {
      doc.addPage(pageOptions);
    }
    doc.moveTo(MARGIN, doc.y).lineTo(doc.page.width - MARGIN, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica').text('Name: _______________________________________________', { paragraphGap: 14 });
    doc.text('CPF:  _______________________________________________');

    // Stamp footer on every buffered page now that content is complete
    const { start, count } = doc.bufferedPageRange();
    for (let i = 0; i < count; i++) {
      doc.switchToPage(start + i);
      drawFooter(doc, examNumber);
    }

    doc.flushPages();
    doc.end();
  });
}

function buildZip(files: { name: string; data: Buffer }[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
    for (const file of files) {
      archive.append(file.data, { name: file.name });
    }
    archive.finalize();
  });
}

export async function generateExamZip(input: GeneratePdfRequestBody): Promise<Buffer> {
  const { exam, questions, copies } = input;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const pdfFiles: { name: string; data: Buffer }[] = [];
  const answerKeyRows: AnswerKeyRow[] = [];

  for (let i = 1; i <= copies; i++) {
    const shuffledQuestions = shuffle(questions).map((q) => ({
      question: q,
      shuffledAlts: shuffle(q.alternatives),
    }));

    const { pdf, answerKeyRow } = await buildExamPdf(i, exam, shuffledQuestions, date);
    pdfFiles.push({ name: `exam_${i}.pdf`, data: pdf });
    answerKeyRows.push(answerKeyRow);
  }

  const csvContent = buildAnswerKeyCsv(answerKeyRows);
  const csvBuffer = Buffer.from(csvContent, 'utf-8');

  const allFiles = [...pdfFiles, { name: 'answer_key.csv', data: csvBuffer }];
  return buildZip(allFiles);
}
