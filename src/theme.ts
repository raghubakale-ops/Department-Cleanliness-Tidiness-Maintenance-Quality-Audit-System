export interface ColorTheme {
  id: string;
  name: string;
  primary: string; // e.g. '#1F3864'
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  accent: string;
  accentText: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  previewColor: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'navy-gold',
    name: 'JCE Navy & Gold',
    primary: '#1F3864',
    primaryHover: '#152747',
    primaryLight: '#eef3fb',
    primaryText: '#1F3864',
    accent: '#d97706',
    accentText: '#92400e',
    headerBg: '#1F3864',
    headerText: '#ffffff',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    borderAccent: '#f59e0b',
    previewColor: '#1F3864'
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue & Silver',
    primary: '#1d4ed8',
    primaryHover: '#1e40af',
    primaryLight: '#eff6ff',
    primaryText: '#1d4ed8',
    accent: '#0284c7',
    accentText: '#0369a1',
    headerBg: '#1e40af',
    headerText: '#ffffff',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    borderAccent: '#38bdf8',
    previewColor: '#1d4ed8'
  },
  {
    id: 'emerald-green',
    name: 'Campus Emerald & Gold',
    primary: '#065f46',
    primaryHover: '#064e3b',
    primaryLight: '#ecfdf5',
    primaryText: '#065f46',
    accent: '#d97706',
    accentText: '#92400e',
    headerBg: '#064e3b',
    headerText: '#ffffff',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    borderAccent: '#10b981',
    previewColor: '#059669'
  },
  {
    id: 'crimson-maroon',
    name: 'Academic Crimson & Bronze',
    primary: '#881337',
    primaryHover: '#700c2a',
    primaryLight: '#fff1f2',
    primaryText: '#881337',
    accent: '#ea580c',
    accentText: '#c2410c',
    headerBg: '#700c2a',
    headerText: '#ffffff',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    borderAccent: '#fb7185',
    previewColor: '#881337'
  },
  {
    id: 'tech-indigo',
    name: 'Deep Tech Indigo',
    primary: '#3730a3',
    primaryHover: '#312e81',
    primaryLight: '#eef2ff',
    primaryText: '#3730a3',
    accent: '#0891b2',
    accentText: '#0e7490',
    headerBg: '#312e81',
    headerText: '#ffffff',
    badgeBg: '#cffafe',
    badgeText: '#155e75',
    borderAccent: '#818cf8',
    previewColor: '#4f46e5'
  },
  {
    id: 'midnight-slate',
    name: 'Executive Midnight Slate',
    primary: '#0f172a',
    primaryHover: '#020617',
    primaryLight: '#f8fafc',
    primaryText: '#0f172a',
    accent: '#3b82f6',
    accentText: '#1d4ed8',
    headerBg: '#0f172a',
    headerText: '#ffffff',
    badgeBg: '#e2e8f0',
    badgeText: '#1e293b',
    borderAccent: '#64748b',
    previewColor: '#1e293b'
  }
];

export const CATEGORY_COLORS = [
  { border: 'border-l-blue-600', text: 'text-blue-800', bg: 'bg-blue-50/70', tag: 'bg-blue-100 text-blue-900 border-blue-200' },
  { border: 'border-l-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50/70', tag: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  { border: 'border-l-purple-600', text: 'text-purple-800', bg: 'bg-purple-50/70', tag: 'bg-purple-100 text-purple-900 border-purple-200' },
  { border: 'border-l-amber-600', text: 'text-amber-800', bg: 'bg-amber-50/70', tag: 'bg-amber-100 text-amber-900 border-amber-200' },
  { border: 'border-l-cyan-600', text: 'text-cyan-800', bg: 'bg-cyan-50/70', tag: 'bg-cyan-100 text-cyan-900 border-cyan-200' },
  { border: 'border-l-lime-600', text: 'text-lime-800', bg: 'bg-lime-50/70', tag: 'bg-lime-100 text-lime-900 border-lime-200' },
  { border: 'border-l-rose-600', text: 'text-rose-800', bg: 'bg-rose-50/70', tag: 'bg-rose-100 text-rose-900 border-rose-200' }
];

export function getThemeById(id: string): ColorTheme {
  return COLOR_THEMES.find(t => t.id === id) || COLOR_THEMES[0];
}
