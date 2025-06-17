-- Add winner_count column to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS winner_count INTEGER DEFAULT 1;

-- Update existing contests to have 1 winner by default
UPDATE contests 
SET winner_count = 1 
WHERE winner_count IS NULL;
