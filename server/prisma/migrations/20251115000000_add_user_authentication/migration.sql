-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- Step 1: Create a default migration user for existing scans
-- This user will be assigned to all existing scans
INSERT INTO "User" ("id", "email", "password", "name", "createdAt", "updatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'migration@be4scan.local',
    '$2a$10$migration.user.password.hash.placeholder',
    'Migration User',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 2: Add userId column as nullable first
ALTER TABLE "Scan" ADD COLUMN "userId" TEXT;

-- Step 3: Assign all existing scans to the migration user
UPDATE "Scan" SET "userId" = '00000000-0000-0000-0000-000000000000' WHERE "userId" IS NULL;

-- Step 4: Make userId required (NOT NULL)
ALTER TABLE "Scan" ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Scan_userId_idx" ON "Scan"("userId");

