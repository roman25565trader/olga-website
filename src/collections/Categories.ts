import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn, loggedIn } from '../lib/access'
import { revalidateAfterChange, revalidateAfterDelete } from '../lib/revalidate'
import { slugField } from '../fields/slug'

export const SECTIONS = [
  { label: 'Букеты', value: 'bukety' },
  { label: 'Композиции', value: 'kompozicii' },
] as const

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Раздел', plural: '🧺 Разделы каталога' },
  defaultSort: 'sortOrder',
  admin: {
    group: 'Что продаём',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['image', 'title', 'section', 'active'],
    description: 'Моно, авторские, с оформлением, только лента, в сумочках, в коробочках…',
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    {
      name: 'section',
      label: 'Где показывать',
      type: 'select',
      required: true,
      defaultValue: 'bukety',
      options: [...SECTIONS],
    },
    { name: 'image', label: 'Картинка раздела', type: 'upload', relationTo: 'media', admin: { components: { Cell: '@/components/admin/ThumbCell#ThumbCell' } } },
    { name: 'description', label: 'Короткое описание', type: 'textarea' },
    slugField(),
    {
      name: 'active',
      label: 'Показывать на сайте',
      type: 'checkbox',
      defaultValue: true,
      admin: { components: { Cell: '@/components/admin/BoolCell#BoolCell' }, position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      label: 'Порядок',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Меньше — выше' },
    },
  ],
}
