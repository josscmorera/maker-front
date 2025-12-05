// ═══════════════════════════════════════════════════════════════════════════
// MAKERMIND — Design System Constants & Tokens
// ═══════════════════════════════════════════════════════════════════════════

export const APP_NAME = "MakerMind";
export const VERSION = "2.5.0-F";
export const TAGLINE = "Engineering Intelligence";

// ─────────────────────────────────────────────────────────────────────────────
// COLOR TOKENS — Deep Space / Sci-Fi HUD Palette
// ─────────────────────────────────────────────────────────────────────────────
export const COLORS = {
  // Core Backgrounds
  background: "#020405",      // Deepest void
  panel: "#0A0C10",           // Dark background
  carbon: "#12151A",          // Panel background
  
  // Blueprint Lines
  border: "#1E2329",          // Grid/Lines
  steel: "#2A303C",           // Structural elements
  
  // Text Hierarchy
  textPrimary: "#E2E8F0",     // Off-white
  textSecondary: "#94A3B8",   // Slate Blue Grey
  textMuted: "#475569",       // Darker Slate
  
  // Accent Colors
  accent: "#38B2AC",          // Structural Accent (Hologram Teal)
  accentGlow: "rgba(56, 178, 172, 0.15)",
  cyan: "#4FD1C5",            // Active Element
  cyanGlow: "rgba(79, 209, 197, 0.15)",
  
  // Status Colors
  warning: "#D69E2E",         // Muted Amber
  warningGlow: "rgba(214, 158, 46, 0.15)",
  danger: "#E53E3E",          // Engineered Red
  dangerGlow: "rgba(229, 62, 62, 0.15)",
  success: "#38A169",         // Muted Green
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CHART COLORS — For data visualization
// ─────────────────────────────────────────────────────────────────────────────
export const CHART_COLORS = [
  COLORS.accent,      // Teal
  COLORS.cyan,        // Active Cyan
  "#94A3B8",          // Slate
  COLORS.steel,       // Steel
  COLORS.textPrimary, // White
  COLORS.warning,     // Amber
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
