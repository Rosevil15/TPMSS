-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING USERS TABLE
-- This adds the custom columns without dropping the table
-- =====================================================

-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username TEXT;
  END IF;
END $$;

-- Add userfirstName column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'userfirstName'
  ) THEN
    ALTER TABLE users ADD COLUMN "userfirstName" TEXT;
  END IF;
END $$;

-- Add userlastName column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'userlastName'
  ) THEN
    ALTER TABLE users ADD COLUMN "userlastName" TEXT;
  END IF;
END $$;

-- Add password column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password TEXT;
  END IF;
END $$;

-- Rename id to userid if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'userid'
  ) THEN
    ALTER TABLE users RENAME COLUMN id TO userid;
  END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- DONE! Now try registering again
-- =====================================================
