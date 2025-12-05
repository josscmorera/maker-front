// ═══════════════════════════════════════════════════════════════════════════
// MAKERMIND — Design System Constants & Tokens
// ═══════════════════════════════════════════════════════════════════════════

export const APP_NAME = "MakerMind";
export const VERSION = "2.5.0-F";
export const TAGLINE = "Engineering Intelligence";

// ─────────────────────────────────────────────────────────────────────────────
// COLOR TOKENS — Industrial Palette
// ─────────────────────────────────────────────────────────────────────────────
export const COLORS = {
  // Core Backgrounds
  background: "#0C0D0F",      // Deep black
  panel: "#1A1D1F",           // Carbon panel
  carbon: "#141618",          // Dark carbon
  
  // Blueprint Lines
  border: "#2A2F33",          // Blueprint lines
  steel: "#3D4349",           // Steel gray
  
  // Text Hierarchy
  textPrimary: "#DDE1E7",     // Primary text
  textSecondary: "#7E8A98",   // Secondary text (titanium)
  textMuted: "#4A5158",       // Muted text
  
  // Accent Colors
  accent: "#0EE7C7",          // Industrial Teal - Primary accent
  accentGlow: "rgba(14, 231, 199, 0.3)",
  cyan: "#47F3FF",            // Neon Cyan - Highlight
  cyanGlow: "rgba(71, 243, 255, 0.2)",
  
  // Status Colors
  warning: "#F3C623",         // Safety Yellow
  warningGlow: "rgba(243, 198, 35, 0.2)",
  danger: "#FF4747",          // Danger Red
  dangerGlow: "rgba(255, 71, 71, 0.2)",
  success: "#0EE7C7",         // Same as accent
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CHART COLORS — For data visualization
// ─────────────────────────────────────────────────────────────────────────────
export const CHART_COLORS = [
  COLORS.accent,      // Teal
  COLORS.cyan,        // Cyan
  "#7E8A98",          // Titanium
  COLORS.steel,       // Steel
  COLORS.textPrimary, // Blueprint
  COLORS.warning,     // Yellow
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────
export const FONTS = {
  heading: "'Saira Condensed', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// REASONING SECTIONS — Section configuration for AI output parsing
// ─────────────────────────────────────────────────────────────────────────────
export const REASONING_SECTIONS = {
  PROJECT_UNDERSTANDING: {
    id: "project-understanding",
    title: "Project Understanding",
    icon: "target",
    number: "01",
  },
  ENGINEERING_DECOMPOSITION: {
    id: "engineering-decomposition",
    title: "Engineering Decomposition",
    icon: "layers",
    number: "02",
  },
  CALCULATIONS: {
    id: "calculations",
    title: "Calculations & Technical Logic",
    icon: "calculator",
    number: "03",
  },
  BOM: {
    id: "bom",
    title: "Bill of Materials",
    icon: "list",
    number: "04",
  },
  BUILD_STEPS: {
    id: "build-steps",
    title: "Build Blueprint",
    icon: "wrench",
    number: "05",
  },
  TESTING: {
    id: "testing",
    title: "Testing & Failure Analysis",
    icon: "shield-check",
    number: "06",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION DURATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// GRID CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
export const GRID = {
  size: 40,
  color: "rgba(42, 47, 51, 0.5)",
  colorStrong: "rgba(42, 47, 51, 0.8)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// STATUS MESSAGES
// ─────────────────────────────────────────────────────────────────────────────
export const STATUS_MESSAGES = {
  IDLE: "SYSTEM_READY",
  PROCESSING: "COMPUTING...",
  COMPLETE: "CALCULATION_COMPLETE",
  ERROR: "SYSTEM_ERROR",
} as const;
