import { inflateSync, inflateRawSync } from 'node:zlib';
import assert from 'node:assert/strict';

// ── ZIP reader ────────────────────────────────────────────────
//
// Archiver sets the data-descriptor flag (bit 3), so compressed sizes in local
// file headers are 0. Sizes are always accurate in the Central Directory, so
// we read from there, then jump to the local header to find the data offset.
//
// Central directory record (46 bytes + variable):
//   [10-11] Compression method
//   [20-23] Compressed size
//   [28-29] File name length  [30-31] Extra field length
//   [32-33] File comment length
//   [42-45] Offset of local file header
//   [46+]   File name
//
// Local file header (30 bytes + variable):
//   [26-27] File name length
//   [28-29] Extra field length
//   [30+]   File name, extra field, then file data

export interface ZipEntry {
  name: string;
  data: Buffer;
}

export function readZipEntries(zipBuffer: Buffer): ZipEntry[] {
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

// ── PDF text extractor ────────────────────────────────────────
//
// PDFKit compresses content streams with /Filter /FlateDecode (zlib).
// Text is stored as hex strings in TJ arrays: [<hex> kern ...] TJ
// or as literal strings: (text) Tj.

function decodePdfOperators(stream: string): string {
  let result = '';

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

  const tjSimple = /\(([^)]*)\)\s*Tj/g;
  let s = tjSimple.exec(stream);
  while (s !== null) {
    result += s[1] + ' ';
    s = tjSimple.exec(stream);
  }

  return result;
}

export function extractPdfText(pdfBuffer: Buffer): string {
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
        // Not a content stream (font/image data) — skip
      }
    }

    pos = endIdx + endMarker.length;
  }

  return texts.join('\n');
}

// ── CSV helpers ───────────────────────────────────────────────

export function getCsvEntry(zipEntries: ZipEntry[]): string {
  const entry = zipEntries.find((e) => e.name === 'answer_key.csv');
  assert.ok(entry, 'answer_key.csv not found in ZIP');
  return entry.data.toString('utf-8');
}

export function getCsvDataRows(csv: string): string[][] {
  const [, ...rows] = csv.trim().split('\n').filter((r) => r.trim() !== '');
  return rows.map((r) => r.split(','));
}
