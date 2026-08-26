import { useMemo, useState } from 'react'
import { LocationPicker } from './components/LocationPicker'
import { ReportHeader } from './components/ReportHeader'
import { StoryboardPanel } from './components/StoryboardPanel'
import { buildStaticMapUrl } from './lib/staticMap'
import './App.css'

const FRAME_TITLES = ['Before', 'Impact', 'After']

export default function App() {
  const [location, setLocation] = useState(null)
  const [meta, setMeta] = useState({
    date: new Date().toISOString().slice(0, 10),
    yourVehicle: '',
    otherVehicle: '',
    notes: '',
  })
  const [frames, setFrames] = useState([[], [], []])

  const mapUrl = useMemo(
    () => (location ? buildStaticMapUrl({ lat: location.lat, lng: location.lng }) : null),
    [location],
  )

  function updateFrame(index, items) {
    setFrames((prev) => prev.map((f, i) => (i === index ? items : f)))
  }

  return (
    <div className="app">
      <div className="no-print toolbar">
        <button type="button" onClick={() => window.print()}>
          Export PDF
        </button>
        <span className="hint">
          Uses your browser's print dialog — choose "Save as PDF". Fills one A4 page.
        </span>
      </div>

      <LocationPicker location={location} onLocationChange={setLocation} />

      <ReportHeader meta={meta} onChange={setMeta} address={location?.address} />

      <div className="storyboard-grid">
        {FRAME_TITLES.map((title, i) => (
          <StoryboardPanel
            key={title}
            title={title}
            mapUrl={mapUrl}
            items={frames[i]}
            onItemsChange={(items) => updateFrame(i, items)}
          />
        ))}
      </div>
    </div>
  )
}
