-- Add submissions_stopped column to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS submissions_stopped BOOLEAN DEFAULT FALSE;

-- Update existing contests to have submissions_stopped as false by default
UPDATE contests 
SET submissions_stopped = FALSE 
WHERE submissions_stopped IS NULL;
