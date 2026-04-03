import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development' || mode === 'uat';
  const appName = isDev ? 'MineBox Test' : 'MineBox';
  const themeColor = isDev ? '#facc15' : '#6366f1'; // Yellow for Test/Dev, Indigo for Prod

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: appName,
        short_name: appName,
        description: isDev ? 'Your testing environment.' : 'Your premium productivity workspace.',
        theme_color: themeColor,
        background_color: '#0d1117',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        share_target: {
          action: '/share-target',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        }
      }
    })
  ],
  }
})


