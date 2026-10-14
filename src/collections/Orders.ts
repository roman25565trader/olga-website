import type { CollectionConfig } from 'payload'
import { loggedIn } from '../lib/access'
import { notifyTelegram } from '../lib/notify'

export const ORDER_STATUSES = [
  { label: '🆕 Новый', value: 'new' },
  { label: 'Принят', value: 'accepted' },
  { label: 'Собран', value: 'assembled' },
  { label: 'В доставке', value: 'delivering' },
  { label: '✅ Выполнен', value: 'done' },
  { label: 'Отменён', value: 'canceled' },
]

const rub = (n?: number | null) => `${(n ?? 0).toLocaleString('ru-RU')} ₽`

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Заказ', plural: 'Заказы' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Магазин',
    useAsTitle: 'number',
    defaultColumns: ['number', 'status', 'customerName', 'customerPhone', 'total', 'deliveryDate', 'createdAt'],
    listSearchableFields: ['number', 'customerName', 'customerPhone'],
    description: 'Заказы с сайта. Меняйте статус по мере работы.',
  },
  // Заказы создаёт только сайт (через свой обработчик), смотрят и меняют — администраторы
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && !data.number) {
          const { totalDocs } = await req.payload.count({ collection: 'orders', req })
          data.number = String(1001 + totalDocs)
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        const lines = (doc.items || [])
          .map((i: { title: string; variant?: string; qty: number; price: number }) =>
            `• ${i.title}${i.variant ? ` (${i.variant})` : ''} × ${i.qty} — ${rub(i.price * i.qty)}`,
          )
          .join('\n')
        await notifyTelegram(
          req.payload,
          [
            `💐 Новый заказ №${doc.number}`,
            lines,
            doc.packaging ? `Оформление: ${doc.packaging}` : '',
            `Доставка: ${doc.deliveryMethod === 'pickup' ? 'самовывоз' : `${doc.zone || ''} ${doc.address || ''}`}`,
            doc.deliveryDate ? `Когда: ${doc.deliveryDate} ${doc.deliveryTime || ''}` : '',
            `Итого: ${rub(doc.total)}`,
            `Клиент: ${doc.customerName} ${doc.customerPhone}`,
            doc.comment ? `Комментарий: ${doc.comment}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        )
        return doc
      },
    ],
  },
  fields: [
    { name: 'number', label: 'Номер', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'new',
      options: ORDER_STATUSES,
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      label: 'Откуда',
      type: 'select',
      defaultValue: 'cart',
      options: [
        { label: 'Корзина', value: 'cart' },
        { label: 'Конструктор букета', value: 'builder' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'adminNote', label: 'Заметка для себя', type: 'textarea', admin: { position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Покупатель',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'customerName', label: 'Имя', type: 'text', required: true },
            { name: 'customerPhone', label: 'Телефон', type: 'text', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'recipientName', label: 'Получатель', type: 'text' },
            { name: 'recipientPhone', label: 'Телефон получателя', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Состав заказа',
      fields: [
        {
          name: 'items',
          label: 'Позиции',
          type: 'array',
          labels: { singular: 'Позиция', plural: 'Позиции' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', label: 'Что', type: 'text', required: true },
                { name: 'variant', label: 'Размер / вариант', type: 'text' },
                { name: 'qty', label: 'Кол-во', type: 'number', required: true },
                { name: 'price', label: 'Цена за шт', type: 'number', required: true },
              ],
            },
          ],
        },
        { name: 'packaging', label: 'Оформление', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'itemsTotal', label: 'Товары, ₽', type: 'number' },
            { name: 'deliveryPrice', label: 'Доставка, ₽', type: 'number' },
            { name: 'total', label: 'Итого, ₽', type: 'number' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Доставка',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'deliveryMethod',
              label: 'Способ',
              type: 'select',
              options: [
                { label: 'Доставка', value: 'delivery' },
                { label: 'Самовывоз', value: 'pickup' },
              ],
            },
            { name: 'zone', label: 'Зона', type: 'text' },
          ],
        },
        { name: 'address', label: 'Адрес', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'deliveryDate', label: 'Дата', type: 'text' },
            { name: 'deliveryTime', label: 'Время', type: 'text' },
          ],
        },
        { name: 'cardText', label: 'Текст открытки', type: 'textarea' },
        { name: 'comment', label: 'Комментарий покупателя', type: 'textarea' },
        { name: 'anonymous', label: 'Анонимно', type: 'checkbox' },
      ],
    },
  ],
}
