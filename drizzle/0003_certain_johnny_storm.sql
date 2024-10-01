DO $$ BEGIN
 CREATE TYPE "public"."bracketStatus" AS ENUM('not started', 'in progress', 'paused', 'complete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bracket" ADD COLUMN "status" "bracketStatus";