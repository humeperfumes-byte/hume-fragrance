ALTER TABLE "coupons"
ADD COLUMN IF NOT EXISTS "welcome_back_mode" varchar(30) NOT NULL DEFAULT 'cap_5';

UPDATE "coupons"
SET "welcome_back_mode" = 'cap_5'
WHERE "welcome_back_mode" IS NULL;
