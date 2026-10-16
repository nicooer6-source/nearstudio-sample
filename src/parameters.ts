import type { SampleControl, SampleParameterValues } from './types'

export function defaultParameters(controls: SampleControl[] = []): SampleParameterValues {
  return Object.fromEntries(controls.map((control) => [control.key, control.default]))
}

export function parametersFromSearch(search: URLSearchParams, controls: SampleControl[] = []) {
  const values = defaultParameters(controls)
  for (const control of controls) {
    const raw = search.get(`p.${control.key}`)
    if (raw === null) continue
    if (control.type === 'range') values[control.key] = Number.isFinite(Number(raw)) ? Number(raw) : control.default
    else if (control.type === 'toggle') values[control.key] = raw === 'true' || raw === '1'
    else values[control.key] = raw
  }
  return values
}

export function appendParameters(url: URL, values: SampleParameterValues) {
  Object.entries(values).forEach(([key, value]) => url.searchParams.set(`p.${key}`, String(value)))
  return url
}
