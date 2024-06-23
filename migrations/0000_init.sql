DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(63) NOT NULL,
	"name" varchar(31) NOT NULL,
	"password" char(60) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"role" "user_role",
	CONSTRAINT "unique_users__email" UNIQUE("email"),
	CONSTRAINT "unique_users__name" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(127) NOT NULL,
	"author" varchar(63) NOT NULL,
	"publication_date" date DEFAULT now() NOT NULL,
	"genres" varchar(31)[] DEFAULT '{}'::varchar(31)[] NOT NULL
);
