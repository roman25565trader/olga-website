import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../lib/revalidate'

export const Builder: GlobalConfig = {
  slug: 'builder',
  label: '🎀 Конструктор букета',
  admin: { group: 'Тексты сайта', hideAPIURL: true, description: 'Сами цветы и цены — в разделе «Цветы для конструктора».' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Конструктор *вашего* букета' },
    {
      name: 'text',
      label: 'Пояснение',
      type: 'textarea',
      defaultValue: 'Выберите цветы и количество — цена считается сразу. Соберём из сегодняшней поставки и пришлём фото до отправки.',
    },
    {
      name: 'packaging',
      label: 'Варианты оформления',
      type: 'array',
      labels: { singular: 'Вариант', plural: 'Варианты' },
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Название', type: 'text', required: true },
            { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0, defaultValue: 0 },
          ],
        },
        { name: 'note', label: 'Пояснение', type: 'text' },
      ],
    },
    { name: 'minStems', label: 'Минимум цветов в букете', type: 'number', defaultValue: 3, min: 1 },
    { name: 'note', label: 'Подсказка под итогом', type: 'text', defaultValue: 'Лента в подарок. Подскажем, если число стеблей лучше сделать нечётным.' },
  ],
}
