import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('new', 'accepted', 'assembled', 'delivering', 'done', 'canceled');
  CREATE TYPE "public"."enum_orders_source" AS ENUM('cart', 'builder');
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM('delivery', 'pickup');
  CREATE TYPE "public"."enum_chats_messages_from" AS ENUM('client', 'florist');
  CREATE TYPE "public"."enum_categories_section" AS ENUM('bukety', 'kompozicii');
  CREATE TYPE "public"."enum_flowers_unit" AS ENUM('stem', 'branch', 'pcs');
  CREATE TYPE "public"."enum_flowers_stock" AS ENUM('in', 'low', 'out');
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"variant" varchar,
  	"qty" numeric NOT NULL,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"status" "enum_orders_status" DEFAULT 'new',
  	"source" "enum_orders_source" DEFAULT 'cart',
  	"admin_note" varchar,
  	"customer_name" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"recipient_name" varchar,
  	"recipient_phone" varchar,
  	"packaging" varchar,
  	"items_total" numeric,
  	"delivery_price" numeric,
  	"total" numeric,
  	"delivery_method" "enum_orders_delivery_method",
  	"zone" varchar,
  	"address" varchar,
  	"delivery_date" varchar,
  	"delivery_time" varchar,
  	"card_text" varchar,
  	"comment" varchar,
  	"anonymous" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chats_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_chats_messages_from" NOT NULL,
  	"at" timestamp(3) with time zone,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "chats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"reply" varchar,
  	"name" varchar,
  	"phone" varchar,
  	"unread" boolean DEFAULT true,
  	"last_text" varchar,
  	"last_message_at" timestamp(3) with time zone,
  	"token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"old_price" numeric,
  	"short" varchar,
  	"description" varchar,
  	"composition" varchar,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"badge" varchar,
  	"sort_order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"section" "enum_categories_section" DEFAULT 'bukety' NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "flowers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"variety" varchar,
  	"price" numeric NOT NULL,
  	"unit" "enum_flowers_unit" DEFAULT 'stem',
  	"stock" "enum_flowers_stock" DEFAULT 'in',
  	"image_id" integer,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_xs_url" varchar,
  	"sizes_xs_width" numeric,
  	"sizes_xs_height" numeric,
  	"sizes_xs_mime_type" varchar,
  	"sizes_xs_filesize" numeric,
  	"sizes_xs_filename" varchar,
  	"sizes_sm_url" varchar,
  	"sizes_sm_width" numeric,
  	"sizes_sm_height" numeric,
  	"sizes_sm_mime_type" varchar,
  	"sizes_sm_filesize" numeric,
  	"sizes_sm_filename" varchar,
  	"sizes_md_url" varchar,
  	"sizes_md_width" numeric,
  	"sizes_md_height" numeric,
  	"sizes_md_mime_type" varchar,
  	"sizes_md_filesize" numeric,
  	"sizes_md_filename" varchar,
  	"sizes_lg_url" varchar,
  	"sizes_lg_width" numeric,
  	"sizes_lg_height" numeric,
  	"sizes_lg_mime_type" varchar,
  	"sizes_lg_filesize" numeric,
  	"sizes_lg_filename" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb,
  	"slug" varchar,
  	"in_footer" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"orders_id" integer,
  	"chats_id" integer,
  	"products_id" integer,
  	"categories_id" integer,
  	"flowers_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "home_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_kicker" varchar DEFAULT 'Цветочный магазин · Магнитогорск',
  	"hero_title" varchar DEFAULT 'Цветы с *душой*',
  	"hero_text" varchar,
  	"hero_video_id" integer,
  	"hero_image_id" integer,
  	"chat_button" varchar DEFAULT 'Написать флористу',
  	"catalog_button" varchar DEFAULT 'Смотреть букеты',
  	"bouquets_title" varchar DEFAULT 'Букеты',
  	"bouquets_text" varchar,
  	"compositions_title" varchar DEFAULT 'Композиции',
  	"compositions_text" varchar,
  	"show_featured" boolean DEFAULT true,
  	"featured_title" varchar DEFAULT 'Любимые *букеты*',
  	"show_builder" boolean DEFAULT true,
  	"show_steps" boolean DEFAULT true,
  	"steps_title" varchar DEFAULT 'Как мы *работаем*',
  	"show_about" boolean DEFAULT true,
  	"about_title" varchar DEFAULT 'Ольга, *16 лет* во флористике',
  	"about_text" varchar,
  	"about_image_id" integer,
  	"show_faq" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "builder_packaging" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric DEFAULT 0 NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "builder" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Конструктор *вашего* букета',
  	"text" varchar DEFAULT 'Выберите цветы и количество — цена считается сразу. Соберём из сегодняшней поставки и пришлём фото до отправки.',
  	"min_stems" numeric DEFAULT 3,
  	"note" varchar DEFAULT 'Лента в подарок. Подскажем, если число стеблей лучше сделать нечётным.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "delivery_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"price_note" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "delivery_intervals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "delivery_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "delivery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Доставка и *оплата*',
  	"intro" varchar,
  	"free_from" numeric,
  	"pickup_enabled" boolean DEFAULT true,
  	"payment" varchar DEFAULT 'После оформления заказа Ольга свяжется с вами, подтвердит состав и пришлёт ссылку на оплату по СБП или реквизиты для перевода.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'О *нас*',
  	"lead" varchar,
  	"image_id" integer,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "settings_top_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Olga. Цветы' NOT NULL,
  	"tagline" varchar DEFAULT 'цветочный магазин',
  	"logo_id" integer,
  	"city" varchar DEFAULT 'Магнитогорск',
  	"phone" varchar DEFAULT '8 (982) 322-84-85',
  	"whatsapp" varchar,
  	"instagram" varchar,
  	"telegram" varchar,
  	"vk" varchar,
  	"max" varchar,
  	"instagram_note" varchar DEFAULT 'Посмотрите наши работы',
  	"address" varchar DEFAULT 'пр. Карла Маркса, 121',
  	"map_link" varchar,
  	"hours" varchar DEFAULT 'Ежедневно 10:00–21:00',
  	"chat_enabled" boolean DEFAULT true,
  	"chat_greeting" varchar DEFAULT 'Здравствуйте! Я Ольга, флорист. Напишите, какой букет хотите, — повод, бюджет, любимые цвета. Отвечу в течение 15 минут.',
  	"notify_telegram_bot_token" varchar,
  	"notify_telegram_chat_id" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"og_image_id" integer,
  	"yandex_metrika" varchar,
  	"legal" varchar DEFAULT 'ИП [ФИО] · ИНН [—]',
  	"seeded_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chats_messages" ADD CONSTRAINT "chats_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_sizes" ADD CONSTRAINT "products_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "flowers" ADD CONSTRAINT "flowers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chats_fk" FOREIGN KEY ("chats_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_flowers_fk" FOREIGN KEY ("flowers_id") REFERENCES "public"."flowers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_steps" ADD CONSTRAINT "home_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq" ADD CONSTRAINT "home_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_about_image_id_media_id_fk" FOREIGN KEY ("about_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "builder_packaging" ADD CONSTRAINT "builder_packaging_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."builder"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_intervals" ADD CONSTRAINT "delivery_intervals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_rels" ADD CONSTRAINT "about_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_rels" ADD CONSTRAINT "about_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_top_bar" ADD CONSTRAINT "settings_top_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "chats_messages_order_idx" ON "chats_messages" USING btree ("_order");
  CREATE INDEX "chats_messages_parent_id_idx" ON "chats_messages" USING btree ("_parent_id");
  CREATE INDEX "chats_token_idx" ON "chats" USING btree ("token");
  CREATE INDEX "chats_updated_at_idx" ON "chats" USING btree ("updated_at");
  CREATE INDEX "chats_created_at_idx" ON "chats" USING btree ("created_at");
  CREATE INDEX "products_sizes_order_idx" ON "products_sizes" USING btree ("_order");
  CREATE INDEX "products_sizes_parent_id_idx" ON "products_sizes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "flowers_image_idx" ON "flowers" USING btree ("image_id");
  CREATE INDEX "flowers_updated_at_idx" ON "flowers" USING btree ("updated_at");
  CREATE INDEX "flowers_created_at_idx" ON "flowers" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_xs_sizes_xs_filename_idx" ON "media" USING btree ("sizes_xs_filename");
  CREATE INDEX "media_sizes_sm_sizes_sm_filename_idx" ON "media" USING btree ("sizes_sm_filename");
  CREATE INDEX "media_sizes_md_sizes_md_filename_idx" ON "media" USING btree ("sizes_md_filename");
  CREATE INDEX "media_sizes_lg_sizes_lg_filename_idx" ON "media" USING btree ("sizes_lg_filename");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_chats_id_idx" ON "payload_locked_documents_rels" USING btree ("chats_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_flowers_id_idx" ON "payload_locked_documents_rels" USING btree ("flowers_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_steps_order_idx" ON "home_steps" USING btree ("_order");
  CREATE INDEX "home_steps_parent_id_idx" ON "home_steps" USING btree ("_parent_id");
  CREATE INDEX "home_stats_order_idx" ON "home_stats" USING btree ("_order");
  CREATE INDEX "home_stats_parent_id_idx" ON "home_stats" USING btree ("_parent_id");
  CREATE INDEX "home_faq_order_idx" ON "home_faq" USING btree ("_order");
  CREATE INDEX "home_faq_parent_id_idx" ON "home_faq" USING btree ("_parent_id");
  CREATE INDEX "home_hero_video_idx" ON "home" USING btree ("hero_video_id");
  CREATE INDEX "home_hero_image_idx" ON "home" USING btree ("hero_image_id");
  CREATE INDEX "home_about_image_idx" ON "home" USING btree ("about_image_id");
  CREATE INDEX "builder_packaging_order_idx" ON "builder_packaging" USING btree ("_order");
  CREATE INDEX "builder_packaging_parent_id_idx" ON "builder_packaging" USING btree ("_parent_id");
  CREATE INDEX "delivery_zones_order_idx" ON "delivery_zones" USING btree ("_order");
  CREATE INDEX "delivery_zones_parent_id_idx" ON "delivery_zones" USING btree ("_parent_id");
  CREATE INDEX "delivery_intervals_order_idx" ON "delivery_intervals" USING btree ("_order");
  CREATE INDEX "delivery_intervals_parent_id_idx" ON "delivery_intervals" USING btree ("_parent_id");
  CREATE INDEX "delivery_notes_order_idx" ON "delivery_notes" USING btree ("_order");
  CREATE INDEX "delivery_notes_parent_id_idx" ON "delivery_notes" USING btree ("_parent_id");
  CREATE INDEX "about_image_idx" ON "about" USING btree ("image_id");
  CREATE INDEX "about_rels_order_idx" ON "about_rels" USING btree ("order");
  CREATE INDEX "about_rels_parent_idx" ON "about_rels" USING btree ("parent_id");
  CREATE INDEX "about_rels_path_idx" ON "about_rels" USING btree ("path");
  CREATE INDEX "about_rels_media_id_idx" ON "about_rels" USING btree ("media_id");
  CREATE INDEX "settings_top_bar_order_idx" ON "settings_top_bar" USING btree ("_order");
  CREATE INDEX "settings_top_bar_parent_id_idx" ON "settings_top_bar" USING btree ("_parent_id");
  CREATE INDEX "settings_logo_idx" ON "settings" USING btree ("logo_id");
  CREATE INDEX "settings_og_image_idx" ON "settings" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "chats_messages" CASCADE;
  DROP TABLE "chats" CASCADE;
  DROP TABLE "products_sizes" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "flowers" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_steps" CASCADE;
  DROP TABLE "home_stats" CASCADE;
  DROP TABLE "home_faq" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "builder_packaging" CASCADE;
  DROP TABLE "builder" CASCADE;
  DROP TABLE "delivery_zones" CASCADE;
  DROP TABLE "delivery_intervals" CASCADE;
  DROP TABLE "delivery_notes" CASCADE;
  DROP TABLE "delivery" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_rels" CASCADE;
  DROP TABLE "settings_top_bar" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_source";
  DROP TYPE "public"."enum_orders_delivery_method";
  DROP TYPE "public"."enum_chats_messages_from";
  DROP TYPE "public"."enum_categories_section";
  DROP TYPE "public"."enum_flowers_unit";
  DROP TYPE "public"."enum_flowers_stock";`)
}
