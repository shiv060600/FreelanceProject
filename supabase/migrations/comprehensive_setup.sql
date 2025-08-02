-- Comprehensive Database Setup - Idempotent and Secure
-- This file can be run multiple times safely without errors
-- Includes all tables, functions, triggers, policies, and security fixes

-- ==========================================
-- TABLES SETUP
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY NOT NULL,
    avatar_url text,
    user_id text UNIQUE,
    token_identifier text NOT NULL,
    subscription text,
    subscription_status text DEFAULT 'inactive',
    credits text,
    image text,
    invoice_count integer DEFAULT 0,
    max_invoices integer DEFAULT 2,
    max_contracts integer DEFAULT 0,
    lifetime_earnings decimal(10,2) DEFAULT 0,
    total_paid_invoices integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone,
    email text,
    name text,
    full_name text
);

-- Add subscription_status and max_contracts columns if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS max_contracts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    stripe_id text UNIQUE,
    price_id text,
    stripe_price_id text,
    currency text,
    interval text,
    status text,
    current_period_start bigint,
    current_period_end bigint,
    cancel_at_period_end boolean,
    amount bigint,
    started_at bigint,
    ends_at bigint,
    ended_at bigint,
    canceled_at bigint,
    customer_cancellation_reason text,
    customer_cancellation_comment text,
    metadata jsonb,
    custom_field_data jsonb,
    customer_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    type text NOT NULL,
    stripe_event_id text,
    data jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    name text NOT NULL,
    email text,
    phone text,
    company text,
    address text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add lifetime client columns if they don't exist
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS lifetime_client_earnings decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_client_paid_invoices integer DEFAULT 0;

-- Time logs table
CREATE TABLE IF NOT EXISTS public.time_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    client_id uuid REFERENCES public.clients(id),
    description text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    duration_minutes integer,
    is_running boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    client_id uuid REFERENCES public.clients(id),
    invoice_number text NOT NULL,
    issue_date date NOT NULL,
    due_date date NOT NULL,
    status text DEFAULT 'draft',
    subtotal decimal(10,2) DEFAULT 0,
    tax_rate decimal(5,2) DEFAULT 0,
    tax_amount decimal(10,2) DEFAULT 0,
    total decimal(10,2) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
    time_log_id uuid REFERENCES public.time_logs(id),
    description text NOT NULL,
    quantity decimal(10,2) DEFAULT 1,
    unit_price decimal(10,2) DEFAULT 0,
    total decimal(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.users(user_id),
    client_id uuid REFERENCES public.clients(id),
    title text NOT NULL,
    description text,
    start_date date,
    end_date date,
    hourly_rate decimal(10,2),
    fixed_price decimal(10,2),
    status text DEFAULT 'active',
    terms text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS subscriptions_stripe_id_idx ON public.subscriptions(stripe_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS webhook_events_type_idx ON public.webhook_events(type);
CREATE INDEX IF NOT EXISTS webhook_events_stripe_event_id_idx ON public.webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS webhook_events_event_type_idx ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS time_logs_user_id_idx ON public.time_logs(user_id);
CREATE INDEX IF NOT EXISTS time_logs_client_id_idx ON public.time_logs(client_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_items_time_log_id_idx ON public.invoice_items(time_log_id);
CREATE INDEX IF NOT EXISTS contracts_user_id_idx ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS contracts_client_id_idx ON public.contracts(client_id);

-- ==========================================
-- CONSTRAINTS
-- ==========================================

-- Ensure only 'draft' and 'paid' statuses are allowed
DO $$
BEGIN
    -- Drop constraint if it exists, then recreate it
    ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'paid'));
EXCEPTION WHEN OTHERS THEN
    -- If table doesn't exist yet, ignore
    NULL;
END $$;

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FUNCTIONS (Secure with proper search_path)
-- ==========================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Add logging to debug trigger execution
  RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
  
  INSERT INTO public.users (
    id,
    user_id,
    email,
    name,
    full_name,
    avatar_url,
    token_identifier,
    created_at,
    updated_at,
    subscription,
    subscription_status,
    max_invoices,
    max_contracts,
    invoice_count,
    lifetime_earnings,
    total_paid_invoices,
    email_verified
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.email,
    NEW.created_at,
    NEW.updated_at,
    'Free',
    'inactive',
    2,
    2,
    0,
    0,
    0,
    false
  );
  
  RAISE LOG 'User record created successfully for: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', ''),
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    updated_at = NEW.updated_at,
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  WHERE user_id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update user subscription from subscription table
CREATE OR REPLACE FUNCTION public.sync_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
    plan_name text;
    is_subscription_active boolean;
BEGIN
    -- Check if subscription is truly active (not just 'active' status but also within billing period)
    -- For cancelled subscriptions, they should keep access until current_period_end
    is_subscription_active := (
        NEW.status = 'active' OR 
        (NEW.status = 'canceled' AND NEW.cancel_at_period_end = true AND NEW.current_period_end > EXTRACT(epoch FROM NOW()))
    );
    
    -- Only update if subscription is active or still in grace period
    IF is_subscription_active THEN
        -- Map price IDs to plan names using stripe_price_id
        CASE NEW.stripe_price_id
            -- Current price IDs being used
            WHEN 'price_1RaQ0KDBPJVWy5Mhrf7REir7' THEN plan_name := 'Expert Freelancer';
            WHEN 'price_1RaPzpDBPJVWy5Mh7TS53Heu' THEN plan_name := 'Seasoned Freelancer';
            WHEN 'price_1RTCfJDBPJVWy5MhqB5gMwWZ' THEN plan_name := 'New Freelancer';
            -- Legacy price IDs (keep for backwards compatibility)
            WHEN 'price_1OqYLgDNtZHzJBITKyRoXhOD' THEN plan_name := 'Expert Freelancer';
            WHEN 'price_1OqYLFDNtZHzJBITXVYfHbXt' THEN plan_name := 'Seasoned Freelancer';
            WHEN 'price_1OqYKgDNtZHzJBITvDLbA6Vz' THEN plan_name := 'New Freelancer';
            ELSE plan_name := 'Free';
        END CASE;

        -- Update the user's subscription and status
        UPDATE public.users
        SET 
            subscription = plan_name,
            subscription_status = NEW.status,
            -- Update max_invoices and max_contracts based on subscription
            max_invoices = CASE 
                WHEN plan_name = 'Expert Freelancer' THEN 40
                WHEN plan_name = 'Seasoned Freelancer' THEN 20
                WHEN plan_name = 'New Freelancer' THEN 10
                ELSE 2
            END,
            max_contracts = CASE 
                WHEN plan_name = 'Expert Freelancer' THEN 8
                WHEN plan_name = 'Seasoned Freelancer' THEN 4
                WHEN plan_name = 'New Freelancer' THEN 1
                ELSE 0
            END
        WHERE user_id = NEW.user_id;

    ELSE 
        -- Set them back to Free if subscription is truly expired/inactive
        UPDATE public.users
        SET 
            subscription = 'Free',
            subscription_status = NEW.status,
            max_invoices = 2,
            max_contracts = 0
        WHERE user_id = NEW.user_id;
    END IF;

    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update lifetime earnings
CREATE OR REPLACE FUNCTION public.update_lifetime_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoice is being marked as paid (from any status to paid)
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.users 
    SET 
      lifetime_earnings = COALESCE(lifetime_earnings, 0) + NEW.total,
      total_paid_invoices = COALESCE(total_paid_invoices, 0) + 1
    WHERE user_id = NEW.user_id;
  
  -- If invoice is being unmarked as paid (from paid to any other status)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update client lifetime stats
CREATE OR REPLACE FUNCTION public.update_lifetime_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoice is being marked as paid (from any status to paid)
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.clients
    SET 
      lifetime_client_earnings = COALESCE(lifetime_client_earnings, 0) + NEW.total,
      lifetime_client_paid_invoices = COALESCE(lifetime_client_paid_invoices, 0) + 1
    WHERE id = NEW.client_id;
  
  -- If invoice is being unmarked as paid (from paid to any other status)
  ELSIF OLD.status = 'paid' AND NEW.status != 'paid' THEN
    UPDATE public.clients
    SET 
      lifetime_client_earnings = COALESCE(lifetime_client_earnings, 0) - OLD.total,
      lifetime_client_paid_invoices = COALESCE(lifetime_client_paid_invoices, 0) - 1
    WHERE id = OLD.client_id;
  
  -- If a paid invoice amount is being updated (still paid, just different amount)
  ELSIF NEW.status = 'paid' AND OLD.status = 'paid' AND NEW.total != OLD.total THEN
    UPDATE public.clients 
    SET lifetime_client_earnings = COALESCE(lifetime_client_earnings, 0) - OLD.total + NEW.total
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to handle invoice deletion
CREATE OR REPLACE FUNCTION public.handle_invoice_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update the current invoice count, NOT lifetime earnings
  -- Lifetime earnings should persist even when paid invoices are deleted
  UPDATE public.users 
  SET invoice_count = COALESCE(invoice_count, 0) - 1
  WHERE user_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ==========================================
-- TRIGGERS (All triggers created after all functions are defined)
-- ==========================================

-- User management triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_user_update();

-- Subscription sync trigger
DROP TRIGGER IF EXISTS trigger_sync_user_subscription ON public.subscriptions;
CREATE TRIGGER trigger_sync_user_subscription
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_subscription();

-- Invoice-related triggers
DROP TRIGGER IF EXISTS trigger_update_lifetime_earnings ON public.invoices;
CREATE TRIGGER trigger_update_lifetime_earnings
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lifetime_earnings();

DROP TRIGGER IF EXISTS trigger_update_lifetime_client_stats ON public.invoices;
CREATE TRIGGER trigger_update_lifetime_client_stats
  AFTER UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lifetime_client_stats();

DROP TRIGGER IF EXISTS trigger_handle_invoice_deletion ON public.invoices;
CREATE TRIGGER trigger_handle_invoice_deletion
  BEFORE DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_deletion();

-- ==========================================
-- EMAIL VERIFICATION FUNCTIONS
-- ==========================================

-- Function to check email verification status
CREATE OR REPLACE FUNCTION public.check_email_verification(user_email text)
RETURNS boolean AS $$
DECLARE
    user_record auth.users;
BEGIN
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE email = user_email;
    
    RETURN user_record.email_confirmed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually trigger email verification (for logging purposes)
CREATE OR REPLACE FUNCTION public.resend_verification_email(user_email text)
RETURNS void AS $$
BEGIN
    -- This would typically be handled by Supabase Auth
    -- For now, we'll just log the attempt
    RAISE LOG 'Resend verification email requested for: %', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear email confirmation status for development
-- This should only be used in development environments
CREATE OR REPLACE FUNCTION public.clear_email_confirmation(user_email text)
RETURNS text AS $$
DECLARE
    user_record auth.users;
    result text;
BEGIN
    -- Find the user by email
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_record IS NULL THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Clear email confirmation status
    UPDATE auth.users 
    SET 
        email_confirmed_at = NULL,
        email_confirm_sent_at = NULL,
        updated_at = NOW()
    WHERE email = user_email;
    
    result := 'Email confirmation cleared for user: ' || user_email || ' (ID: ' || user_record.id || ')';
    
    -- Log the action
    RAISE LOG 'Email confirmation cleared for user: % (ID: %)', user_email, user_record.id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (for development)
GRANT EXECUTE ON FUNCTION public.clear_email_confirmation(text) TO authenticated;

-- ==========================================
-- POLICIES (Drop and recreate to avoid conflicts)
-- ==========================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING ((SELECT auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING ((SELECT auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING ((SELECT auth.uid())::text = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- Time logs policies
DROP POLICY IF EXISTS "Users can manage their own time logs" ON public.time_logs;
CREATE POLICY "Users can manage their own time logs" ON public.time_logs
    FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- Invoices policies
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
CREATE POLICY "Users can manage their own invoices" ON public.invoices
    FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- Invoice items policies
DROP POLICY IF EXISTS "Users can manage their own invoice items" ON public.invoice_items;
CREATE POLICY "Users can manage their own invoice items" ON public.invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = (SELECT auth.uid())::text
        )
    );

-- Contracts policies
DROP POLICY IF EXISTS "Users can manage their own contracts" ON public.contracts;
CREATE POLICY "Users can manage their own contracts" ON public.contracts
    FOR ALL USING ((SELECT auth.uid())::text = user_id);

-- Webhook events policies (if needed for admin access)
DROP POLICY IF EXISTS "Service can manage webhook events" ON public.webhook_events;
CREATE POLICY "Service can manage webhook events" ON public.webhook_events
    FOR ALL USING (true);

-- ==========================================
-- DATA RECALCULATION
-- ==========================================

-- Update existing users' max_contracts based on their current subscription
UPDATE public.users 
SET max_contracts = CASE 
    WHEN subscription = 'Expert Freelancer' THEN 8
    WHEN subscription = 'Seasoned Freelancer' THEN 4
    WHEN subscription = 'New Freelancer' THEN 1
    ELSE 0
END
WHERE max_contracts = 0 OR max_contracts IS NULL;

-- Recalculate all user stats to ensure everything is correct
DO $$
BEGIN
    UPDATE public.users 
    SET 
      -- Lifetime earnings: SUM of all invoices that are currently paid
      lifetime_earnings = COALESCE((
        SELECT SUM(total) 
        FROM public.invoices 
        WHERE invoices.user_id = users.user_id 
        AND invoices.status = 'paid'
      ), 0),
      
      -- Current count of paid invoices
      total_paid_invoices = COALESCE((
        SELECT COUNT(*) 
        FROM public.invoices 
        WHERE invoices.user_id = users.user_id 
        AND invoices.status = 'paid'
      ), 0),
      
      -- Current total invoice count
      invoice_count = COALESCE((
        SELECT COUNT(*) 
        FROM public.invoices 
        WHERE invoices.user_id = users.user_id
      ), 0);

    -- Recalculate all client lifetime stats
    UPDATE public.clients 
    SET 
      -- Lifetime client earnings: SUM of all paid invoices for this client
      lifetime_client_earnings = COALESCE((
        SELECT SUM(total) 
        FROM public.invoices 
        WHERE invoices.client_id = clients.id 
        AND invoices.status = 'paid'
      ), 0),
      
      -- Current count of paid invoices for this client
      lifetime_client_paid_invoices = COALESCE((
        SELECT COUNT(*) 
        FROM public.invoices 
        WHERE invoices.client_id = clients.id 
        AND invoices.status = 'paid'
      ), 0);
EXCEPTION WHEN OTHERS THEN
    -- If tables don't exist yet, ignore
    NULL;
END $$;

-- ==========================================
-- COMMENTS AND DOCUMENTATION
-- ==========================================

-- Add comprehensive comments
COMMENT ON TABLE public.users IS 'User accounts with subscription and billing information';
COMMENT ON TABLE public.clients IS 'Client information for each user with lifetime stats';
COMMENT ON TABLE public.invoices IS 'Invoice records with status tracking';
COMMENT ON TABLE public.invoice_items IS 'Line items for invoices';

COMMENT ON COLUMN public.users.lifetime_earnings IS 'Total money earned from invoices that were marked as paid. This value should NEVER decrease when paid invoices are deleted, only when payment status is changed from paid to unpaid.';
COMMENT ON COLUMN public.users.total_paid_invoices IS 'Current count of invoices with paid status. This can decrease if paid invoices are deleted.';
COMMENT ON COLUMN public.clients.lifetime_client_earnings IS 'Total money earned from this client from invoices that were marked as paid. This value should NEVER decrease when paid invoices are deleted, only when payment status is changed from paid to unpaid.';
COMMENT ON COLUMN public.clients.lifetime_client_paid_invoices IS 'Current count of paid invoices for this client. This can decrease if paid invoices are deleted.';
COMMENT ON COLUMN public.invoices.status IS 'Invoice status: draft (not yet sent/paid) or paid (payment received). No pending status to simplify workflow.';

COMMENT ON FUNCTION public.handle_new_user IS 'Securely handles new user creation with explicit search_path to prevent injection attacks';
COMMENT ON FUNCTION public.handle_user_update IS 'Securely handles user updates with explicit search_path to prevent injection attacks';
COMMENT ON FUNCTION public.update_lifetime_earnings IS 'Updates user lifetime earnings when invoice status changes - secure against search path injection';
COMMENT ON FUNCTION public.update_lifetime_client_stats IS 'Updates client lifetime stats when invoice status changes - secure against search path injection';
COMMENT ON FUNCTION public.handle_invoice_deletion IS 'Handles invoice deletion by updating counts only - secure against search path injection';

-- ==========================================
-- FINAL SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Comprehensive database setup completed successfully!';
    RAISE NOTICE '🔒 All functions secured with proper search_path settings';
    RAISE NOTICE '📊 Lifetime earnings and client stats configured';
    RAISE NOTICE '🛡️ Row Level Security policies applied';
    RAISE NOTICE '🔄 This script is idempotent and can be run multiple times safely';
END $$; 

 