import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Администратор', plural: '🔑 Вход в админку' },
  admin: { useAsTitle: 'email', group: 'Настройки', hideAPIURL: true },
  auth: { tokenExpiration: 60 * 60 * 24 * 30 },
  fields: [{ name: 'name', label: 'Имя', type: 'text' }],
}
