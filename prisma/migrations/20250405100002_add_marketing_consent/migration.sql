-- Add marketingConsent column to Studio table
ALTER TABLE "Studio" ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false; 