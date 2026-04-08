export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://strainspotter.vercel.app';

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export const COLORS = {
  background: '#0D1F0D',
  surface: '#1A2E1A',
  surfaceElevated: '#223322',
  accent: '#4ADE80',
  accentDim: '#22C55E',
  accentMuted: '#16A34A',
  text: '#F0FFF0',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',
  border: '#2D4A2D',
  borderMuted: '#1F361F',
  error: '#EF4444',
  warning: '#F59E0B',
  gold: '#F59E0B',
  purple: '#A855F7',
  blue: '#3B82F6',
} as const;

export const TIERS = {
  free: { label: 'Free', scansPerDay: 3 },
  member: { label: 'Member', scansPerDay: 30 },
  pro: { label: 'Pro', scansPerDay: -1 },
} as const;

export type TierKey = keyof typeof TIERS;
