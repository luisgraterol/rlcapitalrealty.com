/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f1f2e',
          mid: '#1a2f44',
          light: '#243a52',
        },
        gold: {
          DEFAULT: '#c9a96e',
          light: '#dfc090',
          dim: '#a8885a',
        },
        cream: {
          DEFAULT: '#faf8f4',
          dark: '#f2ede4',
        },
        body: '#3d3530',
        muted: '#7a6e65',
        profit: {
          DEFAULT: '#4caf81',
          dim: '#3a8a64',
          bg: 'rgba(76,175,129,0.1)',
        },
        risk: {
          DEFAULT: '#d4a32a',
          dim: '#b88a1e',
          bg: 'rgba(212,163,42,0.1)',
        },
        loss: {
          DEFAULT: '#c94a4a',
          dim: '#a83838',
          bg: 'rgba(201,74,74,0.1)',
        },
        error: '#c0392b',
        success: '#2e7d5e',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        350: '350ms',
      },
      backdropBlur: {
        nav: '12px',
      },
    },
  },
  plugins: [],
};
