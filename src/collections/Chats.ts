import type { CollectionConfig } from 'payload'
import { loggedIn } from '../lib/access'

export const Chats: CollectionConfig = {
  slug: 'chats',
  labels: { singular: 'Чат', plural: 'Чат с флористом' },
  defaultSort: '-lastMessageAt',
  admin: {
    group: 'Магазин',
    useAsTitle: 'title',
    defaultColumns: ['title', 'unread', 'lastText', 'lastMessageAt'],
    description:
      'Сообщения из окна «Чат с флористом» на сайте. Откройте чат, напишите ответ в поле «Ваш ответ» и сохраните — покупатель увидит его на сайте.',
  },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        const reply = typeof data.reply === 'string' ? data.reply.trim() : ''
        if (reply && req.user) {
          data.messages = [...(data.messages || []), { from: 'florist', text: reply, at: new Date().toISOString() }]
          data.reply = ''
          data.unread = false
          data.lastMessageAt = new Date().toISOString()
          data.lastText = `Вы: ${reply}`.slice(0, 120)
        }
        data.title = [data.name, data.phone].filter(Boolean).join(' · ') || 'Без имени'
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } },
    {
      name: 'reply',
      label: 'Ваш ответ',
      type: 'textarea',
      admin: { description: 'Напишите и нажмите «Сохранить» — ответ уйдёт покупателю.' },
    },
    {
      name: 'messages',
      label: 'Переписка',
      type: 'array',
      labels: { singular: 'Сообщение', plural: 'Сообщения' },
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'from',
              label: 'Кто',
              type: 'select',
              required: true,
              options: [
                { label: 'Покупатель', value: 'client' },
                { label: 'Флорист', value: 'florist' },
              ],
            },
            { name: 'at', label: 'Когда', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd.MM.yyyy HH:mm' } } },
          ],
        },
        { name: 'text', label: 'Текст', type: 'textarea', required: true },
      ],
    },
    { name: 'name', label: 'Имя', type: 'text', admin: { position: 'sidebar' } },
    { name: 'phone', label: 'Телефон', type: 'text', admin: { position: 'sidebar' } },
    { name: 'unread', label: 'Не прочитано', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'lastText', label: 'Последнее сообщение', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'lastMessageAt',
      label: 'Время',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd.MM.yyyy HH:mm' } },
    },
    { name: 'token', type: 'text', index: true, admin: { hidden: true } },
  ],
}
