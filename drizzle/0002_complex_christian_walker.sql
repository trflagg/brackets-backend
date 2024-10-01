DO $$ BEGIN
 CREATE TYPE "public"."winningSide" AS ENUM('top', 'bottom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"bracket" integer NOT NULL,
	"topEntrant" integer,
	"bottomEntrant" integer,
	"topScore" integer,
	"bottomScore" integer,
	"winner" "winningSide"
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match" ADD CONSTRAINT "match_bracket_bracket_id_fk" FOREIGN KEY ("bracket") REFERENCES "public"."bracket"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match" ADD CONSTRAINT "match_topEntrant_entrant_id_fk" FOREIGN KEY ("topEntrant") REFERENCES "public"."entrant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match" ADD CONSTRAINT "match_bottomEntrant_entrant_id_fk" FOREIGN KEY ("bottomEntrant") REFERENCES "public"."entrant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
