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
					DEFAULT: '#0055FF', // Mercury blue
					light: '#3377FF',
					dark: '#0044CC',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#F5F7FA', // Mercury light gray
					light: '#FFFFFF',
					dark: '#E5E9F0',
					foreground: '#1A1F36'
				},
				tertiary: {
					DEFAULT: '#1A1F36', // Mercury dark blue/black
					light: '#2D3452',
					dark: '#0F1225',
					foreground: '#FFFFFF'
				},
				destructive: {
					DEFAULT: '#FF4D4F',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#6B7280', // Mercury muted text
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: '#F0F4FF', // Mercury light blue accent
					foreground: '#0055FF'
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
					DEFAULT: '#1A1F36', // Mercury sidebar dark
					foreground: '#FFFFFF',
					primary: '#0055FF',
					'primary-foreground': '#FFFFFF',
					accent: '#F0F4FF',
					'accent-foreground': '#0055FF',
					border: '#2D3452',
					ring: '#0055FF'
				},
				neutral: '#6B7280', // Mercury neutral text
				softWhite: '#FFFFFF', // Mercury white
				success: {
					DEFAULT: '#52C41A', // Mercury success green
					foreground: '#FFFFFF'
				},
				warning: {
					DEFAULT: '#FAAD14', // Mercury warning yellow
					foreground: '#FFFFFF'
				},
				info: {
					DEFAULT: '#1890FF', // Mercury info blue
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
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 85, 255, 0.4)' },
					'50%': { boxShadow: '0 0 20px 10px rgba(0, 85, 255, 0.2)' }
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
				'auth-gradient': 'linear-gradient(to right bottom, #F5F7FA, #FFFFFF)',
				'primary-gradient': 'linear-gradient(to right, #0055FF, #3377FF)',
				'secondary-gradient': 'linear-gradient(to right, #F5F7FA, #FFFFFF)',
				'dark-gradient': 'linear-gradient(135deg, #1A1F36 0%, #2D3452 100%)',
				'soft-gradient': 'linear-gradient(to bottom right, #F5F7FA, #FFFFFF)',
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
				'button': '0 1px 2px rgba(0, 85, 255, 0.1)',
				'button-hover': '0 2px 4px rgba(0, 85, 255, 0.2)',
				'dropdown': '0 4px 12px rgba(0, 0, 0, 0.1)',
				'sidebar': '0 0 15px rgba(0, 0, 0, 0.05)'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
