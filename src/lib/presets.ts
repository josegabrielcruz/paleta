import type { MultiSeeds } from '../hooks/useMultiPalette'

export interface Preset extends MultiSeeds {
  name: string
}

export const PRESETS: Preset[] = [
  { name: 'Cobalt',  primary: '#2563eb', secondary: '#7c3aed', neutral: '#475569' },
  { name: 'Crimson', primary: '#dc2626', secondary: '#d97706', neutral: '#6b7280' },
  { name: 'Emerald', primary: '#059669', secondary: '#0ea5e9', neutral: '#374151' },
  { name: 'Violet',  primary: '#7c3aed', secondary: '#db2777', neutral: '#4b5563' },
  { name: 'Amber',   primary: '#d97706', secondary: '#059669', neutral: '#6b7280' },
  { name: 'Coral',   primary: '#f43f5e', secondary: '#8b5cf6', neutral: '#64748b' },
  { name: 'Teal',    primary: '#0891b2', secondary: '#7c3aed', neutral: '#475569' },
  { name: 'Sage',    primary: '#16a34a', secondary: '#2563eb', neutral: '#52525b' },
  { name: 'Sunset',  primary: '#ea580c', secondary: '#7c3aed', neutral: '#57534e' },
  { name: 'Dusk',    primary: '#6366f1', secondary: '#ec4899', neutral: '#64748b' },
]
