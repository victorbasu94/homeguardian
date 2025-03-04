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
					DEFAULT: '#00C4B4', // Teal
					light: '#33D1C4',
					dark: '#00A396',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#FF6F61', // Coral
					light: '#FF8F84',
					dark: '#E5584A',
					foreground: '#FFFFFF'
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
				neutral: '#4A5568', // Gray for text
				softWhite: '#F8FAFC', // Soft white for backgrounds
			},
			borderRadius: {
				lg: '1rem',
				md: '0.75rem',
				sm: '0.5rem',
				xl: '1.25rem',
				'2xl': '1.5rem',
				'3xl': '1.75rem',
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
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 196, 180, 0.4)' },
                    '50%': { boxShadow: '0 0 20px 10px rgba(0, 196, 180, 0.2)' }
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
				'wiggle': 'wiggle 1s ease-in-out infinite'
			},
            transitionDuration: {
                '400': '400ms',
				'300': '300ms',
				'200': '200ms',
            },
            backgroundImage: {
                'auth-gradient': 'linear-gradient(to right bottom, #F8FAFC, #FFFFFF)',
                'primary-gradient': 'linear-gradient(to right, #00C4B4, #33D1C4)',
                'secondary-gradient': 'linear-gradient(to right, #FF6F61, #FF8F84)',
                'teal-coral-gradient': 'linear-gradient(135deg, #00C4B4 0%, #FF6F61 100%)',
				'soft-gradient': 'linear-gradient(to bottom right, #F8FAFC, #FFFFFF)',
            },
            backdropBlur: {
                'xs': '2px',
            },
			gridTemplateColumns: {
				'auto-fill-card': 'repeat(auto-fill, minmax(300px, 1fr))',
				'auto-fit-card': 'repeat(auto-fit, minmax(300px, 1fr))',
			},
			boxShadow: {
				'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
				'card-hover': '0 10px 30px rgba(0, 0, 0, 0.08)',
				'button': '0 4px 10px rgba(0, 196, 180, 0.2)',
				'button-hover': '0 6px 15px rgba(0, 196, 180, 0.3)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
