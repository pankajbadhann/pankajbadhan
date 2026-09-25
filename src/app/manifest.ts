// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pankaj Badhan Portfolio',
    short_name: 'Pankaj',
    description: 'Personal Portfolio & Web App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/me.png', // Or use a dedicated 192x192 icon from your public folder
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/me.png', // Or use a dedicated 512x512 icon from your public folder
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}