import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__categories_v_version_section" AS ENUM('bukety', 'kompozicii');
  CREATE TYPE "public"."enum__flowers_v_version_unit" AS ENUM('stem', 'branch', 'pcs');
  CREATE TYPE "public"."enum__flowers_v_version_stock" AS ENUM('in', 'low', 'out');
  CREATE TABLE "_products_v_version_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar,
  	"price" numeric NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_price" numeric NOT NULL,
  	"version_old_price" numeric,
  	"version_short" varchar,
  	"version_description" varchar,
  	"version_composition" varchar,
  	"version_slug" varchar,
  	"version_active" boolean DEFAULT true,
  	"version_featured" boolean DEFAULT false,
  	"version_badge" varchar,
  	"version_sort_order" numeric DEFAULT 10,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_section" "enum__categories_v_version_section" DEFAULT 'bukety' NOT NULL,
  	"version_image_id" integer,
  	"version_description" varchar,
  	"version_slug" varchar,
  	"version_active" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 10,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_flowers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_variety" varchar,
  	"version_price" numeric NOT NULL,
  	"version_unit" "enum__flowers_v_version_unit" DEFAULT 'stem',
  	"version_stock" "enum__flowers_v_version_stock" DEFAULT 'in',
  	"version_image_id" integer,
  	"version_active" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 10,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_content" jsonb,
  	"version_slug" varchar,
  	"version_in_footer" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_home_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_kicker" varchar DEFAULT 'Цветочный салон · Магнитогорск',
  	"version_hero_title" varchar DEFAULT 'Цветы с *душой*',
  	"version_hero_text" varchar,
  	"version_hero_video_id" integer,
  	"version_hero_image_id" integer,
  	"version_chat_button" varchar DEFAULT 'Написать флористу',
  	"version_catalog_button" varchar DEFAULT 'Смотреть букеты',
  	"version_bouquets_title" varchar DEFAULT 'Букеты',
  	"version_bouquets_text" varchar,
  	"version_compositions_title" varchar DEFAULT 'Композиции',
  	"version_compositions_text" varchar,
  	"version_show_featured" boolean DEFAULT true,
  	"version_featured_title" varchar DEFAULT 'Любимые *букеты*',
  	"version_show_builder" boolean DEFAULT true,
  	"version_show_steps" boolean DEFAULT true,
  	"version_steps_title" varchar DEFAULT 'Как мы *работаем*',
  	"version_show_about" boolean DEFAULT true,
  	"version_about_title" varchar DEFAULT 'Ольга, *16 лет* во флористике',
  	"version_about_text" varchar,
  	"version_about_image_id" integer,
  	"version_show_faq" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_builder_v_version_packaging" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric DEFAULT 0 NOT NULL,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_builder_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_text" varchar DEFAULT 'Здесь вы можете собрать свой букет из предложенных цветов',
  	"version_min_stems" numeric DEFAULT 3,
  	"version_note" varchar DEFAULT 'Лента в подарок. Подскажем, если число стеблей лучше сделать нечётным.',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_delivery_v_version_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"price_note" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_delivery_v_version_intervals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_delivery_v_version_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_delivery_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Доставка и *оплата*',
  	"version_intro" varchar,
  	"version_free_from" numeric,
  	"version_pickup_enabled" boolean DEFAULT true,
  	"version_payment" varchar DEFAULT 'После оформления заказа Ольга свяжется с вами, подтвердит состав и пришлёт ссылку на оплату по СБП или реквизиты для перевода.',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'О *нас*',
  	"version_lead" varchar,
  	"version_image_id" integer,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_about_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_settings_v_version_top_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'Клумба' NOT NULL,
  	"version_tagline" varchar DEFAULT 'цветочный салон',
  	"version_logo_id" integer,
  	"version_city" varchar DEFAULT 'Магнитогорск',
  	"version_phone" varchar DEFAULT '8 (982) 322-84-85',
  	"version_whatsapp" varchar,
  	"version_instagram" varchar,
  	"version_telegram" varchar,
  	"version_vk" varchar,
  	"version_max" varchar,
  	"version_instagram_note" varchar DEFAULT 'Посмотрите наши работы',
  	"version_address" varchar DEFAULT 'пр. Карла Маркса, 121',
  	"version_map_link" varchar,
  	"version_hours" varchar DEFAULT 'Ежедневно 10:00–21:00',
  	"version_chat_enabled" boolean DEFAULT true,
  	"version_chat_greeting" varchar DEFAULT 'Здравствуйте! Я Ольга, флорист. Напишите, какой букет хотите, — повод, бюджет, любимые цвета. Отвечу в течение 15 минут.',
  	"version_notify_telegram_bot_token" varchar,
  	"version_notify_telegram_chat_id" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_og_image_id" integer,
  	"version_yandex_metrika" varchar,
  	"version_legal" varchar DEFAULT 'ИП [ФИО] · ИНН [—]',
  	"version_seeded_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "_products_v_version_sizes" ADD CONSTRAINT "_products_v_version_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_flowers_v" ADD CONSTRAINT "_flowers_v_parent_id_flowers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."flowers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_flowers_v" ADD CONSTRAINT "_flowers_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_steps" ADD CONSTRAINT "_home_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_stats" ADD CONSTRAINT "_home_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_faq" ADD CONSTRAINT "_home_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_about_image_id_media_id_fk" FOREIGN KEY ("version_about_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_builder_v_version_packaging" ADD CONSTRAINT "_builder_v_version_packaging_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_builder_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_delivery_v_version_zones" ADD CONSTRAINT "_delivery_v_version_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_delivery_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_delivery_v_version_intervals" ADD CONSTRAINT "_delivery_v_version_intervals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_delivery_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_delivery_v_version_notes" ADD CONSTRAINT "_delivery_v_version_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_delivery_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_rels" ADD CONSTRAINT "_about_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_rels" ADD CONSTRAINT "_about_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_top_bar" ADD CONSTRAINT "_settings_v_version_top_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v" ADD CONSTRAINT "_settings_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_settings_v" ADD CONSTRAINT "_settings_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_products_v_version_sizes_order_idx" ON "_products_v_version_sizes" USING btree ("_order");
  CREATE INDEX "_products_v_version_sizes_parent_id_idx" ON "_products_v_version_sizes" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_image_idx" ON "_categories_v" USING btree ("version_image_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_flowers_v_parent_idx" ON "_flowers_v" USING btree ("parent_id");
  CREATE INDEX "_flowers_v_version_version_image_idx" ON "_flowers_v" USING btree ("version_image_id");
  CREATE INDEX "_flowers_v_version_version_updated_at_idx" ON "_flowers_v" USING btree ("version_updated_at");
  CREATE INDEX "_flowers_v_version_version_created_at_idx" ON "_flowers_v" USING btree ("version_created_at");
  CREATE INDEX "_flowers_v_created_at_idx" ON "_flowers_v" USING btree ("created_at");
  CREATE INDEX "_flowers_v_updated_at_idx" ON "_flowers_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_version_steps_order_idx" ON "_home_v_version_steps" USING btree ("_order");
  CREATE INDEX "_home_v_version_steps_parent_id_idx" ON "_home_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_stats_order_idx" ON "_home_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_v_version_stats_parent_id_idx" ON "_home_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_faq_order_idx" ON "_home_v_version_faq" USING btree ("_order");
  CREATE INDEX "_home_v_version_faq_parent_id_idx" ON "_home_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_version_hero_video_idx" ON "_home_v" USING btree ("version_hero_video_id");
  CREATE INDEX "_home_v_version_version_hero_image_idx" ON "_home_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_home_v_version_version_about_image_idx" ON "_home_v" USING btree ("version_about_image_id");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_builder_v_version_packaging_order_idx" ON "_builder_v_version_packaging" USING btree ("_order");
  CREATE INDEX "_builder_v_version_packaging_parent_id_idx" ON "_builder_v_version_packaging" USING btree ("_parent_id");
  CREATE INDEX "_builder_v_created_at_idx" ON "_builder_v" USING btree ("created_at");
  CREATE INDEX "_builder_v_updated_at_idx" ON "_builder_v" USING btree ("updated_at");
  CREATE INDEX "_delivery_v_version_zones_order_idx" ON "_delivery_v_version_zones" USING btree ("_order");
  CREATE INDEX "_delivery_v_version_zones_parent_id_idx" ON "_delivery_v_version_zones" USING btree ("_parent_id");
  CREATE INDEX "_delivery_v_version_intervals_order_idx" ON "_delivery_v_version_intervals" USING btree ("_order");
  CREATE INDEX "_delivery_v_version_intervals_parent_id_idx" ON "_delivery_v_version_intervals" USING btree ("_parent_id");
  CREATE INDEX "_delivery_v_version_notes_order_idx" ON "_delivery_v_version_notes" USING btree ("_order");
  CREATE INDEX "_delivery_v_version_notes_parent_id_idx" ON "_delivery_v_version_notes" USING btree ("_parent_id");
  CREATE INDEX "_delivery_v_created_at_idx" ON "_delivery_v" USING btree ("created_at");
  CREATE INDEX "_delivery_v_updated_at_idx" ON "_delivery_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_version_version_image_idx" ON "_about_v" USING btree ("version_image_id");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_rels_order_idx" ON "_about_v_rels" USING btree ("order");
  CREATE INDEX "_about_v_rels_parent_idx" ON "_about_v_rels" USING btree ("parent_id");
  CREATE INDEX "_about_v_rels_path_idx" ON "_about_v_rels" USING btree ("path");
  CREATE INDEX "_about_v_rels_media_id_idx" ON "_about_v_rels" USING btree ("media_id");
  CREATE INDEX "_settings_v_version_top_bar_order_idx" ON "_settings_v_version_top_bar" USING btree ("_order");
  CREATE INDEX "_settings_v_version_top_bar_parent_id_idx" ON "_settings_v_version_top_bar" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_version_logo_idx" ON "_settings_v" USING btree ("version_logo_id");
  CREATE INDEX "_settings_v_version_version_og_image_idx" ON "_settings_v" USING btree ("version_og_image_id");
  CREATE INDEX "_settings_v_created_at_idx" ON "_settings_v" USING btree ("created_at");
  CREATE INDEX "_settings_v_updated_at_idx" ON "_settings_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_products_v_version_sizes" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_flowers_v" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_home_v_version_steps" CASCADE;
  DROP TABLE "_home_v_version_stats" CASCADE;
  DROP TABLE "_home_v_version_faq" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_builder_v_version_packaging" CASCADE;
  DROP TABLE "_builder_v" CASCADE;
  DROP TABLE "_delivery_v_version_zones" CASCADE;
  DROP TABLE "_delivery_v_version_intervals" CASCADE;
  DROP TABLE "_delivery_v_version_notes" CASCADE;
  DROP TABLE "_delivery_v" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "_about_v_rels" CASCADE;
  DROP TABLE "_settings_v_version_top_bar" CASCADE;
  DROP TABLE "_settings_v" CASCADE;
  DROP TYPE "public"."enum__categories_v_version_section";
  DROP TYPE "public"."enum__flowers_v_version_unit";
  DROP TYPE "public"."enum__flowers_v_version_stock";`)
}
