import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LocationPicker } from './components/LocationPicker'
import { ReportHeader } from './components/ReportHeader'
import { StoryboardPanel } from './components/StoryboardPanel'
import './App.css'

const STORAGE_KEY = 'crashpad-report'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const DEFAULT_META = {
  date: new Date().toISOString().slice(0, 10),
  yourVehicleReg: '',
  yourVehicleModel: '',
  yourVehicleVerified: false,
  otherVehicleReg: '',
  otherVehicleModel: '',
  otherVehicleVerified: false,
  notes: '',
}

const FRAMES = [
  {
    title: 'Prior to Incident',
    description: 'Vehicle positions and speeds just before the collision',
  },
  {
    title: 'Point of Impact',
    description: 'Where and how the vehicles collided',
  },
  {
    title: 'After the Incident',
    description: 'Final resting positions once everything stopped',
  },
]

export default function App() {
  const [location, setLocation] = useState(() => loadSaved()?.location ?? null)
  const [meta, setMeta] = useState(() => ({ ...DEFAULT_META, ...loadSaved()?.meta }))
  const [frames, setFrames] = useState(() => loadSaved()?.frames ?? [[], [], []])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ location, meta, frames }))
  }, [location, meta, frames])

  function updateFrame(index, items) {
    setFrames((prev) => prev.map((f, i) => (i === index ? items : f)))
  }

  // Explicit action rather than an auto-copy-on-first-item — auto-copying
  // would risk silently clobbering work someone's already started on the
  // other two panels.
  function copyBeforeToOthers() {
    setFrames((prev) => {
      const clone = () => prev[0].map((it) => ({ ...it }))
      return [prev[0], clone(), clone()]
    })
  }

  return (
    <div className="app">
      <div className="no-print toolbar flex items-center gap-3 mb-4">
        <Button type="button" onClick={() => window.print()}>
          Export PDF
        </Button>
        <span className="hint text-xs text-muted-foreground">
          Uses your browser's print dialog — choose "Save as PDF". Fills two A4 pages. Entries
          are saved on this device automatically.
        </span>
      </div>

      <div className="print-page">
        <ReportHeader meta={meta} onChange={setMeta} />
        <LocationPicker location={location} onLocationChange={setLocation} />
      </div>

      <div className="print-page">
        <h2 className="section-title mb-2 text-[15px]">Accident Storyboard</h2>
        <div className="storyboard-grid">
          {FRAMES.map((frame, i) => (
            <StoryboardPanel
              key={frame.title}
              title={frame.title}
              description={frame.description}
              location={location}
              items={frames[i]}
              onItemsChange={(items) => updateFrame(i, items)}
              onCopyToOthers={i === 0 ? copyBeforeToOthers : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
