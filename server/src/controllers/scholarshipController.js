import { SCHOLARSHIPS } from '../data/scholarships.js'

export function getAllScholarships(req, res) {
  const { search, category, educationLevel } = req.query

  let filtered = [...SCHOLARSHIPS]

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(sch =>
      sch.title.toLowerCase().includes(s) ||
      sch.provider.toLowerCase().includes(s) ||
      sch.description.toLowerCase().includes(s)
    )
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(sch => sch.category.toLowerCase() === category.toLowerCase())
  }

  if (educationLevel && educationLevel !== 'All') {
    filtered = filtered.filter(sch => sch.educationLevel.toLowerCase().includes(educationLevel.toLowerCase()))
  }

  res.status(200).json({
    status: 'success',
    count: filtered.length,
    data: filtered
  })
}

export function getScholarshipById(req, res) {
  const { id } = req.params
  const scholarship = SCHOLARSHIPS.find(s => s.id === id || s.code.toLowerCase() === id.toLowerCase())

  if (!scholarship) {
    return res.status(404).json({
      status: 'error',
      statusCode: 404,
      message: `Scholarship with identifier '${id}' not found.`
    })
  }

  res.status(200).json({
    status: 'success',
    data: scholarship
  })
}
