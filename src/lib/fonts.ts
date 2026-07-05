import localFont from 'next/font/local'

const playfairDisplay = localFont({
  variable: '--font-display',
  display: 'swap',
  src: [
    { path: '../../public/fonts/playfair-display-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/playfair-display-normal-500.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/playfair-display-normal-600.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/playfair-display-normal-700.ttf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/playfair-display-normal-800.ttf', weight: '800', style: 'normal' },
    { path: '../../public/fonts/playfair-display-normal-900.ttf', weight: '900', style: 'normal' },
    { path: '../../public/fonts/playfair-display-italic-400.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/playfair-display-italic-500.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/playfair-display-italic-600.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/playfair-display-italic-800.ttf', weight: '800', style: 'italic' },
    { path: '../../public/fonts/playfair-display-italic-900.ttf', weight: '900', style: 'italic' },
  ],
})

const sourceSerif4 = localFont({
  variable: '--font-serif',
  display: 'swap',
  src: [
    { path: '../../public/fonts/source-serif-4-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/source-serif-4-normal-500.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/source-serif-4-normal-600.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/source-serif-4-normal-700.ttf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/source-serif-4-italic-400.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/source-serif-4-italic-500.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/source-serif-4-italic-600.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/source-serif-4-italic-700.ttf', weight: '700', style: 'italic' },
  ],
})

const dmSans = localFont({
  variable: '--font-sans',
  display: 'swap',
  src: [
    { path: '../../public/fonts/dm-sans-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/dm-sans-normal-500.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/dm-sans-normal-600.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/dm-sans-normal-700.ttf', weight: '700', style: 'normal' },
  ],
})

const jetbrainsMono = localFont({
  variable: '--font-mono',
  display: 'swap',
  src: [
    { path: '../../public/fonts/jetbrains-mono-normal-400.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/jetbrains-mono-normal-500.ttf', weight: '500', style: 'normal' },
  ],
})

export { playfairDisplay, sourceSerif4, dmSans, jetbrainsMono }
