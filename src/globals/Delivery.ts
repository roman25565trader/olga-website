import type { GlobalConfig } from 'payload'
import { changesField } from '../fields/changes'
import { revalidateGlobal } from '../lib/revalidate'

export const Delivery: GlobalConfig = {
  slug: 'delivery',
  label: '🚚 Доставка и оплата',
  admin: { group: 'Тексты сайта', hideAPIURL: true },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  versions: { max: 20 },
  fields: [
    changesField,
    { name: 'title', label: 'Заголовок страницы', type: 'text', defaultValue: 'Доставка и *оплата*' },
    { name: 'intro', label: 'Вступление', type: 'textarea' },
    {
      name: 'zones',
      label: 'Зоны доставки',
      type: 'array',
      labels: { singular: 'Зона', plural: 'Зоны' },
      admin: { description: 'Эти зоны покупатель выбирает при оформлении заказа.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Зона', type: 'text', required: true },
            { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0 },
            {
              name: 'priceNote',
              label: 'Подпись к цене',
              type: 'text',
              admin: { description: 'Если цена «по расчёту» — напишите тут' },
            },
          ],
        },
        { name: 'description', label: 'Пояснение', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'freeFrom', label: 'Бесплатная доставка от, ₽', type: 'number', admin: { description: 'Пусто — не действует' } },
        { name: 'pickupEnabled', label: 'Можно самовывоз', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'intervals',
      label: 'Интервалы доставки',
      type: 'array',
      labels: { singular: 'Интервал', plural: 'Интервалы' },
      fields: [{ name: 'label', label: 'Интервал', type: 'text', required: true }],
    },
    {
      name: 'notes',
      label: 'Условия (карточки под таблицей)',
      type: 'array',
      labels: { singular: 'Условие', plural: 'Условия' },
      fields: [
        { name: 'title', label: 'Заголовок', type: 'text', required: true },
        { name: 'text', label: 'Текст', type: 'textarea' },
      ],
    },
    {
      name: 'payment',
      label: 'Способы оплаты (текст)',
      type: 'textarea',
      defaultValue:
        'После оформления заказа Ольга свяжется с вами, подтвердит состав и пришлёт ссылку на оплату по СБП или реквизиты для перевода.',
    },
  ],
}
