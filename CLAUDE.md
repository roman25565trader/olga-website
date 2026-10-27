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
