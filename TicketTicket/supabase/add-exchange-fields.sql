-- Add exchange-related fields to listings table for V9 ticket exchange feature
-- Run this migration to add support for ticket exchange listings

-- Add exchange event name (the event user wants to exchange for)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS exchange_event_name VARCHAR(255);

-- Add exchange seat grade (the seat grade user wants, or 'any')
ALTER TABLE listings ADD COLUMN IF NOT EXISTS exchange_seat_grade VARCHAR(50);

-- Add subsidy amount (max half of original ticket price)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subsidy_amount INTEGER DEFAULT 0;

-- Add subsidy direction ('i_pay_you' or 'you_pay_me')
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subsidy_direction VARCHAR(20);

-- Update ticket_type column comment to include new type
COMMENT ON COLUMN listings.ticket_type IS 'Ticket type: find_companion, main_ticket_transfer, sub_ticket_transfer, ticket_exchange';

-- Update seat_grade column to allow any string (not just B/A/S/SS)
-- Already VARCHAR(10), but let's expand it for custom grades
ALTER TABLE listings ALTER COLUMN seat_grade TYPE VARCHAR(50);

-- Add index for ticket_type to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_listings_ticket_type ON listings(ticket_type);
