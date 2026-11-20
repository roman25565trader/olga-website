# Заметки для Claude

## Публикация

- Живой сайт: https://olga-website-beryl.vercel.app (Vercel, проект `olga-website`, команда `kwork1`).
- Vercel собирает сайт из репозитория `roman25565trader/olga-website`, ветка `main`.
  Репозиторий `olga-cveti` — рабочая копия того же кода.
- Владелец разрешил: после каждой правки сразу публиковать её на сайт — пушить в `olga-website` → `main`
  без отдельного вопроса. После пуша проверить, что деплой в Vercel прошёл (READY).
- Проект `olga-website223231` в Vercel — лишний дубль без базы, его сборки всегда падают.

## Тексты в базе

Почти все тексты сайта хранятся в базе (Payload), а не в коде. Поменять текст на живом сайте —
это миграция в `src/migrations` (`npm run migrate:create -- <имя>`) с `UPDATE`, которая
меняет значение, только если оно ещё стартовое. Плюс поправить `src/seed/index.ts` и `defaultValue` в
`src/globals`.

`migrate:create` и `generate:types` запускать с любым непустым `BLOB_READ_WRITE_TOKEN`, иначе
плагин хранилища выключен и генератор удаляет колонку `media._objectkey`.

## Каталог и SEO

- Каталог перенесён с Flowwow (https://flowwow.com/shop/klumbaf-8650/) 20.11.2026: данные в `src/catalog/flowwow.ts`,
  фото в `src/catalog/images`. В базу их один раз грузит миграция `20261120_170100_flowwow_catalog`
  (товары узнаёт по `flowwowId`, демо-букеты из макета только прячет). Дальше товары правятся в админке.
- Разделы: `bukety`, `kompozicii`, `podarki` (`src/lib/sections.ts` + `SECTIONS` в `Categories.ts`).
- SEO и разметка schema.org — `src/lib/seo.ts`; у товаров и разделов есть группа полей «Для Яндекса и Google»,
  пустая — заголовок и описание собираются сами.
- Для ИИ-помощников и поисковиков: `/llms.txt`, `/llms-full.txt`, фид товаров `/yml.xml` (Яндекс), `/sitemap.xml` с фото,
  `robots.txt` открыт для ИИ-ботов.
- На Windows путь к проекту бывает слишком длинным для `npm ci` (esbuild) — работать через `subst`.
