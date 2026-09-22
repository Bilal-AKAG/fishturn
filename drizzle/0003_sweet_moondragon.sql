CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
