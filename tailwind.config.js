/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        navy: { DEFAULT: '#102B43', deep: '#0B2239', soft: '#1B3A57', line: '#21405E', muted: '#8EA3B8' },
        brand: { DEFAULT: '#0D9488', accent: '#14B8A6', dark: '#0B7A70', 50: '#EFF8F7', 100: '#D9F0ED' },
        canvas: '#F5F7FA',
        ink: '#172B40',
        muted: '#64748B',
        subtle: '#94A3B8',
        line: { DEFAULT: '#E1E7EE', soft: '#EDF1F5' },
        ok: { DEFAULT: '#16805D', bg: '#E9F5F0' },
        warn: { DEFAULT: '#B7791F', bg: '#FBF3E3' },
        bad: { DEFAULT: '#D64550', bg: '#FCEDEE' },
        info: { DEFAULT: '#477BA8', bg: '#ECF2F8' },
      },
      fontSize: {
        '2xs': ['11px', '16px'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 43, 67, 0.04)',
        pop: '0 12px 32px -8px rgba(11, 34, 57, 0.22), 0 2px 6px rgba(11, 34, 57, 0.06)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pop-in': { from: { opacity: 0, transform: 'translateY(4px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(24px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in 140ms ease-out',
        'pop-in': 'pop-in 160ms ease-out',
        'slide-in': 'slide-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
