
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isAndroid = mode === 'android'

  return {
    base: isAndroid ? './' : '/studio-audio-video/',
    plugins: [
      react(),
      ...(!isAndroid
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              manifest: {
                name: 'KAPIA ONE PRO — Editor Audiovisual',
                short_name: 'KAPIA ONE PRO',
                description: 'O teu espaço profissional para criar e editar áudio e vídeo.',
                theme_color: '#101113',
                background_color: '#101113',
                display: 'standalone',
                orientation: 'any',
                start_url: '/studio-audio-video/',
                scope: '/studio-audio-video/'
              }
            })
          ]
        : [])
    ]
  }
})
