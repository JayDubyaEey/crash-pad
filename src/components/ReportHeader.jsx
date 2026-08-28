import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { lookupVehicle } from '../lib/dvla'
import { NumberPlateInput } from './NumberPlateInput'

export function ReportHeader({ meta, onChange, location }) {
  const [lookup, setLookup] = useState({}) // { [regField]: 'loading' | 'error' | undefined }

  function set(field) {
    return (e) => onChange({ ...meta, [field]: e.target.value })
  }

  function setValue(field) {
    return (val) => onChange({ ...meta, [field]: val })
  }

  function lookupReg(regField, modelField) {
    return async () => {
      const reg = meta[regField]
      if (!reg.trim()) return
      setLookup((prev) => ({ ...prev, [regField]: 'loading' }))
      try {
        const data = await lookupVehicle(reg)
        setLookup((prev) => ({ ...prev, [regField]: undefined }))
        if (!meta[modelField].trim()) {
          onChange({ ...meta, [modelField]: [data.make, data.colour].filter(Boolean).join(' · ') })
        }
      } catch {
        setLookup((prev) => ({ ...prev, [regField]: 'error' }))
      }
    }
  }

  return (
    <div className="report-header border-b-2 border-foreground pb-2 mb-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="m-0 text-xl font-semibold">Accident Report Diagram</h1>
        <Input type="date" className="date-input w-auto" value={meta.date} onChange={set('date')} />
      </div>

      <div className="mt-1 text-sm text-foreground/80">{location?.address || 'No location set'}</div>
      {location && (
        <div className="mb-2 font-mono text-xs text-muted-foreground">
          Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </div>
      )}

      <div className="mb-2 flex gap-4">
        <div className="party-field flex flex-1 flex-col items-start gap-1 text-xs font-normal text-muted-foreground">
          <span>Your vehicle</span>
          <NumberPlateInput
            value={meta.yourVehicleReg}
            onChange={setValue('yourVehicleReg')}
            onBlur={lookupReg('yourVehicleReg', 'yourVehicleModel')}
            status={lookup.yourVehicleReg}
          />
          {lookup.yourVehicleReg === 'error' && <span className="no-print text-destructive">Vehicle not found</span>}
          <Input
            type="text"
            className="vehicle-model-input"
            placeholder="Make / model"
            value={meta.yourVehicleModel}
            onChange={set('yourVehicleModel')}
          />
        </div>
        <div className="party-field flex flex-1 flex-col items-start gap-1 text-xs font-normal text-muted-foreground">
          <span>Other vehicle</span>
          <NumberPlateInput
            value={meta.otherVehicleReg}
            onChange={setValue('otherVehicleReg')}
            onBlur={lookupReg('otherVehicleReg', 'otherVehicleModel')}
            status={lookup.otherVehicleReg}
          />
          {lookup.otherVehicleReg === 'error' && (
            <span className="no-print text-destructive">Vehicle not found</span>
          )}
          <Input
            type="text"
            className="vehicle-model-input"
            placeholder="Make / model"
            value={meta.otherVehicleModel}
            onChange={set('otherVehicleModel')}
          />
        </div>
      </div>

      <Label className="notes-field flex-col items-stretch gap-1 text-xs font-normal text-muted-foreground">
        Notes
        <Textarea
          rows={3}
          placeholder="Describe what happened..."
          value={meta.notes}
          onChange={set('notes')}
        />
      </Label>
    </div>
  )
}
