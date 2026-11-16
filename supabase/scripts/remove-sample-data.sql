-- Removes the "Sample data (seed)" test clients, invoices and contracts for ONE account.
-- Run it in the Supabase SQL editor (it needs the postgres role). Replace the email below.
--
-- Order matters: deleting a *paid* invoice deliberately does NOT roll back lifetime earnings
-- (see handle_invoice_deletion), so every seeded invoice is first moved back to "draft", which
-- makes the update triggers reverse users.lifetime_earnings / total_paid_invoices and the
-- per-client totals. Deleting each invoice then decrements users.invoice_count by one.
--
-- Only rows belonging to clients whose notes = 'Sample data (seed)' are touched.

do $$
declare
  uid text := (select user_id from public.users where email = 'you@example.com');
  seed_clients uuid[];
begin
  if uid is null then raise exception 'No user with that email'; end if;

  select coalesce(array_agg(id), '{}') into seed_clients
  from public.clients where user_id = uid and notes = 'Sample data (seed)';

  update public.invoices set status = 'draft'
   where client_id = any(seed_clients) and status = 'paid';

  delete from public.contracts where client_id = any(seed_clients);
  delete from public.invoices  where client_id = any(seed_clients);
  delete from public.clients   where id = any(seed_clients);

  raise notice 'Removed % sample clients and their invoices/contracts', coalesce(array_length(seed_clients, 1), 0);
end $$;
