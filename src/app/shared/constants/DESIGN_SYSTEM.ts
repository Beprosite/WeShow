export const DESIGN_PATTERNS = {
  // Container Patterns
  CARD: {
    wrapper: "relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0",
    inner: "bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10",
  },

  // Background Colors
  COLORS: {
    background: "bg-black",
    card: "bg-gradient-to-b from-[#0A0A0A] to-black",
    hover: "hover:bg-[#222222]",
    border: "border-white/10",
    borderHover: "hover:border-white/20",
  },

  // Typography
  TEXT: {
    primary: "text-white",
    secondary: "text-white/60",
    tertiary: "text-white/40",
    heading: "font-light",
  },

  // Button Styles
  BUTTON: {
    primary: "flex items-center gap-1 px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white",
    secondary: "flex items-center gap-1 px-2.5 py-0.5 text-white/40 hover:text-white transition-colors text-xs",
  },

  // Icon Sizes
  ICON: {
    small: "w-3.5 h-3.5",
    medium: "w-4 h-4",
    large: "w-5 h-5",
  },

  // Loading States
  LOADING: {
    spinner: "animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white",
  },

  // Layout
  LAYOUT: {
    maxWidth: "max-w-[1490px]",
    padding: "px-5",
    gap: "gap-6",
  }
} as const;

// Usage example in comments:
/*
import { DESIGN_PATTERNS } from '@/shared/constants/DESIGN_SYSTEM';

// Card with corner decorations:
<div className={DESIGN_PATTERNS.CARD.wrapper}>
  <div className={DESIGN_PATTERNS.CARD.inner}>
    Content
  </div>
</div>

// Button:
<button className={DESIGN_PATTERNS.BUTTON.primary}>
  <Icon className={DESIGN_PATTERNS.ICON.small} />
  <span>Button Text</span>
</button>
*/ 