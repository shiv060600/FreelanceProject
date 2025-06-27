'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface InvoiceLimitCheckProps {
  children: React.ReactNode;
}

export function InvoiceLimitCheck({ children }: InvoiceLimitCheckProps) {
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [maxInvoices, setMaxInvoices] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkInvoiceLimit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('invoice_count, max_invoices')
        .eq('user_id', user.id)
        .single();

      if (userData) {
        setInvoiceCount(userData.invoice_count || 0);
        setMaxInvoices(userData.max_invoices || 10);
      } else {
        // Fallback values if no user data found
        setInvoiceCount(0);
        setMaxInvoices(10);
      }
      setLoading(false);
    }

    checkInvoiceLimit();
  }, [supabase]);

  // Don't show anything while loading or if data isn't ready
  if (loading || invoiceCount === null || maxInvoices === null) {
    return <>{children}</>;
  }

  return (
    <>
      {invoiceCount >= maxInvoices && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached your free invoice limit ({maxInvoices}). Upgrade to create more invoices.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
} 