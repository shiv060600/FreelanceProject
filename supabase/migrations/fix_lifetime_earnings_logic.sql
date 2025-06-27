-- Fix lifetime earnings logic - paid invoices that are deleted should NOT affect lifetime earnings
-- Because the payment was already received, deletion is just record cleanup

-- First, drop the incorrect deletion function and trigger
DROP TRIGGER IF EXISTS trigger_handle_invoice_deletion ON public.invoices;
DROP FUNCTION IF EXISTS handle_invoice_deletion();

-- Create corrected function that ONLY handles status changes, NOT deletions
CREATE OR REPLACE FUNCTION update_lifetime_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoice is being marked as paid (from draft or pending to paid)
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.users 
    SET 
      lifetime_earnings = COALESCE(lifetime_earnings, 0) + NEW.total,
      total_paid_invoices = COALESCE(total_paid_invoices, 0) + 1
    WHERE user_id = NEW.user_id;
  
  -- If invoice is being unmarked as paid (from paid to draft or pending)
  -- This means the payment was reversed/cancelled, so we should subtract
  ELSIF OLD.status = 'paid' AND NEW.status != 'paid' THEN
    UPDATE public.users 
    SET 
      lifetime_earnings = COALESCE(lifetime_earnings, 0) - OLD.total,
      total_paid_invoices = COALESCE(total_paid_invoices, 0) - 1
    WHERE user_id = OLD.user_id;
  
  -- If a paid invoice amount is being updated (still paid, just different amount)
  ELSIF NEW.status = 'paid' AND OLD.status = 'paid' AND NEW.total != OLD.total THEN
    UPDATE public.users 
    SET lifetime_earnings = COALESCE(lifetime_earnings, 0) - OLD.total + NEW.total
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create NEW deletion function that only handles invoice_count, NOT lifetime earnings
CREATE OR REPLACE FUNCTION handle_invoice_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update the current invoice count, NOT lifetime earnings
  -- Lifetime earnings should persist even when paid invoices are deleted
  UPDATE public.users 
  SET invoice_count = COALESCE(invoice_count, 0) - 1
  WHERE user_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers with corrected logic
DROP TRIGGER IF EXISTS trigger_update_lifetime_earnings ON public.invoices;
CREATE TRIGGER trigger_update_lifetime_earnings
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_lifetime_earnings();

DROP TRIGGER IF EXISTS trigger_handle_invoice_deletion ON public.invoices;
CREATE TRIGGER trigger_handle_invoice_deletion
  BEFORE DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_invoice_deletion();

-- Recalculate all user stats to ensure everything is correct after the fix
UPDATE public.users 
SET 
  -- Lifetime earnings: SUM of all invoices that were EVER marked as paid
  -- This should NEVER decrease when invoices are deleted
  lifetime_earnings = COALESCE((
    SELECT SUM(total) 
    FROM public.invoices 
    WHERE invoices.user_id = users.user_id 
    AND invoices.status = 'paid'
  ), 0),
  
  -- Current count of paid invoices (can decrease if paid invoices are deleted)
  total_paid_invoices = COALESCE((
    SELECT COUNT(*) 
    FROM public.invoices 
    WHERE invoices.user_id = users.user_id 
    AND invoices.status = 'paid'
  ), 0),
  
  -- Current total invoice count (decreases when any invoice is deleted)
  invoice_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.invoices 
    WHERE invoices.user_id = users.user_id
  ), 0);

-- Add comment to document the correct business logic
COMMENT ON COLUMN public.users.lifetime_earnings IS 'Total money earned from invoices that were marked as paid. This value should NEVER decrease when paid invoices are deleted, only when payment status is changed from paid to unpaid.';
COMMENT ON COLUMN public.users.total_paid_invoices IS 'Current count of invoices with paid status. This can decrease if paid invoices are deleted.'; 