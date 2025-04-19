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
    accent: "#00A3FF",
    accentHover: "#00C2FF",
    accentTransparent: {
      10: "bg-[#00A3FF]/10",
      20: "bg-[#00A3FF]/20",
      30: "bg-[#00A3FF]/30"
    },
    borderAccent: {
      20: "border-[#00A3FF]/20",
      30: "border-[#00A3FF]/30"
    }
  },

  // Typography
  TEXT: {
    primary: "text-white",
    secondary: "text-white/60",
    tertiary: "text-white/40",
    heading: "font-light",
    gradient: {
      primary: "bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent",
      secondary: "bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent"
    }
  },

  // Button Styles
  BUTTON: {
    primary: "px-6 py-3 rounded-full inline-flex items-center justify-center bg-[#00A3FF]/20 backdrop-blur-sm text-white shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30 hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30 transition-all duration-200",
    secondary: "bg-[#00A3FF]/20 backdrop-blur-sm text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30 hover:bg-[#00A3FF]/30 transition-all duration-200",
    text: "text-white/40 hover:text-white transition-colors",
    link: "text-[#00A3FF] hover:text-[#00C2FF] transition-colors"
  },

  // Icon Styles
  ICON: {
    small: "w-3.5 h-3.5",
    medium: "w-4 h-4",
    large: "w-5 h-5",
    accent: "text-[#00A3FF]"
  },

  // Loading States
  LOADING: {
    spinner: "animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"
  },

  // Layout
  LAYOUT: {
    maxWidth: "max-w-[1490px]",
    padding: "px-5",
    gap: "gap-6",
    section: "py-20 px-4"
  },

  // Form Styles
  FORM: {
    input: "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[#00A3FF]/30",
    label: "block text-sm text-white/60 mb-1",
    error: "text-red-500 text-sm mt-1",
    success: "text-green-500 text-sm mt-1"
  },

  // Effects
  EFFECTS: {
    backdropBlur: "backdrop-blur-sm",
    shadow: {
      accent: "shadow-lg shadow-[#00A3FF]/20"
    }
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