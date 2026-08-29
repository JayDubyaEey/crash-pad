import { formatPlate } from '@/lib/plate'

// Styled after a UK number plate (yellow, black border). Uppercases and
// strips anything but letters/digits/spaces as you type — plates don't take
// punctuation. Reformatted into the conventional spaced layout on blur
// (reformatting live would fight the cursor mid-keystroke).
export function NumberPlateInput({ value, onChange, onBlur, status, placeholder = 'AB12 CDE' }) {
  function handleChange(e) {
    onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 8))
  }

  function handleBlur(e) {
    onChange(formatPlate(e.target.value))
    onBlur?.(e)
  }

  const GLOW = {
    loading: 'plate-glow plate-glow-pulse',
    notfound: 'plate-glow plate-glow-amber',
    invalid: 'plate-glow plate-glow-red',
    valid: 'plate-glow plate-glow-green',
  }
  const glow = GLOW[status] ?? ''

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={8}
      className={`number-plate w-full rounded-md border-2 border-black bg-[#ffd700] px-2 py-3 text-center text-3xl font-black tracking-[0.14em] text-black outline-none placeholder:text-black/30 ${glow}`}
      style={{ fontFamily: '"Arial Narrow", Arial, sans-serif' }}
      autoComplete="off"
      data-lpignore="true"
      data-1p-ignore
      data-bwignore
      data-form-type="other"
    />
  )
}
