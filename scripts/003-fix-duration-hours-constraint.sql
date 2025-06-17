-- Remove NOT NULL constraint from duration_hours since we're using duration_minutes now
ALTER TABLE contests 
ALTER COLUMN duration_hours DROP NOT NULL;

-- Set default value for duration_hours to avoid constraint issues
ALTER TABLE contests 
ALTER COLUMN duration_hours SET DEFAULT NULL;

-- Update any existing records that might have NULL duration_hours
UPDATE contests 
SET duration_hours = CEIL(duration_minutes::float / 60) 
WHERE duration_hours IS NULL AND duration_minutes IS NOT NULL;
