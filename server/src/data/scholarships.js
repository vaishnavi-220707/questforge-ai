/**
 * QuestForge AI - Scholarship Requirements Dataset
 * Note: Demonstration / Synthetic dataset for academic Skill Enhancement Course (SEC) project.
 * All requirements are configured explicitly for deterministic verification.
 */

export const SCHOLARSHIPS = [
  {
    id: 'merit-tech-2026',
    code: 'NMTS-2026',
    title: 'National Merit Technical Scholarship (Demonstration)',
    provider: 'Department of Technical Education (Demo Authority)',
    category: 'Merit-Cum-Means',
    educationLevel: 'Undergraduate (Engineering / Technology / Applied Sciences)',
    deadline: '2026-12-15',
    isDemonstration: true,
    dataSource: 'Synthetic Demonstration Dataset for Academic Evaluation',
    description: 'Financial assistance program for undergraduate engineering and science students demonstrating academic merit and economic need.',
    awardAmount: '50,000 INR per academic year',
    officialPortalUrl: 'https://scholarships.gov.in (Official Reference Example)',
    eligibilityCriteria: [
      {
        criterionId: 'crit-marks',
        title: 'Minimum Academic Performance',
        rule: 'Minimum 75% aggregate marks in 12th standard or equivalent qualifying examination.',
        mandatoryDocument: 'doc-marksheet'
      },
      {
        criterionId: 'crit-income',
        title: 'Household Income Ceiling',
        rule: 'Annual family income from all sources must not exceed 2,50,000 INR.',
        mandatoryDocument: 'doc-income'
      },
      {
        criterionId: 'crit-enrolled',
        title: 'Full-Time Enrollment',
        rule: 'Must be enrolled in a recognized AICTE/UGC approved technical institution.',
        mandatoryDocument: 'doc-institution'
      },
      {
        criterionId: 'crit-identity',
        title: 'Citizen Identity Verification',
        rule: 'Valid government-issued national identity card (Aadhaar / Voter ID / Passport).',
        mandatoryDocument: 'doc-id'
      }
    ],
    mandatoryDocuments: [
      {
        categoryId: 'doc-id',
        name: 'Identity Proof',
        description: 'Government-issued photo identification (Aadhaar Card, Passport, or Voter ID).',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'NMTS Guidelines 2026, Section 4.1 (Identity Document Standards)',
        expectedFields: ['fullName', 'dob', 'idNumber']
      },
      {
        categoryId: 'doc-income',
        name: 'Income Certificate',
        description: 'Competent revenue authority issued income certificate valid for the current financial year.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'NMTS Guidelines 2026, Section 4.2 (Income Ceiling Certification)',
        expectedFields: ['fullName', 'annualIncome', 'validityYear']
      },
      {
        categoryId: 'doc-marksheet',
        name: 'Academic Marksheet',
        description: 'Official marksheet or grade transcript of the qualifying qualifying examination (10+2 / Diploma).',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'NMTS Guidelines 2026, Section 4.3 (Academic Record Validation)',
        expectedFields: ['fullName', 'percentageMarks', 'boardOrUniversity', 'passingYear']
      },
      {
        categoryId: 'doc-institution',
        name: 'Institution Certificate',
        description: 'Bonafide student certificate or admission letter signed by Head of Institution / Registrar.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'NMTS Guidelines 2026, Section 4.4 (Institutional Bonafide Requirement)',
        expectedFields: ['fullName', 'institutionName', 'rollNumber', 'courseName']
      }
    ],
    optionalDocuments: [
      {
        categoryId: 'doc-caste',
        name: 'Category / Caste Certificate',
        description: 'Required only if applying under reserved category benefits.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'NMTS Guidelines 2026, Section 4.5 (Reservation Norms)'
      },
      {
        categoryId: 'doc-bank',
        name: 'Bank Passbook Copy',
        description: 'First page of student bank passbook or cancelled cheque showing IFSC code.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'NMTS Guidelines 2026, Section 4.6 (Disbursement Account)'
      }
    ]
  },
  {
    id: 'stem-excellence-2026',
    code: 'STEM-FELL-2026',
    title: 'Post-Matric STEM Excellence Fellowship (Demonstration)',
    provider: 'National STEM Innovation Council (Demo Authority)',
    category: 'Merit-Based',
    educationLevel: 'Postgraduate / Integrated Masters (STEM Fields)',
    deadline: '2027-01-20',
    isDemonstration: true,
    dataSource: 'Synthetic Demonstration Dataset for Academic Evaluation',
    description: 'Fellowship for outstanding research and master students enrolled in core STEM and data computing domains.',
    awardAmount: '75,000 INR per academic year',
    officialPortalUrl: 'https://dst.gov.in (Reference Example)',
    eligibilityCriteria: [
      {
        criterionId: 'crit-grad-marks',
        title: 'Degree Percentage',
        rule: 'Minimum 80% aggregate or CGPA 8.0/10 in undergraduate degree.',
        mandatoryDocument: 'doc-marksheet'
      },
      {
        criterionId: 'crit-univ',
        title: 'Research Institution Affiliation',
        rule: 'Active enrollment in an accredited postgraduate STEM curriculum.',
        mandatoryDocument: 'doc-institution'
      },
      {
        criterionId: 'crit-id-stem',
        title: 'Identity Verification',
        rule: 'Valid government photo identity document.',
        mandatoryDocument: 'doc-id'
      }
    ],
    mandatoryDocuments: [
      {
        categoryId: 'doc-id',
        name: 'Identity Proof',
        description: 'Official government photo identification.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'STEM Fellowship Manual 2026, Clause 2.1',
        expectedFields: ['fullName', 'dob', 'idNumber']
      },
      {
        categoryId: 'doc-marksheet',
        name: 'Academic Marksheet',
        description: 'Consolidated graduation transcript or marks statement.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'STEM Fellowship Manual 2026, Clause 2.2',
        expectedFields: ['fullName', 'percentageMarks', 'passingYear']
      },
      {
        categoryId: 'doc-institution',
        name: 'Institution Certificate',
        description: 'Dean or Department Head signed letter of admission.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'STEM Fellowship Manual 2026, Clause 2.3',
        expectedFields: ['fullName', 'institutionName', 'rollNumber']
      }
    ],
    optionalDocuments: [
      {
        categoryId: 'doc-research-synopsis',
        name: 'Research Synopsis',
        description: 'Two-page brief outlining planned study or project.',
        acceptedFormats: ['PDF'],
        guidelineReference: 'STEM Fellowship Manual 2026, Clause 2.4'
      }
    ]
  },
  {
    id: 'state-higher-ed-2026',
    code: 'SHED-ASSIST-2026',
    title: 'State Higher Education Financial Grant (Demonstration)',
    provider: 'State Department of Higher Education (Demo Authority)',
    category: 'Need-Based',
    educationLevel: 'Undergraduate / General Degree (BA / BSc / BCom)',
    deadline: '2026-11-30',
    isDemonstration: true,
    dataSource: 'Synthetic Demonstration Dataset for Academic Evaluation',
    description: 'Grant program designed to cover tuition and study materials for students in general degree streams.',
    awardAmount: '25,000 INR per academic year',
    officialPortalUrl: 'https://stateportal.gov.in (Reference Example)',
    eligibilityCriteria: [
      {
        criterionId: 'crit-shed-income',
        title: 'Family Income Limitation',
        rule: 'Family annual income less than 1,80,000 INR.',
        mandatoryDocument: 'doc-income'
      },
      {
        criterionId: 'crit-shed-marks',
        title: 'Qualifying Pass Marksheet',
        rule: 'Passed intermediate examination with at least 60% marks.',
        mandatoryDocument: 'doc-marksheet'
      },
      {
        criterionId: 'crit-shed-id',
        title: 'State Domicile / Identity',
        rule: 'Proof of identity and address.',
        mandatoryDocument: 'doc-id'
      }
    ],
    mandatoryDocuments: [
      {
        categoryId: 'doc-id',
        name: 'Identity Proof',
        description: 'Voter card or Aadhaar card with state address.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'State Grant Rules 2026, Rule 3(A)',
        expectedFields: ['fullName', 'dob']
      },
      {
        categoryId: 'doc-income',
        name: 'Income Certificate',
        description: 'Revenue officer certificate issued within 6 months.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'State Grant Rules 2026, Rule 3(B)',
        expectedFields: ['fullName', 'annualIncome']
      },
      {
        categoryId: 'doc-marksheet',
        name: 'Academic Marksheet',
        description: '10+2 marks card from recognized state or central board.',
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        guidelineReference: 'State Grant Rules 2026, Rule 3(C)',
        expectedFields: ['fullName', 'percentageMarks']
      }
    ],
    optionalDocuments: []
  }
]
