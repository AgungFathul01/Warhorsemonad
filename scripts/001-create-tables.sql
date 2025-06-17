-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
  id SERIAL PRIMARY KEY,
  monad_amount DECIMAL(18, 8) NOT NULL,
  duration_hours INTEGER NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id),
  evm_address VARCHAR(42) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, evm_address)
);

-- Create winners table
CREATE TABLE IF NOT EXISTS winners (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id),
  evm_address VARCHAR(42) NOT NULL,
  monad_amount DECIMAL(18, 8) NOT NULL,
  won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial contest if none exists
INSERT INTO contests (monad_amount, duration_hours, end_time, status)
SELECT 100.0, 24, CURRENT_TIMESTAMP + INTERVAL '24 hours', 'active'
WHERE NOT EXISTS (SELECT 1 FROM contests WHERE status = 'active');
