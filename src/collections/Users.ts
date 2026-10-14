import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Администратор', plural: 'Администраторы' },
  admin: { useAsTitle: 'email', group: 'Настройки' },
  auth: { tokenExpiration: 60 * 60 * 24 * 30 },
  fields: [{ name: 'name', label: 'Имя', type: 'text' }],
}
