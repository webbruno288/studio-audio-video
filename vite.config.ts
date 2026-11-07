
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/studio-audio-video/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['studio-icon.svg'],
      manifest: {
        name: 'Studio — Audio & Video',
        short_name: 'Studio',
        description: 'O teu estúdio audiovisual pessoal.',
        theme_color: '#101113',
        background_color: '#101113',
        display: 'standalone',
        orientation: 'any',
        start_url: '/studio-audio-video/',
        scope: '/studio-audio-video/',
        icons: [
          {
            src: '/studio-audio-video/studio-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
