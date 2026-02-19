/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0a0e1a',
        'dark-blue': '#0d1526',
        'accent-blue': '#3B82F6',
        'accent-purple': '#A855F7',
        'accent-green': '#22C55E',
        'accent-orange': '#F97316',
        'accent-cyan': '#06B6D4',
        'glow-blue': '#60A5FA',
        'neural-pink': '#EC4899',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'neuron-fire': 'neuronFire 0.5s ease-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'electric-pulse': 'electricPulse 1s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
            filter: 'brightness(1)'
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(96, 165, 250, 0.6)',
            filter: 'brightness(1.2)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        neuronFire: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '0.8', transform: 'scale(1)' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '14%': { transform: 'scale(1.05)', opacity: '1' },
          '28%': { transform: 'scale(1)', opacity: '1' },
          '42%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(1)', opacity: '0.8' },
        },
        electricPulse: {
          '0%': { strokeDashoffset: '100%', opacity: '1' },
          '100%': { strokeDashoffset: '0%', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neural-gradient': 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #0d1526 100%)',
      },
    },
  },
  plugins: [],
}
