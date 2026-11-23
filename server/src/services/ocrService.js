import pdf from 'pdf-parse'
import Tesseract from 'tesseract.js'
import fs from 'fs'
import zlib from 'zlib'

/**
 * Normalizes text extracted from documents.
 */
export function normalizeExtractedText(rawText) {
  if (!rawText) return ''
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

/**
 * Fallback stream parser to recover text from raw or compressed PDF streams
 * when standard PDFJS parser encounters unknown flate methods or non-standard xrefs.
 */
export function extractTextFromPdfStreams(buffer) {
  let text = ''
  let searchPos = 0

  while (true) {
    const sIdx = buffer.indexOf('stream', searchPos)
    if (sIdx === -1) break

    let cStart = sIdx + 6
    if (buffer[cStart] === 0x0D) cStart++
    if (buffer[cStart] === 0x0A) cStart++

    const endIdx = buffer.indexOf('endstream', cStart)
    if (endIdx === -1) break

    let cEnd = endIdx
    if (cEnd > cStart && buffer[cEnd - 1] === 0x0A) cEnd--
    if (cEnd > cStart && buffer[cEnd - 1] === 0x0D) cEnd--

    const chunk = buffer.subarray(cStart, cEnd)
    let dec = ''
    try {
      dec = zlib.inflateSync(chunk).toString('latin1')
    } catch (e1) {
      try {
        dec = zlib.inflateRawSync(chunk).toString('latin1')
      } catch (e2) {
        dec = chunk.toString('latin1')
      }
    }

    // Extract hex-encoded strings <...> Tj
    const hexMatches = dec.match(/<([0-9A-Fa-f]+)>\s*Tj/g) || []
    for (const hm of hexMatches) {
      const hex = hm.replace(/<|>\s*Tj/g, '')
      try {
        text += Buffer.from(hex, 'hex').toString('utf8') + ' '
      } catch (err) {}
    }

    // Extract literal strings (...) Tj
    const litMatches = dec.match(/\(([^()]+)\)\s*Tj/g) || []
    for (const lm of litMatches) {
      text += lm.replace(/^\(|\)\s*Tj$/g, '') + ' '
    }

    searchPos = endIdx + 9
  }

  return normalizeExtractedText(text)
}

/**
 * Deterministic Regex and Pattern-based entity extractor.
 * Serves as reliable baseline and fallback when AI is unavailable or offline.
 */
export function extractStructuredFieldsFromText(text, categoryHint = '') {
  if (!text) {
    return {
      fullName: null,
      dob: null,
      annualIncome: null,
      percentageMarks: null,
      institutionName: null,
      idNumber: null,
      extractionMethod: 'DETERMINISTIC_RULES'
    }
  }

  const clean = text

  // 1. Full Name detection patterns (using horizontal whitespace [ \t] to prevent newline multi-line matches)
  let fullName = null
  const namePatterns = [
    /(?:Name of (?:the )?(?:Candidate|Student|Holder|Applicant|Person)|Full Name|Student Name|Applicant Name|Name)[\t :]+([A-Za-z]+(?:[ \t]+[A-Za-z]+){1,3})/i,
    /(?:This is to certify that|Certify that|Shri|Kumari|Smt\.|Mr\.|Ms\.)[\t :]+([A-Za-z]+(?:[ \t]+[A-Za-z]+){1,3})/i,
    /([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)[ \t]+(?:S\/O|D\/O|Son of|Daughter of)/i
  ]
  for (const pat of namePatterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      let candidate = match[1].trim()
      // Strip any accidental capture of subsequent field headers if text lines were merged
      candidate = candidate.replace(/\s+(?:Date|DOB|Birth|Total|Marks|Income|Roll|Father|Mother|Annual|Percentage).*$/i, '').trim()
      // Filter out false positive headers
      if (candidate.length > 2 && !/(Department|Ministry|Government|University|College|Board|School|Certificate|Authority)/i.test(candidate)) {
        fullName = candidate
        break
      }
    }
  }

  // 2. Date of Birth patterns
  let dob = null
  const dobPatterns = [
    /(?:Date of Birth|DOB|Birth Date)[\s:]+([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i,
    /(?:DOB)[\s:]+([0-9]{4}[\/\-.][0-9]{1,2}[\/\-.][0-9]{1,2})/i,
    /(?:Born on)[\s:]+([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i
  ]
  for (const pat of dobPatterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      dob = match[1].trim()
      break
    }
  }

  // 3. Annual Income patterns
  let annualIncome = null
  const incomePatterns = [
    /(?:Annual(?: Household| Family)? Income|Total Income)[\s:]*(?:Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:Rs\.?|INR)[\s:]*([0-9,]{4,10})/i
  ]
  for (const pat of incomePatterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      const val = parseInt(match[1].replace(/,/g, ''), 10)
      if (!isNaN(val) && val > 1000) {
        annualIncome = val
        break
      }
    }
  }

  // 4. Academic Marks / Percentage patterns
  let percentageMarks = null
  const marksPatterns = [
    /(?:Percentage|Aggregate Marks|Marks Obtained|Score|Aggregate|Total Marks)[\s:]*([0-9]{2}(?:\.[0-9]{1,2})?)\s*%/i,
    /([0-9]{2}\.[0-9]{1,2})\s*%/i,
    /(?:CGPA|CPI)[\s:]*([0-9]\.[0-9]{1,2})/i
  ]
  for (const pat of marksPatterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      const val = parseFloat(match[1])
      if (!isNaN(val)) {
        percentageMarks = val
        break
      }
    }
  }

  // 5. Institution Name patterns
  let institutionName = null
  const instPatterns = [
    /(?:Institution|College|University|School|Institute)[\s:]+([A-Za-z0-9.,\- ]+(?:College|Institute|University|School|Academy|IIT|NIT|IIIT))/i,
    /([A-Za-z0-9.,\- ]+(?:College of Engineering|Institute of Technology|National Institute of Technology|State University))/i
  ]
  for (const pat of instPatterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      institutionName = match[1].trim()
      break
    }
  }

  // 6. Identity / Roll Number patterns
  let idNumber = null
  const idPatterns = [
    /(?:Aadhaar No\.?|UID|Voter ID|ID Number|Roll No\.?|Registration No\.?)[\s:]+([A-Za-z0-9\-\/ ]{4,20})/i,
    /([0-9]{4}\s[0-9]{4}\s[0-9]{4})/
  ]
  for (const pat of idPatterns) {
    const match = clean.match(pat)
    if (match && match[1]) {
      idNumber = match[1].trim()
      break
    }
  }

  return {
    fullName,
    dob,
    annualIncome,
    percentageMarks,
    institutionName,
    idNumber,
    extractionMethod: 'DETERMINISTIC_RULES'
  }
}

/**
 * Extracts text and structured fields from PDF or image buffer.
 */
export async function extractTextFromDocument(fileBuffer, mimetype, originalName = '') {
  let extractedText = ''
  let confidence = 0
  let method = ''
  let errorDetail = null

  try {
    if (mimetype === 'application/pdf') {
      method = 'PDF_TEXT_EXTRACTION'
      try {
        const pdfData = await pdf(fileBuffer)
        extractedText = normalizeExtractedText(pdfData.text || '')
      } catch (pdfErr) {
        // Fallback: recover digital text from raw or compressed stream operators
        const fallbackText = extractTextFromPdfStreams(fileBuffer)
        if (fallbackText && fallbackText.length > 5) {
          extractedText = fallbackText
        } else {
          throw pdfErr
        }
      }

      if (extractedText.length > 10) {
        confidence = 0.95
      } else {
        confidence = 0.20
        errorDetail = 'Digital text extraction returned sparse content. Document may be a scanned or flattened PDF.'
      }
    } else if (mimetype.startsWith('image/')) {
      method = 'TESSERACT_OCR'
      const worker = await Tesseract.createWorker('eng')
      try {
        const result = await worker.recognize(fileBuffer)
        extractedText = normalizeExtractedText(result.data.text || '')
        confidence = Math.round((result.data.confidence || 60) * 10) / 1000 // Convert 0-100 to 0.0-1.0
        if (confidence > 1.0) confidence = 0.85
      } finally {
        await worker.terminate()
      }
    } else {
      throw new Error(`Unsupported document format: ${mimetype}`)
    }

    const structuredFields = extractStructuredFieldsFromText(extractedText)

    return {
      success: extractedText.trim().length > 0,
      extractedText,
      extractedFields: structuredFields,
      confidence,
      method,
      characterCount: extractedText.length,
      warning: errorDetail
    }
  } catch (err) {
    return {
      success: false,
      extractedText: '',
      extractedFields: extractStructuredFieldsFromText(''),
      confidence: 0,
      method: method || 'FAILED',
      characterCount: 0,
      error: err.message
    }
  }
}

