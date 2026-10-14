import React from 'react'

const box: React.CSSProperties = {
  padding: '20px 24px',
  marginBottom: 24,
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-50)',
}

export const Welcome = () => (
  <div style={box}>
    <h3 style={{ margin: '0 0 8px' }}>Здравствуйте! Это админка сайта 🌷</h3>
    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
      <li>
        <b>Заказы</b> и <b>Чат с флористом</b> — всё, что пришло с сайта. В чате пишите ответ в поле «Ваш ответ» и
        жмите «Сохранить».
      </li>
      <li>
        <b>Товары</b> — букеты и композиции. Галочка «В продаже» прячет/показывает товар.
      </li>
      <li>
        <b>Цветы для конструктора</b> — что есть сегодня и почём за стебель.
      </li>
      <li>
        <b>Главная страница</b>, <b>Доставка</b>, <b>О нас</b>, <b>Контакты и настройки</b> — все тексты, видео и
        телефоны сайта.
      </li>
      <li>
        Изменения появляются на сайте сразу после сохранения. Сайт: <a href="/" target="_blank">открыть</a>
      </li>
    </ul>
  </div>
)
