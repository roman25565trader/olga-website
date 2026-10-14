import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../lib/revalidate'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'О нас',
  admin: { group: 'Страницы сайта' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', defaultValue: 'О *нас*' },
    { name: 'lead', label: 'Вступление', type: 'textarea' },
    { name: 'image', label: 'Фото', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Текст', type: 'richText' },
    {
      name: 'gallery',
      label: 'Галерея',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}
