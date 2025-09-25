// Design tokens for consistent spacing, colors, and typography
export const designTokens = {
  // Spacing scale (in rem units)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
    '4xl': '4rem',   // 64px
  },

  // Typography scale
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Z-index scale
  zIndex: {
    base: '0',
    dropdown: '10',
    sticky: '20',
    fixed: '30',
    modal: '40',
    tooltip: '50',
  },
} as const;

// Utility functions for consistent styling
export const getSpacing = (size: keyof typeof designTokens.spacing) => designTokens.spacing[size];
export const getFontSize = (size: keyof typeof designTokens.fontSize) => designTokens.fontSize[size];
export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => designTokens.borderRadius[size];
export const getBoxShadow = (size: keyof typeof designTokens.boxShadow) => designTokens.boxShadow[size];

// Component-specific token mappings
export const componentTokens = {
  button: {
    padding: {
      sm: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      md: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
      lg: `${designTokens.spacing.lg} ${designTokens.spacing.xl}`,
    },
    fontSize: {
      sm: designTokens.fontSize.sm,
      md: designTokens.fontSize.base,
      lg: designTokens.fontSize.lg,
    },
    borderRadius: designTokens.borderRadius.md,
  },
  
  card: {
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    shadow: designTokens.boxShadow.sm,
  },

  header: {
    height: '4rem', // 64px
    padding: `0 ${designTokens.spacing.lg}`,
    shadow: designTokens.boxShadow.sm,
  },
} as const;