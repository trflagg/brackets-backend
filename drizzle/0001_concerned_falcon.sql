CREATE TABLE IF NOT EXISTS "entrant" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"seed" integer NOT NULL,
	"bracket" integer NOT NULL,
	CONSTRAINT "seed_per_bracket" UNIQUE("seed","bracket")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entrant" ADD CONSTRAINT "entrant_bracket_bracket_id_fk" FOREIGN KEY ("bracket") REFERENCES "public"."bracket"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
