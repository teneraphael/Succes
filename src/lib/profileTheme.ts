export const PROFILE_COLORS = [
  { name: "Bleu DealCity", value: "#4a90e2" },
  { name: "Vert", value: "#6ab344" },
  { name: "Rose", value: "#ec4899" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Rouge", value: "#ef4444" },
  { name: "Turquoise", value: "#14b8a6" },
  { name: "Jaune", value: "#eab308" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Or", value: "#ca8a04" },
  { name: "Marron", value: "#92400e" },
  { name: "Noir", value: "#18181b" },
];

export const DEFAULT_BANNER_GRADIENT =
  "linear-gradient(135deg, #0a1f3a 0%, #1a3a6b 50%, #0d4a8a 100%)";

export function isValidHexColor(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

export function resolveTheme(color?: string | null) {
  return color && isValidHexColor(color) ? color : null;
}

// percent : -100 (plus sombre) → 100 (plus clair)
export function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function bannerGradient(hex: string) {
  return `linear-gradient(135deg, ${shadeColor(hex, -35)} 0%, ${hex} 55%, ${shadeColor(hex, 25)} 100%)`;
}