/**
 * CEDA Brand Theme Definition
 *
 * Single source of truth for CEDA's layout, colours, typography, and CSS variables.
 * Enables CEDA / partners to customise branding tokens from one place.
 */

export const CEDA_PALETTE = {
  // CEDA core palette sampled from ceda.co.bw
  ink: "#3a2a24",
  brown: "#604038",
  orange: "#d94914",
  red: "#a02010",
  amber: "#f8a018",
  yellow: "#f8c808",
  green: "#2f9e57",
  sand: "#faf6f2",
} as const;

export const CEDA_SUNRISE = {
  red: "#a02010",
  orange: "#f06020",
  amber: "#f8a018",
  yellow: "#f8c808",
} as const;

export const CEDA_METADATA = {
  name: "Citizen Entrepreneurial Development Agency",
  portalName: "CEDA Innovation Portal",
  shortName: "CEDA Ideas",
  tagline: "Finance · Develop · Sustain",
  supportEmail: "innovation@ceda.co.bw",
  tollFree: "0800 600 253",
  ussdCode: "*161#",
  workingHours: "09:00–16:00 CAT (Mon–Fri)",
} as const;

export const CEDA_CSS_VARS: Record<string, string> = {
  "--background": "#ffffff",
  "--foreground": "#0a0a0a",
  "--card": "#ffffff",
  "--card-foreground": "#0a0a0a",
  "--popover": "#ffffff",
  "--popover-foreground": "#0a0a0a",
  "--primary": "#3a2a24",
  "--primary-foreground": "#ffffff",
  "--secondary": "#faf6f2",
  "--secondary-foreground": "#3a2a24",
  "--muted": "#faf6f2",
  "--muted-foreground": "#6b7280",
  "--accent": "#faf6f2",
  "--accent-foreground": "#3a2a24",
  "--destructive": "#ef4444",
  "--destructive-foreground": "#ffffff",
  "--border": "#e5e7eb",
  "--input": "#e5e7eb",
  "--ring": "#d94914",
  "--radius": "0.5rem",

  "--chart-1": "#3a2a24",
  "--chart-2": "#d94914",
  "--chart-3": "#2f9e57",
  "--chart-4": "#f8a018",
  "--chart-5": "#a02010",

  "--sidebar": "#3a2a24",
  "--sidebar-foreground": "#ffffff",
  "--sidebar-primary": "#d94914",
  "--sidebar-primary-foreground": "#ffffff",
  "--sidebar-accent": "#4a3a32",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-border": "#4a3a32",
  "--sidebar-ring": "#d94914",
};
