# QuestForge AI — System Specification

Status: FINALIZED
Project: QuestForge AI
Tagline: Level Up Your Scholarship Application
Title: AI-Powered Scholarship Application Readiness and Document Verification Platform
Course: Skill Enhancement Course (SEC)

---

## 1. Executive Summary & Vision

QuestForge AI is a pre-submission document auditing and application-readiness assistant designed to help students verify their scholarship application documents before submitting them to official scholarship portals.

**Crucial Boundaries:**
QuestForge AI is an audit assistant. It does not approve scholarships, guarantee eligibility, or replace official portals. It assists students by checking for document completeness, cross-document inconsistencies (name, date of birth, marks/income discrepancies), and adherence to explicit configured guidelines.

---

## 2. Core Functional Requirements

### Feature A: Scholarship Requirement Explorer
- Search and explore supported scholarship programs (e.g., National Merit Scholarship, Post-Matric STEM Fellowship).
- View eligibility criteria, deadline dates, mandatory documents list, and official source links.
- Synthetic/demonstration datasets clearly labeled to maintain transparency.

### Feature B: Multi-format Document Ingestion & Extraction (OCR & PDF)
- Multi-document upload via drag-and-drop supporting PDF, PNG, and JPEG.
- Client-side and server-side file type and size verification (max 10MB per file).
- Text extraction using `pdf-parse` for digital PDFs and `tesseract.js` for scanned documents and images.
- Graceful handling of unreadable/corrupted files with clear error states.

### Feature C: Missing Document Detection
- Automatic mapping of uploaded files to required document categories (e.g., Government ID, Academic Transcript, Income Certificate, Caste/Category Certificate).
- Instant flagging of missing mandatory documents with explanation of requirement.

### Feature D: Cross-Document Consistency Checker
- Structured entity extraction:
  - Full Name (normalized comparison across Aadhaar/Passport, 10th/12th Marks Card, Income Certificate).
  - Date of Birth (DOB formats normalized: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD).
  - Educational Institution & Passing Year.
  - Income / Category criteria.
- Multi-algorithm fuzzy matching (Levenshtein distance, token sort ratio) to detect subtle typos vs. substantial discrepancies.
- Non-punitive classification: Flags items as "Requires Manual Verification" rather than accusing fraud.

### Feature E: Evidence-Based Audit Engine
- Produces itemized findings containing:
  - Issue Type (`CRITICAL_MISSING`, `INCONSISTENCY`, `INFO_MISMATCH`, `VERIFICATION_REQUIRED`)
  - Affected Document(s)
  - Detected Information
  - Expected Requirement
  - Plain-English Explanation
  - Relevant Guideline Reference
  - Actionable Corrective Recommendation
  - Validation Status (`PASSED`, `WARNING`, `FAILED`, `MANUAL_REVIEW`)

### Feature F: Readiness Dashboard & Exportable Report
- Visual readiness score calculated transparently based on document completeness and consistency.
- Tabulated document status, checklist of completed requirements, and alert cards.
- Printable/downloadable comprehensive readiness audit report.

---

## 3. UI/UX & Design Guidelines

- Professional SaaS styling: Dark navy (`#0B132B` / `#1C2541`), charcoal (`#2D3748`), clean whites (`#FFFFFF`), restrained teal/blue accents (`#0EA5E9` / `#0D9488`).
- Strict design rules:
  - No purple gradients.
  - No pill-shaped buttons (clean modern rounded corners, `rounded-lg`).
  - No emoji icons (Lucide-react icons exclusively).
  - No fake reviews or counters.
  - No placeholder dead links.
  - Fully accessible, high-contrast, keyboard-navigable.

---

## 4. Technical Architecture

### Frontend (SPA)
- React 18+ with Vite
- Tailwind CSS with customized professional color palette
- Lucide React icons
- React Router DOM v6
- 12 Complete Pages:
  1. Home / Landing Page
  2. About Page
  3. Scholarship Explorer
  4. Document Upload Page
  5. Document Analysis Page
  6. Readiness Dashboard
  7. Report Page
  8. Privacy Policy
  9. Terms & Conditions
  10. Cookie Policy
  11. Contact Page
  12. Custom 404 Page

### Backend (REST API)
- Node.js & Express.js
- Multer for secure multipart file handling
- PDF text extraction (`pdf-parse`) and image OCR (`tesseract.js`)
- Gemini API integration with local deterministic rule-based fallback
- Security: Helmet, CORS whitelist, Rate limiting, sanitized inputs, centralized error handling

---

## 5. Security & Privacy Safeguards
- Zero client-side API keys.
- Environment variables validated on startup with fail-fast check.
- Safe `.env.example` provided.
- In-memory/temp file handling with automatic cleanup; no public access to raw documents.
- Prepared for Supabase Row Level Security (RLS) when persistence is connected.
