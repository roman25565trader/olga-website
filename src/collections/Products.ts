import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn, loggedIn } from '../lib/access'
import { revalidateAfterChange, revalidateAfterDelete } from '../lib/revalidate'
import { slugField } from '../fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товары' },
  defaultSort: 'sortOrder',
  admin: {
    group: 'Каталог',
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'categories', 'active', 'featured'],
    listSearchableFields: ['title'],
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    {
      name: 'images',
      label: 'Фото',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Первое фото — главное. Лучше вертикальные, 4:5.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0 },
        {
          name: 'oldPrice',
          label: 'Старая цена, ₽',
          type: 'number',
          min: 0,
          admin: { description: 'Если есть скидка — покажем зачёркнутой' },
        },
      ],
    },
    {
      name: 'short',
      label: 'Коротко под названием',
      type: 'text',
      admin: { description: 'Например: «15 роз 60 см · Ø 40 см»' },
    },
    { name: 'description', label: 'Описание', type: 'textarea' },
    { name: 'composition', label: 'Состав', type: 'textarea' },
    {
      name: 'sizes',
      label: 'Размеры (если есть)',
      type: 'array',
      labels: { singular: 'Размер', plural: 'Размеры' },
      admin: { description: 'Например S / M / L со своей ценой. Если пусто — одна цена.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Размер', type: 'text', required: true },
            { name: 'note', label: 'Пояснение', type: 'text' },
            { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0 },
          ],
        },
      ],
    },
    {
      name: 'categories',
      label: 'Разделы',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    slugField(),
    {
      name: 'active',
      label: 'В продаже',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Выключите — товар пропадёт с сайта' },
    },
    {
      name: 'featured',
      label: 'Показать на главной',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      label: 'Метка на фото',
      type: 'text',
      admin: { position: 'sidebar', description: 'Например: «Хит», «Можно сегодня»' },
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
