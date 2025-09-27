import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Modern gradient colors
				gradient: {
					from: {
						primary: 'hsl(var(--primary))',
						secondary: 'hsl(var(--secondary))',
						accent: 'hsl(var(--accent))'
					},
					to: {
						primary: 'hsl(calc(var(--primary-h) + 20) var(--primary-s) calc(var(--primary-l) - 10))',
						secondary: 'hsl(calc(var(--secondary-h) + 20) var(--secondary-s) calc(var(--secondary-l) - 10))',
						accent: 'hsl(calc(var(--accent-h) + 20) var(--accent-s) calc(var(--accent-l) - 10))'
					}
				},
				// Glass morphism colors
				glass: {
					white: 'rgba(255, 255, 255, 0.1)',
					black: 'rgba(0, 0, 0, 0.1)',
					primary: 'rgba(var(--primary-rgb), 0.1)',
					secondary: 'rgba(var(--secondary-rgb), 0.1)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Modern radius options
				xs: '4px',
				xl: '16px',
				'2xl': '20px',
				'3xl': '24px',
				full: '9999px'
			},
			// Modern spacing scale
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
				'144': '36rem'
			},
			// Modern shadows
			boxShadow: {
				'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
				'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
				'hard': '0 8px 32px rgba(0, 0, 0, 0.12)',
				'glow': '0 0 20px rgba(var(--primary-rgb), 0.3)',
				'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
			},
			// Modern backdrop blur
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '12px',
				lg: '16px',
				xl: '24px',
				'2xl': '40px',
				'3xl': '64px'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(10px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				// Modern animations
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'shimmer': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(var(--primary-rgb), 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.8), 0 0 30px rgba(var(--primary-rgb), 0.6)'
					}
				},
				'bounce-soft': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-2px)'
					}
				},
				'slide-in-left': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'morph': {
					'0%': {
						borderRadius: '20px'
					},
					'50%': {
						borderRadius: '50px'
					},
					'100%': {
						borderRadius: '20px'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				// Modern animations
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'morph': 'morph 4s ease-in-out infinite',
				// Micro-interactions
				'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'spin-slow': 'spin 3s linear infinite',
				'bounce-gentle': 'bounce 1s infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
