import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { lookupVehicle } from '../lib/dvla'
import { NumberPlateInput } from './NumberPlateInput'

function Field({ label, children, className = '' }) {
  return (
    <Label className={`flex-col items-stretch gap-1 text-xs font-medium text-muted-foreground ${className}`}>
      {label}
      {children}
    </Label>
  )
}

function VehicleField({ label, meta, onChange, regField, modelField, verifiedField, lookupStatus, onRegBlur }) {
  function setReg(val) {
    // Editing the plate invalidates whatever the last lookup found.
    onChange({ ...meta, [regField]: val, [verifiedField]: false })
  }

  return (
    <Field label={label}>
      <NumberPlateInput value={meta[regField]} onChange={setReg} onBlur={onRegBlur} status={lookupStatus} />
      {lookupStatus === 'error' && (
        <span className="no-print text-destructive">Vehicle not found — enter make/model manually</span>
      )}
      {meta[verifiedField] ? (
        <div className="vehicle-model-input rounded-lg border border-input bg-muted px-2.5 py-1 text-sm text-foreground">
          {meta[modelField] || '—'}
        </div>
      ) : (
        <Input
          type="text"
          className="vehicle-model-input"
          placeholder="Make / model"
          value={meta[modelField]}
          onChange={(e) => onChange({ ...meta, [modelField]: e.target.value })}
        />
      )}
    </Field>
  )
}

export function ReportHeader({ meta, onChange }) {
  const [lookup, setLookup] = useState({}) // { [regField]: 'loading' | 'error' | undefined }

  function set(field) {
    return (e) => onChange({ ...meta, [field]: e.target.value })
  }

  function lookupReg(regField, modelField, verifiedField) {
    return async () => {
      const reg = meta[regField]
      if (!reg.trim()) return
      setLookup((prev) => ({ ...prev, [regField]: 'loading' }))
      try {
        const data = await lookupVehicle(reg)
        onChange((prevMeta) => ({
          ...prevMeta,
          [modelField]: [data.make, data.colour].filter(Boolean).join(' · '),
          [verifiedField]: true,
        }))
        setLookup((prev) => ({ ...prev, [regField]: undefined }))
      } catch {
        onChange((prevMeta) => ({ ...prevMeta, [verifiedField]: false }))
        setLookup((prev) => ({ ...prev, [regField]: 'error' }))
      }
    }
  }

  return (
    <div className="report-header flex flex-col gap-4 border-b-2 border-foreground pb-4 mb-4">
      <h1 className="m-0 text-xl font-semibold">Accident Report Diagram</h1>

      <Field label="Date" className="w-44">
        <Input type="date" className="date-input" value={meta.date} onChange={set('date')} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <VehicleField
          label="Your vehicle"
          meta={meta}
          onChange={onChange}
          regField="yourVehicleReg"
          modelField="yourVehicleModel"
          verifiedField="yourVehicleVerified"
          lookupStatus={lookup.yourVehicleReg}
          onRegBlur={lookupReg('yourVehicleReg', 'yourVehicleModel', 'yourVehicleVerified')}
        />
        <VehicleField
          label="Other vehicle"
          meta={meta}
          onChange={onChange}
          regField="otherVehicleReg"
          modelField="otherVehicleModel"
          verifiedField="otherVehicleVerified"
          lookupStatus={lookup.otherVehicleReg}
          onRegBlur={lookupReg('otherVehicleReg', 'otherVehicleModel', 'otherVehicleVerified')}
        />
      </div>

      <Field label="Notes">
        <Textarea
          rows={3}
          placeholder="Describe what happened..."
          value={meta.notes}
          onChange={set('notes')}
        />
      </Field>
    </div>
  )
}
