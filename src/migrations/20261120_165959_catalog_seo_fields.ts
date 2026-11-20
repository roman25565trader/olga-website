import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_categories_section" ADD VALUE 'podarki';
  ALTER TYPE "public"."enum__categories_v_version_section" ADD VALUE 'podarki';
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "width" numeric;
  ALTER TABLE "products" ADD COLUMN "height" numeric;
  ALTER TABLE "products" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "products" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "products" ADD COLUMN "flowwow_id" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_width" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_height" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_flowwow_id" numeric;
  ALTER TABLE "categories" ADD COLUMN "seo_text" varchar;
  ALTER TABLE "categories" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "categories" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "_categories_v" ADD COLUMN "version_seo_text" varchar;
  ALTER TABLE "_categories_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_categories_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "settings" ADD COLUMN "flowwow" varchar DEFAULT 'https://flowwow.com/shop/klumbaf-8650/';
  ALTER TABLE "_settings_v" ADD COLUMN "version_flowwow" varchar DEFAULT 'https://flowwow.com/shop/klumbaf-8650/';
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_flowwow_id_idx" ON "products" USING btree ("flowwow_id");
  CREATE INDEX "_products_v_version_version_flowwow_id_idx" ON "_products_v" USING btree ("version_flowwow_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  ALTER TABLE "categories" ALTER COLUMN "section" SET DATA TYPE text;
  ALTER TABLE "categories" ALTER COLUMN "section" SET DEFAULT 'bukety'::text;
  DROP TYPE "public"."enum_categories_section";
  CREATE TYPE "public"."enum_categories_section" AS ENUM('bukety', 'kompozicii');
  ALTER TABLE "categories" ALTER COLUMN "section" SET DEFAULT 'bukety'::"public"."enum_categories_section";
  ALTER TABLE "categories" ALTER COLUMN "section" SET DATA TYPE "public"."enum_categories_section" USING "section"::"public"."enum_categories_section";
  ALTER TABLE "_categories_v" ALTER COLUMN "version_section" SET DATA TYPE text;
  ALTER TABLE "_categories_v" ALTER COLUMN "version_section" SET DEFAULT 'bukety'::text;
  DROP TYPE "public"."enum__categories_v_version_section";
  CREATE TYPE "public"."enum__categories_v_version_section" AS ENUM('bukety', 'kompozicii');
  ALTER TABLE "_categories_v" ALTER COLUMN "version_section" SET DEFAULT 'bukety'::"public"."enum__categories_v_version_section";
  ALTER TABLE "_categories_v" ALTER COLUMN "version_section" SET DATA TYPE "public"."enum__categories_v_version_section" USING "version_section"::"public"."enum__categories_v_version_section";
  DROP INDEX "products_flowwow_id_idx";
  DROP INDEX "_products_v_version_version_flowwow_id_idx";
  ALTER TABLE "products" DROP COLUMN "width";
  ALTER TABLE "products" DROP COLUMN "height";
  ALTER TABLE "products" DROP COLUMN "seo_title";
  ALTER TABLE "products" DROP COLUMN "seo_description";
  ALTER TABLE "products" DROP COLUMN "flowwow_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_width";
  ALTER TABLE "_products_v" DROP COLUMN "version_height";
  ALTER TABLE "_products_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_flowwow_id";
  ALTER TABLE "categories" DROP COLUMN "seo_text";
  ALTER TABLE "categories" DROP COLUMN "seo_title";
  ALTER TABLE "categories" DROP COLUMN "seo_description";
  ALTER TABLE "_categories_v" DROP COLUMN "version_seo_text";
  ALTER TABLE "_categories_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_categories_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "settings" DROP COLUMN "flowwow";
  ALTER TABLE "_settings_v" DROP COLUMN "version_flowwow";`)
}
