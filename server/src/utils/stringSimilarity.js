/**
 * String comparison and fuzzy matching utilities for deterministic document auditing.
 */

export function normalizeName(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[.,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculates Levenshtein Distance between two strings.
 */
export function levenshteinDistance(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],    // deletion
          dp[i][j - 1],    // insertion
          dp[i - 1][j - 1] // substitution
        )
      }
    }
  }
  return dp[m][n]
}

/**
 * Calculates similarity ratio between 0.0 and 1.0
 */
export function stringSimilarity(str1, str2) {
  const s1 = normalizeName(str1)
  const s2 = normalizeName(str2)
  if (!s1 || !s2) return 0
  if (s1 === s2) return 1.0

  const distance = levenshteinDistance(s1, s2)
  const maxLen = Math.max(s1.length, s2.length)
  return 1 - (distance / maxLen)
}

/**
 * Compares two names taking initials and partial matches into account.
 * Examples:
 * - "Rahul Sharma" vs "Rahul Sharma" -> EXACT_MATCH
 * - "Rahul Sharma" vs "Rahul S" -> PARTIAL_INITIAL_MISMATCH
 * - "Rahul Sharma" vs "Amit Kumar" -> SUBSTANTIAL_MISMATCH
 */
export function compareNames(nameA, nameB) {
  const nA = normalizeName(nameA)
  const nB = normalizeName(nameB)

  if (!nA || !nB) return { matchType: 'UNVERIFIED', similarity: 0, reason: 'One or both names missing' }
  if (nA === nB) return { matchType: 'EXACT_MATCH', similarity: 1.0, reason: 'Exact name match' }

  const tokensA = nA.split(' ')
  const tokensB = nB.split(' ')

  // Check initial abbreviation (e.g. "Rahul S." vs "Rahul Sharma")
  const firstNameMatch = tokensA[0] === tokensB[0]
  if (firstNameMatch) {
    const isAAbbrev = tokensA.length > 1 && tokensA[tokensA.length - 1].length === 1
    const isBAbbrev = tokensB.length > 1 && tokensB[tokensB.length - 1].length === 1

    if (isAAbbrev || isBAbbrev) {
      return {
        matchType: 'INITIAL_ABBREVIATION',
        similarity: 0.85,
        reason: 'First name matches, but surname appears abbreviated or expanded.'
      }
    }
  }

  const sim = stringSimilarity(nA, nB)
  if (sim >= 0.80) {
    return {
      matchType: 'SLIGHT_TYPO_OR_TRANSLITERATION',
      similarity: sim,
      reason: 'Names are very similar with minor spelling or transliteration variation.'
    }
  }

  return {
    matchType: 'SUBSTANTIAL_DIFFERENCE',
    similarity: sim,
    reason: 'Significant difference observed between names across documents.'
  }
}

/**
 * Standardizes common Indian/International date formats into YYYY-MM-DD for comparison.
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return null
  const cleaned = dateStr.replace(/[\/\-.]/g, '/').trim()
  const parts = cleaned.split('/')

  if (parts.length === 3) {
    // DD/MM/YYYY or YYYY/MM/DD
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
    } else if (parts[2].length === 4) {
      // DD/MM/YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
  }
  return dateStr
}
