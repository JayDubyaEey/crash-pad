export function ReportHeader({ meta, onChange, location }) {
  function set(field) {
    return (e) => onChange({ ...meta, [field]: e.target.value })
  }

  return (
    <div className="report-header">
      <div className="report-title-row">
        <h1>Accident Report Diagram</h1>
        <input className="date-input" type="date" value={meta.date} onChange={set('date')} />
      </div>

      <div className="address-line">{location?.address || 'No location set'}</div>
      {location && (
        <div className="coords-line">
          Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </div>
      )}

      <div className="party-row">
        <label className="party-field">
          <span>Your vehicle</span>
          <input type="text" placeholder="Reg / make / model" value={meta.yourVehicle} onChange={set('yourVehicle')} />
        </label>
        <label className="party-field">
          <span>Other vehicle</span>
          <input type="text" placeholder="Reg / make / model" value={meta.otherVehicle} onChange={set('otherVehicle')} />
        </label>
      </div>

      <label className="notes-field">
        <span>Notes</span>
        <textarea
          rows={3}
          placeholder="Describe what happened..."
          value={meta.notes}
          onChange={set('notes')}
        />
      </label>
    </div>
  )
}
