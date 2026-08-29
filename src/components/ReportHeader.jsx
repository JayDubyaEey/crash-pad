import { AlertTriangle, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { lookupVehicle } from '../lib/dvla'
import { isValidPlateFormat } from '../lib/plate'
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
  const [touched, setTouched] = useState(false)
  const reg = meta[regField]

  function setReg(val) {
    // Editing the plate invalidates whatever the last lookup found.
    onChange({ ...meta, [regField]: val, [verifiedField]: false })
  }

  function handleBlur(e) {
    setTouched(true)
    onRegBlur?.(e)
  }

  // Priority: an in-flight lookup wins, then a confirmed result, then a
  // failed lookup, then (only once the user has left the field) a plain
  // format check — typing "AB12" isn't "invalid" until they're done.
  const status =
    lookupStatus === 'loading'
      ? 'loading'
      : meta[verifiedField]
        ? 'valid'
        : lookupStatus === 'error'
          ? 'notfound'
          : touched && reg.trim() && !isValidPlateFormat(reg)
            ? 'invalid'
            : undefined

  return (
    <div className="field-card rounded-lg border border-border p-3">
      <Field label={label}>
        <NumberPlateInput value={reg} onChange={setReg} onBlur={handleBlur} status={status} />
        {meta[verifiedField] ? (
          <div className="vehicle-model-input mt-2 rounded-lg border border-input bg-muted px-2.5 py-1 text-sm text-foreground">
            {meta[modelField] || '—'}
          </div>
        ) : (
          <div className="relative mt-2">
            <Input
              type="text"
              className="vehicle-model-input pr-8"
              placeholder="Make / model"
              value={meta[modelField]}
              onChange={(e) => onChange({ ...meta, [modelField]: e.target.value })}
            />
            {status === 'notfound' && (
              <AlertTriangle
                size={15}
                className="no-print absolute right-2.5 top-1/2 -translate-y-1/2 text-destructive"
                title="Unable to retrieve DVLA data"
              />
            )}
          </div>
        )}
      </Field>
    </div>
  )
}

const PHONE_RE = /^\+?[\d\s()-]{7,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ValidatedField({ label, type = 'text', value, onChange, pattern, errorText, placeholder }) {
  const [touched, setTouched] = useState(false)
  const invalid = touched && value.trim() && !pattern.test(value.trim())

  return (
    <Field label={label}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={invalid ? 'border-destructive ring-3 ring-destructive/20' : ''}
      />
      {invalid && <span className="no-print text-xs text-destructive">{errorText}</span>}
    </Field>
  )
}

function DriverCard({ label, meta, onChange, prefix }) {
  function update(field, val) {
    onChange({ ...meta, [`${prefix}${field}`]: val })
  }

  return (
    <div className="field-card flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="text-[13px] font-semibold">{label}</div>

      <Field label="Name">
        <Input
          value={meta[`${prefix}Name`]}
          placeholder="First and last name"
          onChange={(e) => update('Name', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ValidatedField
          label="Phone"
          type="tel"
          placeholder="07123 456789"
          value={meta[`${prefix}Phone`]}
          onChange={(val) => update('Phone', val)}
          pattern={PHONE_RE}
          errorText="Enter a valid phone number"
        />
        <ValidatedField
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={meta[`${prefix}Email`]}
          onChange={(val) => update('Email', val)}
          pattern={EMAIL_RE}
          errorText="Enter a valid email address"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Home postcode">
          <Input value={meta[`${prefix}Postcode`]} onChange={(e) => update('Postcode', e.target.value)} />
        </Field>
        <Field label="Insurance provider">
          <Input
            value={meta[`${prefix}InsuranceProvider`]}
            onChange={(e) => update('InsuranceProvider', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Policy number">
        <Input value={meta[`${prefix}PolicyNumber`]} onChange={(e) => update('PolicyNumber', e.target.value)} />
      </Field>
    </div>
  )
}

const WEATHER_OPTIONS = [
  { value: 'clear', label: 'Clear', icon: Sun },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud },
  { value: 'rain', label: 'Rain', icon: CloudRain },
  { value: 'fog', label: 'Foggy', icon: CloudFog },
  { value: 'snow', label: 'Snow', icon: CloudSnow },
  { value: 'wind', label: 'Windy', icon: Wind },
  { value: 'storm', label: 'Storm', icon: CloudLightning },
]

function WeatherField({ meta, onChange }) {
  const selected = meta.weather ?? []

  function toggle(value) {
    const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    onChange({ ...meta, weather: next })
  }

  return (
    <div className="field-card rounded-lg border border-border p-3">
      <Field label="Weather conditions">
        <div className="no-print grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {WEATHER_OPTIONS.map((opt) => {
            const active = selected.includes(opt.value)
            return (
              <Button
                key={opt.value}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                className="w-full gap-1.5"
                onClick={() => toggle(opt.value)}
              >
                <opt.icon size={14} />
                {opt.label}
              </Button>
            )
          })}
        </div>

        <div className="weather-print flex flex-wrap gap-3 text-sm">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            WEATHER_OPTIONS.filter((o) => selected.includes(o.value)).map((opt) => (
              <span key={opt.value} className="inline-flex items-center gap-1">
                <opt.icon size={14} />
                {opt.label}
              </span>
            ))
          )}
        </div>
      </Field>
    </div>
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
    <div className="report-header flex flex-col gap-4 border-b border-border pb-4 mb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="m-0 text-xl font-semibold">Accident Report Diagram</h1>
        <Field label="Date" className="w-36 shrink-0">
          <Input type="date" className="date-input" value={meta.date} onChange={set('date')} />
        </Field>
      </div>

      <WeatherField meta={meta} onChange={onChange} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DriverCard label="Your driver details" meta={meta} onChange={onChange} prefix="yourDriver" />
        <DriverCard label="Other driver details" meta={meta} onChange={onChange} prefix="otherDriver" />
      </div>

      <div className="field-card rounded-lg border border-border p-3">
        <Field label="Notes">
          <Textarea
            rows={3}
            placeholder="Describe what happened..."
            value={meta.notes}
            onChange={set('notes')}
          />
        </Field>
      </div>
    </div>
  )
}
