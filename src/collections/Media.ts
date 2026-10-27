import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Фото или видео', plural: '🖼 Все фото и видео' },
  admin: {
    group: 'Что продаём',
    hideAPIURL: true,
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description: 'Все фото и видео сайта. Загружайте как есть с телефона — сайт сам уменьшит и сожмёт.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    {
      name: 'alt',
      label: 'Что на фото (для поисковиков)',
      type: 'text',
      admin: { description: 'Например: «Букет из пионовидных роз в крафте». Можно оставить пустым.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'video/quicktime'],
    focalPoint: true,
    crop: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'xs', width: 160, height: 160, position: 'centre', formatOptions: { format: 'webp', options: { quality: 74 } } },
      { name: 'sm', width: 480, formatOptions: { format: 'webp', options: { quality: 76 } } },
      { name: 'md', width: 900, formatOptions: { format: 'webp', options: { quality: 76 } } },
      { name: 'lg', width: 1600, formatOptions: { format: 'webp', options: { quality: 78 } } },
    ],
    adminThumbnail: 'xs',
  },
}
