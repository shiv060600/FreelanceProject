-- Remove pending status - convert all pending invoices to draft
-- This simplifies the invoice workflow to just Draft and Paid

-- Convert any existing "pending" invoices to "draft"
UPDATE public.invoices 
SET status = 'draft' 
WHERE status = 'pending';

-- Update the lifetime earnings triggers to only handle draft->paid and paid->draft transitions
CREATE OR REPLACE FUNCTION update_lifetime_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoice is being marked as paid (from draft to paid)
  IF NEW.status = 'paid' AND OLD.status = 'draft' THEN
    UPDATE public.users 
    SET 
      lifetime_earnings = COALESCE(lifetime_earnings, 0) + NEW.total,
      total_paid_invoices = COALESCE(total_paid_invoices, 0) + 1
    WHERE user_id = NEW.user_id;
  
  -- If invoice is being unmarked as paid (from paid to draft)
  -- This means the payment was reversed/cancelled, so we should subtract
  ELSIF OLD.status = 'paid' AND NEW.status = 'draft' THEN
    UPDATE public.users 
    SET 
      lifetime_earnings = COALESCE(lifetime_earnings, 0) - OLD.total,
      total_paid_invoices = COALESCE(total_paid_invoices, 0) - 1
    WHERE user_id = OLD.user_id;
  
  -- If a paid invoice amount is being updated (still paid, just different amount)
  ELSIF NEW.status = 'paid' AND OLD.status = 'paid' AND NEW.total != OLD.total THEN
    UPDATE public.users 
    SET lifetime_earnings = (COALESCE(lifetime_earnings, 0) - OLD.total) + NEW.total
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a check constraint to ensure only 'draft' and 'paid' statuses are allowed
ALTER TABLE public.invoices 
DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'paid'));

-- Add comment to document the simplified status system
COMMENT ON COLUMN public.invoices.status IS 'Invoice status: draft (not yet sent/paid) or paid (payment received). No pending status to simplify workflow.'; 