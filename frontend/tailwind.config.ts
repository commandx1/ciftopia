import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'rose-primary': '#E91E63',
  			'coral-warm': '#FF6B6B',
  			'cream-white': '#FFF5F5',
  			'soft-gray': '#F8F9FA'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			serif: [
  				'Playfair Display',
  				'serif'
  			],
  			sans: [
  				'Inter',
  				'sans-serif'
  			]
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
  			'heartbeat': {
  				'0%, 100%': { transform: 'scale(1)' },
  				'25%': { transform: 'scale(1.1)' },
  				'50%': { transform: 'scale(1)' },
  				'75%': { transform: 'scale(1.15)' },
  			},
  			'pulse-ring': {
  				'0%': { transform: 'scale(0.8)', opacity: '1' },
  				'50%': { transform: 'scale(1.2)', opacity: '0.5' },
  				'100%': { transform: 'scale(1.5)', opacity: '0' },
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-20px)' },
  			},
  			'fade-in-up': {
  				from: { 
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				to: { 
  					opacity: '1',
  					transform: 'translateY(0)'
  				},
  			},
  			'dot-pulse': {
  				'0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
  				'40%': { opacity: '1', transform: 'scale(1)' },
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
  			'pulse-ring': 'pulse-ring 2s ease-out infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'spin-slow': 'spin 3s linear infinite',
  			'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
  			'dot-pulse1': 'dot-pulse 1.5s infinite ease-in-out -0.3s',
  			'dot-pulse2': 'dot-pulse 1.5s infinite ease-in-out',
  			'dot-pulse3': 'dot-pulse 1.5s infinite ease-in-out 0.3s',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
