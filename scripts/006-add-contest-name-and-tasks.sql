-- Add contest_name column to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS contest_name VARCHAR(255) DEFAULT 'Monad Giveaway Contest';

-- Create tasks table for follow requirements
CREATE TABLE IF NOT EXISTS contest_tasks (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL, -- 'follow_twitter', 'follow_telegram', etc.
  task_description TEXT NOT NULL,
  task_url VARCHAR(500),
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_task_completions table to track completed tasks
CREATE TABLE IF NOT EXISTS user_task_completions (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  evm_address VARCHAR(42) NOT NULL,
  task_id INTEGER REFERENCES contest_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, evm_address, task_id)
);

-- Update existing contests to have a default name
UPDATE contests 
SET contest_name = 'Monad Giveaway Contest #' || id 
WHERE contest_name IS NULL OR contest_name = 'Monad Giveaway Contest';
