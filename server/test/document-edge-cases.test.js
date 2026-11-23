import test from 'node:test'
import assert from 'node:assert/strict'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { extractTextFromDocument } from '../src/services/ocrService.js'

test('Document Processing: Corrupt PDF is handled gracefully without unhandled exception', async () => {
  const corruptBuffer = Buffer.from('%PDF-corrupt-data-without-trailer-or-xref-objects')
  const result = await extractTextFromDocument(corruptBuffer, 'application/pdf', 'corrupt.pdf')

  assert.equal(result.success, false)
  assert.equal(result.extractedText, '')
  assert.equal(result.confidence, 0)
  assert.ok(result.error)
})

test('Document Processing: Empty 0-byte buffer returns clean error', async () => {
  const emptyBuffer = Buffer.alloc(0)
  const result = await extractTextFromDocument(emptyBuffer, 'application/pdf', 'empty.pdf')

  assert.equal(result.success, false)
  assert.equal(result.confidence, 0)
  assert.ok(result.error)
})

test('Document Processing: Unsupported format returns explicit failure', async () => {
  const textBuffer = Buffer.from('Plain text file')
  const result = await extractTextFromDocument(textBuffer, 'text/plain', 'notes.txt')

  assert.equal(result.success, false)
  assert.ok(result.error.includes('Unsupported document format'))
})

test('Document Processing: Valid Digital PDF with content extracts text successfully', async () => {
  // Generate a valid digital PDF using pdf-lib
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 400])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  page.drawText('Candidate Name: Rahul Sharma\nDate of Birth: 15/08/2004\nTotal Marks: 88.5%', {
    x: 50,
    y: 350,
    size: 14,
    font,
    color: rgb(0, 0, 0),
    lineHeight: 20
  })

  const pdfBytes = await pdfDoc.save()
  const pdfBuffer = Buffer.from(pdfBytes)

  const result = await extractTextFromDocument(pdfBuffer, 'application/pdf', 'marksheet.pdf')

  assert.equal(result.success, true)
  assert.ok(result.extractedText.includes('Rahul Sharma'))
  assert.equal(result.confidence, 0.95)
  assert.equal(result.extractedFields.fullName, 'Rahul Sharma')
  assert.equal(result.extractedFields.dob, '15/08/2004')
})
