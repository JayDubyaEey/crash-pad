// Formats a UK reg into its conventional spaced form (current, prefix,
// suffix, or dateless format). Falls back to the cleaned-but-unspaced input
// for anything that doesn't match a known pattern — private/cherished plates
// and typos shouldn't get overwritten with an error string.
const PATTERNS = [
  /^([A-Z]{2}[0-9]{2})([A-Z]{3})$/, // Current: AB12 CDE
  /^([A-Z][0-9]{1,3})([A-Z]{3})$/, // Prefix: A123 BCD
  /^([A-Z]{3})([0-9]{1,3}[A-Z])$/, // Suffix: ABC 123D
  /^([A-Z]{1,3})([0-9]{1,4})$/, // Dateless, letters first: ABC 1234
  /^([0-9]{1,4})([A-Z]{1,3})$/, // Dateless, numbers first: 1234 ABC
]

export function formatPlate(plate) {
  const cleanPlate = plate.toUpperCase().replace(/\s+/g, '')

  for (const pattern of PATTERNS) {
    if (pattern.test(cleanPlate)) {
      return cleanPlate.replace(pattern, '$1 $2')
    }
  }

  return cleanPlate
}
