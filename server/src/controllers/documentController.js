import { extractTextFromDocument } from '../services/ocrService.js'
import { extractWithAIOrFallback } from '../services/aiExtractorService.js'
import { storage } from '../services/storageService.js'
import { sanitizeFilename, validateFileSignature } from '../utils/securityHelpers.js'

export async function uploadAndProcessDocuments(req, res, next) {
  try {
    const files = req.files
    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'No documents provided in the upload request.'
      })
    }

    // Optional user-specified categories payload (JSON string or object)
    let categoryMap = {}
    if (req.body.categoryMap) {
      try {
        categoryMap = typeof req.body.categoryMap === 'string'
          ? JSON.parse(req.body.categoryMap)
          : req.body.categoryMap
      } catch (e) {
        // Fallback if categoryMap parsing fails
      }
    }

    const processedDocuments = []

    for (const file of files) {
      const safeOriginalName = sanitizeFilename(file.originalname)

      // Security check: Binary file signature / magic bytes validation
      const hasValidSignature = validateFileSignature(file.buffer, file.mimetype)
      if (!hasValidSignature) {
        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: `File "${safeOriginalName}" failed binary signature verification. Content does not match declared ${file.mimetype} structure.`
        })
      }

      // 1. Text extraction via PDF parser or Tesseract OCR
      const extractionResult = await extractTextFromDocument(file.buffer, file.mimetype, safeOriginalName)

      const assignedCategory = categoryMap[file.originalname] || categoryMap[safeOriginalName] || {
        categoryId: 'doc-unassigned',
        categoryName: 'Unassigned Document'
      }

      // 2. Structured entity extraction via Multi-Provider AI (or deterministic fallback)
      const aiResult = await extractWithAIOrFallback(extractionResult.extractedText, assignedCategory.categoryName)

      // 3. Merge extracted fields prioritizing high-confidence values
      const mergedFields = {
        fullName: aiResult.fields?.fullName || extractionResult.extractedFields?.fullName || null,
        dob: aiResult.fields?.dob || extractionResult.extractedFields?.dob || null,
        annualIncome: aiResult.fields?.annualIncome || extractionResult.extractedFields?.annualIncome || null,
        percentageMarks: aiResult.fields?.percentageMarks || extractionResult.extractedFields?.percentageMarks || null,
        institutionName: aiResult.fields?.institutionName || extractionResult.extractedFields?.institutionName || null,
        idNumber: aiResult.fields?.idNumber || extractionResult.extractedFields?.idNumber || null,
        summary: aiResult.fields?.summary || null,
        extractionMethod: aiResult.source || extractionResult.method
      }

      // 4. Save to session repository with user association
      const docRecord = storage.saveDocument({
        userId: req.user?.id || null,
        originalName: safeOriginalName,
        mimetype: file.mimetype,
        size: file.size,
        categoryId: assignedCategory.categoryId,
        categoryName: assignedCategory.categoryName,
        extractedText: extractionResult.extractedText,
        extractedFields: mergedFields,
        extractionConfidence: extractionResult.confidence,
        extractionWarning: extractionResult.warning || null,
        extractionMethod: extractionResult.method,
        aiExtractionMode: aiResult.mode,
        providerInfo: aiResult.providerInfo || null
      })

      processedDocuments.push(docRecord)
    }

    res.status(200).json({
      status: 'success',
      count: processedDocuments.length,
      data: processedDocuments
    })
  } catch (err) {
    next(err)
  }
}

export function updateDocumentCategory(req, res) {
  const { id } = req.params
  const { categoryId, categoryName } = req.body
  const userId = req.user?.id || null

  if (!categoryId || !categoryName) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Both categoryId and categoryName are required.'
    })
  }

  const updated = storage.updateDocument(id, { categoryId, categoryName }, userId)
  if (!updated) {
    return res.status(404).json({
      status: 'error',
      statusCode: 404,
      message: `Document with ID '${id}' not found.`
    })
  }

  res.status(200).json({
    status: 'success',
    data: updated
  })
}

export function getDocumentById(req, res) {
  const { id } = req.params
  const userId = req.user?.id || null
  const doc = storage.getDocument(id, userId)

  if (!doc) {
    return res.status(404).json({
      status: 'error',
      statusCode: 404,
      message: `Document with ID '${id}' not found.`
    })
  }

  res.status(200).json({
    status: 'success',
    data: doc
  })
}
