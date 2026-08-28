// Styled after a UK rear number plate (yellow, blue GB flash). Uppercases
// and strips anything but letters/digits/spaces as you type — plates don't
// take punctuation.
export function NumberPlateInput({ value, onChange, onBlur, status, placeholder = 'AB12 CDE' }) {
  function handleChange(e) {
    onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 8))
  }

  const ring =
    status === 'loading' ? 'ring-2 ring-blue-500' : status === 'error' ? 'ring-2 ring-destructive' : ''

  return (
    <div
      className={`number-plate inline-flex items-stretch overflow-hidden rounded-md border-2 border-black bg-[#ffd700] ${ring}`}
    >
      <div className="flex flex-col items-center justify-center gap-0.5 bg-[#003399] px-1.5 py-1 text-white">
        <span className="text-[9px] leading-none">★</span>
        <span className="text-[10px] font-bold leading-none">UK</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={8}
        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-center text-xl font-bold tracking-[0.12em] text-black outline-none placeholder:text-black/30"
        style={{ fontFamily: '"Arial Narrow", Arial, sans-serif' }}
      />
    </div>
  )
}
