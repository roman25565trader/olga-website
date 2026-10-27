import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" ALTER COLUMN "hero_kicker" SET DEFAULT 'Цветочный салон · Магнитогорск';
  ALTER TABLE "builder" ALTER COLUMN "title" DROP DEFAULT;
  ALTER TABLE "builder" ALTER COLUMN "text" SET DEFAULT 'Здесь вы можете собрать свой букет из предложенных цветов';
  ALTER TABLE "settings" ALTER COLUMN "site_name" SET DEFAULT 'Клумба';
  ALTER TABLE "settings" ALTER COLUMN "tagline" SET DEFAULT 'цветочный салон';`)

  // Правки Ольги: название «Клумба», без лишних подзаголовков в каталоге, новый текст конструктора.
  // Меняем только стартовые тексты — то, что уже поправили в админке, не трогаем.
  await db.execute(sql`
   UPDATE "settings" SET "site_name" = 'Клумба' WHERE "site_name" = 'Olga. Цветы';
  UPDATE "settings" SET "tagline" = 'цветочный салон' WHERE "tagline" = 'цветочный магазин';
  UPDATE "home" SET "hero_kicker" = 'Цветочный салон · Магнитогорск' WHERE "hero_kicker" = 'Цветочный магазин · Магнитогорск';
  UPDATE "home" SET "about_text" = replace("about_text", 'Девиз магазина', 'Девиз салона');
  UPDATE "home" SET "bouquets_text" = NULL WHERE "bouquets_text" = 'Моно, авторские, с оформлением или только с лентой.';
  UPDATE "home" SET "compositions_text" = NULL WHERE "compositions_text" = 'Моно и авторские, в сумочках и в коробочках — стоят без вазы.';
  UPDATE "builder" SET "title" = NULL WHERE "title" = 'Конструктор *вашего* букета';
  UPDATE "builder" SET "text" = 'Здесь вы можете собрать свой букет из предложенных цветов' WHERE "text" LIKE 'Выберите цветы и количество — цена считается сразу.%';
  UPDATE "about" SET "lead" = replace("lead", 'Небольшой цветочный магазин', 'Небольшой цветочный салон');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" ALTER COLUMN "hero_kicker" SET DEFAULT 'Цветочный магазин · Магнитогорск';
  ALTER TABLE "builder" ALTER COLUMN "title" SET DEFAULT 'Конструктор *вашего* букета';
  ALTER TABLE "builder" ALTER COLUMN "text" SET DEFAULT 'Выберите цветы и количество — цена считается сразу. Соберём из сегодняшней поставки и пришлём фото до отправки.';
  ALTER TABLE "settings" ALTER COLUMN "site_name" SET DEFAULT 'Olga. Цветы';
  ALTER TABLE "settings" ALTER COLUMN "tagline" SET DEFAULT 'цветочный магазин';`)
}
