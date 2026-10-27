import type { GlobalConfig } from 'payload'
import { changesField } from '../fields/changes'
import { revalidateGlobal } from '../lib/revalidate'

export const About: GlobalConfig = {
  slug: 'about',
  label: '👩‍🌾 О нас',
  admin: { group: 'Тексты сайта', hideAPIURL: true },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  versions: { max: 20 },
  fields: [
    changesField,
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
