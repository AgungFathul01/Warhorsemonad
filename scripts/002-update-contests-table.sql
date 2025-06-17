-- Add new columns to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS contest_type VARCHAR(20) DEFAULT 'duration',
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS manually_stopped BOOLEAN DEFAULT FALSE;

-- Remove NOT NULL constraint from duration_hours since we're using duration_minutes now
ALTER TABLE contests 
ALTER COLUMN duration_hours DROP NOT NULL;

-- Update existing contests to use minutes instead of hours
UPDATE contests 
SET duration_minutes = duration_hours * 60 
WHERE duration_minutes IS NULL AND duration_hours IS NOT NULL;
