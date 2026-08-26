import { useState } from 'react'
import { LocationPicker } from './components/LocationPicker'
import { ReportHeader } from './components/ReportHeader'
import { ReferenceMap } from './components/ReferenceMap'
import { StoryboardPanel } from './components/StoryboardPanel'
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
          Uses your browser's print dialog — choose "Save as PDF". Fills two A4 pages.
        </span>
      </div>

      <LocationPicker location={location} onLocationChange={setLocation} />

      <div className="print-page">
        <ReportHeader meta={meta} onChange={setMeta} location={location} />
        <ReferenceMap location={location} />
        <p className="map-attribution">Map data &copy; OpenStreetMap contributors</p>
      </div>

      <div className="print-page">
        <h2 className="section-title">Accident Storyboard</h2>
        <div className="storyboard-grid">
          {FRAME_TITLES.map((title, i) => (
            <StoryboardPanel
              key={title}
              title={title}
              location={location}
              items={frames[i]}
              onItemsChange={(items) => updateFrame(i, items)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
