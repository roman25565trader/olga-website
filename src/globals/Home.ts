import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../lib/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Главная страница',
  admin: { group: 'Страницы сайта' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Первый экран',
          fields: [
            { name: 'heroKicker', label: 'Надпись над заголовком', type: 'text', defaultValue: 'Цветочный салон · Магнитогорск' },
            {
              name: 'heroTitle',
              label: 'Заголовок',
              type: 'text',
              defaultValue: 'Цветы с *душой*',
              admin: { description: 'Слово в *звёздочках* будет курсивом' },
            },
            { name: 'heroText', label: 'Текст', type: 'textarea' },
            {
              name: 'heroVideo',
              label: 'Видео-обращение',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Короткое видео 15–20 сек, вертикальное или горизонтальное, mp4. Звук включается по кнопке.' },
            },
            {
              name: 'heroImage',
              label: 'Обложка видео / фото первого экрана',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Показывается, пока видео загружается, или вместо видео' },
            },
            { name: 'chatButton', label: 'Кнопка чата', type: 'text', defaultValue: 'Написать флористу' },
            { name: 'catalogButton', label: 'Вторая кнопка', type: 'text', defaultValue: 'Смотреть букеты' },
          ],
        },
        {
          label: 'Каталог',
          fields: [
            { name: 'bouquetsTitle', label: 'Заголовок блока «Букеты»', type: 'text', defaultValue: 'Букеты' },
            { name: 'bouquetsText', label: 'Текст блока «Букеты»', type: 'text' },
            { name: 'compositionsTitle', label: 'Заголовок блока «Композиции»', type: 'text', defaultValue: 'Композиции' },
            { name: 'compositionsText', label: 'Текст блока «Композиции»', type: 'text' },
            { name: 'showFeatured', label: 'Показывать «Популярное»', type: 'checkbox', defaultValue: true },
            { name: 'featuredTitle', label: 'Заголовок «Популярное»', type: 'text', defaultValue: 'Любимые *букеты*' },
          ],
        },
        {
          label: 'Конструктор',
          fields: [
            { name: 'showBuilder', label: 'Показывать блок конструктора', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          label: 'Как мы работаем',
          fields: [
            { name: 'showSteps', label: 'Показывать блок', type: 'checkbox', defaultValue: true },
            { name: 'stepsTitle', label: 'Заголовок', type: 'text', defaultValue: 'Как мы *работаем*' },
            {
              name: 'steps',
              label: 'Шаги',
              type: 'array',
              labels: { singular: 'Шаг', plural: 'Шаги' },
              maxRows: 6,
              fields: [
                { name: 'title', label: 'Заголовок', type: 'text', required: true },
                { name: 'text', label: 'Текст', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'О флористе',
          fields: [
            { name: 'showAbout', label: 'Показывать блок', type: 'checkbox', defaultValue: true },
            { name: 'aboutTitle', label: 'Заголовок', type: 'text', defaultValue: 'Ольга, *16 лет* во флористике' },
            { name: 'aboutText', label: 'Текст', type: 'textarea' },
            { name: 'aboutImage', label: 'Фото', type: 'upload', relationTo: 'media' },
            {
              name: 'stats',
              label: 'Цифры',
              type: 'array',
              labels: { singular: 'Цифра', plural: 'Цифры' },
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', label: 'Значение', type: 'text', required: true },
                    { name: 'label', label: 'Подпись', type: 'text' },
                    { name: 'link', label: 'Ссылка', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Вопросы',
          fields: [
            { name: 'showFaq', label: 'Показывать блок', type: 'checkbox', defaultValue: true },
            {
              name: 'faq',
              label: 'Вопросы и ответы',
              type: 'array',
              labels: { singular: 'Вопрос', plural: 'Вопросы' },
              fields: [
                { name: 'q', label: 'Вопрос', type: 'text', required: true },
                { name: 'a', label: 'Ответ', type: 'textarea', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
