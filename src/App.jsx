import { Download, Trash2 } from 'lucide-react'
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
  weather: [],
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

  // Explicit action rather than auto-copy — auto-copying would risk silently
  // clobbering work someone's already started on the next panel.
  function copyToNext(index) {
    setFrames((prev) =>
      prev.map((f, i) => (i === index + 1 ? prev[index].map((it) => ({ ...it })) : f))
    )
  }

  function handleClear() {
    if (!confirm('Clear all report data? This cannot be undone.')) return
    setLocation(null)
    setMeta({ ...DEFAULT_META, date: new Date().toISOString().slice(0, 10) })
    setFrames([[], [], []])
  }

  return (
    <div className="app">
      <div className="no-print toolbar mb-4 flex items-center justify-between gap-3 rounded-lg bg-foreground px-4 py-3 text-background">
        <span className="hint text-xs text-background/70">
          Uses your browser's print dialog — choose "Save as PDF". Fills two A4 pages. Entries
          are saved on this device automatically.
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5 text-background/70 hover:bg-background/10 hover:text-background"
            onClick={handleClear}
          >
            <Trash2 size={16} />
            Clear
          </Button>
          <Button type="button" variant="secondary" className="gap-1.5" onClick={() => window.print()}>
            <Download size={16} />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="print-page">
        <ReportHeader meta={meta} onChange={setMeta} />
        <LocationPicker location={location} onLocationChange={setLocation} />
        <div className="page-footer">Page 1 of 2</div>
      </div>

      <div className="print-page">
        <div className="page-running-header">
          <span className="font-semibold">Accident Report Diagram</span>
          <span>{meta.date}</span>
          <span>
            {meta.yourVehicleReg || 'Your vehicle —'} vs {meta.otherVehicleReg || 'other vehicle —'}
          </span>
        </div>
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
              onCopyToNext={i < FRAMES.length - 1 ? () => copyToNext(i) : undefined}
            />
          ))}
        </div>
        <div className="page-footer">Page 2 of 2</div>
      </div>
    </div>
  )
}
