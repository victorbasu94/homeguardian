import type { Config } from "tailwindcss";

// @ts-ignore
const tailwindcssAnimate = require("tailwindcss-animate");

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
				'2xl': '1200px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
				inter: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#A3BFFA', // Serenity Blue
					light: '#B9CFFB',
					dark: '#8AACF9',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#D4C7A9', // Warm Taupe
					light: '#E2D9C4',
					dark: '#C6B58E',
					foreground: '#1A2526'
				},
				tertiary: {
					DEFAULT: '#FBBF24', // Yellow
					light: '#FCCC55',
					dark: '#E5A91F',
					foreground: '#4A5568'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: '#4A4A4A', // Soft Graphite
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: '#D4C7A9', // Warm Taupe (same as secondary)
					foreground: '#1A2526'
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
				neutral: '#4A4A4A', // Soft Graphite for text
				softWhite: '#F5F5F5', // Guardian White for backgrounds
				success: {
					DEFAULT: '#2E7D32', // Success green
					foreground: '#FFFFFF'
				},
				warning: {
					DEFAULT: '#F59E0B', // Warning yellow
					foreground: '#FFFFFF'
				},
				info: {
					DEFAULT: '#3B82F6', // Info blue
					foreground: '#FFFFFF'
				}
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem',
				xl: '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
				'4xl': '2rem',
				full: '9999px',
			},
			spacing: {
				'4.5': '1.125rem',
				'13': '3.25rem',
				'15': '3.75rem',
				'18': '4.5rem',
				'22': '5.5rem',
				'26': '6.5rem',
				'30': '7.5rem',
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
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(163, 191, 250, 0.4)' },
					'50%': { boxShadow: '0 0 20px 10px rgba(163, 191, 250, 0.2)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'slow-bounce-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'40%': { transform: 'scale(1.05)', opacity: '0.7' },
					'60%': { transform: 'scale(0.98)', opacity: '0.9' },
					'80%': { transform: 'scale(1.01)', opacity: '0.95' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-soft': 'pulse-soft 2s infinite ease-in-out',
				'float': 'float 6s infinite ease-in-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
				'spin-slow': 'spin-slow 8s linear infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'slow-bounce-in': 'slow-bounce-in 3s ease-out'
			},
			transitionDuration: {
				'400': '400ms',
				'300': '300ms',
				'200': '200ms',
			},
			backgroundImage: {
				'auth-gradient': 'linear-gradient(to right bottom, #F5F5F5, #FFFFFF)',
				'primary-gradient': 'linear-gradient(to right, #A3BFFA, #B9CFFB)',
				'secondary-gradient': 'linear-gradient(to right, #D4C7A9, #E2D9C4)',
				'taupe-blue-gradient': 'linear-gradient(135deg, #D4C7A9 0%, #A3BFFA 100%)',
				'soft-gradient': 'linear-gradient(to bottom right, #F5F5F5, #FFFFFF)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			gridTemplateColumns: {
				'auto-fill-card': 'repeat(auto-fill, minmax(300px, 1fr))',
				'auto-fit-card': 'repeat(auto-fit, minmax(300px, 1fr))',
			},
			boxShadow: {
				'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
				'card-hover': '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
				'button': '0 1px 2px rgba(163, 191, 250, 0.2)',
				'button-hover': '0 2px 4px rgba(163, 191, 250, 0.3)',
				'dropdown': '0 4px 12px rgba(0, 0, 0, 0.1)',
				'sidebar': '0 0 15px rgba(0, 0, 0, 0.05)'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
