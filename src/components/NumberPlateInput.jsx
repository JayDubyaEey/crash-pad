// Styled after a UK number plate (yellow, black border). Uppercases and
// strips anything but letters/digits/spaces as you type — plates don't take
// punctuation.
export function NumberPlateInput({ value, onChange, onBlur, status, placeholder = 'AB12 CDE' }) {
  function handleChange(e) {
    onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 8))
  }

  const ring =
    status === 'loading' ? 'ring-2 ring-blue-500' : status === 'error' ? 'ring-2 ring-destructive' : ''

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={8}
      className={`number-plate w-full rounded-md border-2 border-black bg-[#ffd700] px-2 py-1 text-center text-2xl font-black tracking-[0.14em] text-black outline-none placeholder:text-black/30 ${ring}`}
      style={{ fontFamily: '"Arial Narrow", Arial, sans-serif' }}
    />
  )
}
