// Small filter box that sits above a library list. Shown only once a library
// is big enough for scanning it by eye to be a chore.
const MIN_ENTRIES = 6;

export default function LibraryFilter({ value, onChange, count, placeholder = 'Ara...' }) {
  if ((count || 0) < MIN_ENTRIES) return null;
  return (
    <div className="library-filter">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Kütüphanede ara"
      />
      {value && (
        <button type="button" className="btn-ghost small" onClick={() => onChange('')} title="Temizle">
          ✕
        </button>
      )}
    </div>
  );
}
