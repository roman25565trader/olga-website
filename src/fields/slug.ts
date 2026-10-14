import type { Field } from 'payload'
import { slugify } from '../lib/slugify'

/** Адрес страницы: заполняется сам из названия, можно поправить вручную. */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  label: 'Адрес в ссылке',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Заполнится сам из названия. Латиницей, без пробелов.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const src = data?.[from]
        return typeof src === 'string' ? slugify(src) : value
      },
    ],
  },
})
