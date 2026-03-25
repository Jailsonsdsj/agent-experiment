import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { inflateSync, inflateRawSync } from 'node:zlib';
import { generateExamZip } from '../../src/services/pdfService';
import type {
  Alternative,
  ExamIdentificationMode,
  ExamPayload,
  QuestionPayload,
} from '../../src/types';
import type { AppWorld } from '../support/world';

// ── Fixtures ──────────────────────────────────────────────────

function makeAlt(description: string, isCorrect: boolean): Alternative {
  return { id: crypto.randomUUID(), description, isCorrect };
}

function makeQuestion(statement: string, altCount: number): QuestionPayload {
  const alternatives = Array.from({ length: altCount }, (_, i) =>
    makeAlt(`Alt ${i + 1}`, i === 0),
  );
  return {
    id: crypto.randomUUID(),
    statement,
    alternatives,
    createdAt: new Date().toISOString(),
  };
}

function makeExamPayload(
  title: string,
  teacherName: string,
  mode: ExamIdentificationMode,
  questionIds: string[],
): ExamPayload {
  return {
    id: crypto.randomUUID(),
    title,
    teacherName,
    identificationMode: mode,
    questionIds,
    createdAt: new Date().toISOString(),
  };
}

// ── Minimal ZIP reader (Node built-ins only) ──────────────────
//
// Archiver sets the data-descriptor flag (bit 3), meaning compressed/uncompressed
// sizes are written AFTER the file data, not in the local file header (where they
// are 0). Sizes are always reliable in the Central Directory, so we:
//   1. Find the End of Central Directory record  (PK\x05\x06)
//   2. Walk the Central Directory entries        (PK\x01\x02) — accurate sizes here
//   3. Jump to each Local File Header            (PK\x03\x04) — to find data offset
//   4. Decompress using the size from step 2
//
// Central directory record layout (46 bytes + variable):
//   [0-3]   Signature 0x02014b50
//   [10-11] Compression method
//   [20-23] Compressed size
//   [28-29] File name length
//   [30-31] Extra field length
//   [32-33] File comment length
//   [42-45] Offset of local file header
//   [46+]   File name
//
// Local file header layout (30 bytes + variable):
//   [0-3]   Signature 0x04034b50
//   [26-27] File name length
//   [28-29] Extra field length
//   [30+]   File name, extra field, then file data

interface ZipEntry {
  name: string;
  data: Buffer;
}

function readZipEntries(zipBuffer: Buffer): ZipEntry[] {
  // Find end-of-central-directory record (search from end to skip any comment)
  const eocdSig = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const eocdPos = zipBuffer.lastIndexOf(eocdSig);
  if (eocdPos === -1) throw new Error('Not a valid ZIP: EOCD record not found');

  const cdOffset = zipBuffer.readUInt32LE(eocdPos + 16);
  const cdSize = zipBuffer.readUInt32LE(eocdPos + 12);

  const entries: ZipEntry[] = [];
  let cdPos = cdOffset;

  while (cdPos < cdOffset + cdSize) {
    if (zipBuffer.readUInt32LE(cdPos) !== 0x02014b50) break;

    const compressionMethod = zipBuffer.readUInt16LE(cdPos + 10);
    const compressedSize = zipBuffer.readUInt32LE(cdPos + 20);
    const fileNameLength = zipBuffer.readUInt16LE(cdPos + 28);
    const extraLength = zipBuffer.readUInt16LE(cdPos + 30);
    const commentLength = zipBuffer.readUInt16LE(cdPos + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(cdPos + 42);

    const name = zipBuffer.toString('utf8', cdPos + 46, cdPos + 46 + fileNameLength);

    // Resolve data start from local file header (field lengths may differ from CD)
    const localFileNameLength = zipBuffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = zipBuffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;

    const compressed = zipBuffer.subarray(dataStart, dataStart + compressedSize);

    let data: Buffer;
    if (compressionMethod === 0) {
      data = compressed;
    } else {
      try {
        data = inflateRawSync(compressed);
      } catch {
        data = inflateSync(compressed);
      }
    }

    entries.push({ name, data });
    cdPos += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

// ── PDF text extractor (Node built-ins only) ──────────────────
//
// PDFKit compresses content streams with /Filter /FlateDecode (zlib RFC 1950).
// Text is stored as hex strings inside TJ arrays: [<hex> kern <hex>...] TJ
// or as literal strings: (text) Tj.
//
// Strategy:
//   1. Find and decompress each stream...endstream block with inflateSync.
//   2. From the decompressed PDF operators, decode text by extracting:
//      - Hex segments <...> from TJ arrays → convert hex pairs to chars
//      - Literal segments (...) from Tj/TJ  → use as-is

function decodePdfOperators(stream: string): string {
  let result = '';

  // TJ arrays: [<hex> kern <hex> (literal) ...] TJ
  const tjPattern = /\[([^\]]*)\]\s*TJ/g;
  let m = tjPattern.exec(stream);
  while (m !== null) {
    const segPattern = /<([0-9A-Fa-f]*)>|\(([^)]*)\)/g;
    let seg = segPattern.exec(m[1]);
    while (seg !== null) {
      if (seg[1] !== undefined) {
        const hex = seg[1];
        for (let i = 0; i + 1 < hex.length; i += 2) {
          result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
        }
      } else if (seg[2] !== undefined) {
        result += seg[2];
      }
      seg = segPattern.exec(m[1]);
    }
    result += ' ';
    m = tjPattern.exec(stream);
  }

  // Simple Tj: (text) Tj
  const tjSimple = /\(([^)]*)\)\s*Tj/g;
  let s = tjSimple.exec(stream);
  while (s !== null) {
    result += s[1] + ' ';
    s = tjSimple.exec(stream);
  }

  return result;
}

function extractPdfText(pdfBuffer: Buffer): string {
  const texts: string[] = [];
  const crlfMarker = Buffer.from('stream\r\n');
  const lfMarker = Buffer.from('stream\n');
  const endMarker = Buffer.from('\nendstream');
  let pos = 0;

  while (pos < pdfBuffer.length) {
    const crlfIdx = pdfBuffer.indexOf(crlfMarker, pos);
    const lfIdx = pdfBuffer.indexOf(lfMarker, pos);

    if (crlfIdx === -1 && lfIdx === -1) break;

    let dataStart: number;
    if (crlfIdx === -1) dataStart = lfIdx + lfMarker.length;
    else if (lfIdx === -1) dataStart = crlfIdx + crlfMarker.length;
    else dataStart = crlfIdx < lfIdx
      ? crlfIdx + crlfMarker.length
      : lfIdx + lfMarker.length;

    const endIdx = pdfBuffer.indexOf(endMarker, dataStart);
    if (endIdx === -1) break;

    const streamData = pdfBuffer.subarray(dataStart, endIdx);

    try {
      texts.push(decodePdfOperators(inflateSync(streamData).toString('latin1')));
    } catch {
      try {
        texts.push(decodePdfOperators(inflateRawSync(streamData).toString('latin1')));
      } catch {
        // Not a content stream (e.g. font/image data) — skip
      }
    }

    pos = endIdx + endMarker.length;
  }

  return texts.join('\n');
}

// ── World ─────────────────────────────────────────────────────

interface PdfWorld extends AppWorld {
  examPayload: ExamPayload;
  questions: QuestionPayload[];
  zipEntries: ZipEntry[];
}

// ── Given ─────────────────────────────────────────────────────

Given(
  'an exam titled {string} by teacher {string} with {string} identification',
  function (this: PdfWorld, title: string, teacherName: string, mode: string) {
    this.questions = [];
    this.examPayload = makeExamPayload(title, teacherName, mode as ExamIdentificationMode, []);
  },
);

Given(
  'the exam has {int} questions with {int} alternatives each and one correct alternative per question',
  function (this: PdfWorld, qCount: number, altCount: number) {
    this.questions = Array.from({ length: qCount }, (_, i) =>
      makeQuestion(`Question ${i + 1}`, altCount),
    );
    this.examPayload = {
      ...this.examPayload,
      questionIds: this.questions.map((q) => q.id),
    };
  },
);

// ── When ──────────────────────────────────────────────────────

When(/I generate (\d+) exam cop(?:y|ies)/, async function (this: PdfWorld, copies: number) {
  const zipBuffer = await generateExamZip({
    exam: this.examPayload,
    questions: this.questions,
    copies: Number(copies),
  });
  this.zipEntries = readZipEntries(zipBuffer);
});

// ── Then – ZIP structure ──────────────────────────────────────

Then('the ZIP should contain {int} files', function (this: PdfWorld, count: number) {
  assert.equal(
    this.zipEntries.length,
    count,
    `Expected ${count} files, got ${this.zipEntries.length}: ${this.zipEntries.map((e) => e.name).join(', ')}`,
  );
});

Then('the ZIP should contain {string}', function (this: PdfWorld, fileName: string) {
  const found = this.zipEntries.some((e) => e.name === fileName);
  assert.ok(
    found,
    `"${fileName}" not found in ZIP. Files: ${this.zipEntries.map((e) => e.name).join(', ')}`,
  );
});

// ── Then – PDF content ────────────────────────────────────────

Then(
  'PDF {string} should contain the text {string}',
  function (this: PdfWorld, fileName: string, text: string) {
    const entry = this.zipEntries.find((e) => e.name === fileName);
    assert.ok(entry, `"${fileName}" not found in ZIP`);
    const content = extractPdfText(entry.data);
    assert.ok(content.includes(text), `PDF "${fileName}" does not contain "${text}"`);
  },
);

// ── Then – Answer key CSV ─────────────────────────────────────

function getCsvEntry(zipEntries: ZipEntry[]): string {
  const entry = zipEntries.find((e) => e.name === 'answer_key.csv');
  assert.ok(entry, 'answer_key.csv not found in ZIP');
  return entry.data.toString('utf-8');
}

function getCsvDataRows(csv: string): string[][] {
  const [, ...rows] = csv.trim().split('\n').filter((r) => r.trim() !== '');
  return rows.map((r) => r.split(','));
}

Then(
  'each answer in the answer key CSV should be a valid letter label',
  function (this: PdfWorld) {
    const csv = getCsvEntry(this.zipEntries);
    const dataRows = getCsvDataRows(csv);
    for (const [, ...answers] of dataRows) {
      for (const answer of answers) {
        assert.match(
          answer.trim(),
          /^[A-H]+$/,
          `"${answer.trim()}" is not a valid letter label`,
        );
      }
    }
  },
);

Then(
  'each answer in the answer key CSV should be a valid power-of-2 label',
  function (this: PdfWorld) {
    const VALID_POWERS = new Set(['1', '2', '4', '8', '16', '32', '64', '128']);
    const csv = getCsvEntry(this.zipEntries);
    const dataRows = getCsvDataRows(csv);
    for (const [, ...answers] of dataRows) {
      for (const answer of answers) {
        assert.ok(
          VALID_POWERS.has(answer.trim()),
          `"${answer.trim()}" is not a valid power-of-2 label`,
        );
      }
    }
  },
);

Then(
  'the answer key CSV header row should be {string}',
  function (this: PdfWorld, expectedHeader: string) {
    const csv = getCsvEntry(this.zipEntries);
    const header = csv.split('\n')[0].trim();
    assert.equal(header, expectedHeader);
  },
);

Then(
  'the answer key CSV should have {int} data rows',
  function (this: PdfWorld, count: number) {
    const csv = getCsvEntry(this.zipEntries);
    const dataRows = getCsvDataRows(csv);
    assert.equal(dataRows.length, count);
  },
);

Then('not all answer key rows should be identical', function (this: PdfWorld) {
  const csv = getCsvEntry(this.zipEntries);
  const dataRows = getCsvDataRows(csv);
  const answerFingerprints = new Set(dataRows.map(([, ...answers]) => answers.join(',')));
  assert.ok(
    answerFingerprints.size > 1,
    'All exam copies have identical answer key rows — shuffle may not be working',
  );
});
