export interface Client {
  id: string
  name: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  status: 'draft' | 'paid' | 'sent'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
  // Related data from database queries
  clients?: Client | null
  // Moved from invoice_items table to invoices table
  description?: string
  quantity?: number
  unit_price?: number
  invoice_name?: string
}

export interface CreateInvoiceData {
  user_id: string
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  status: 'draft' | 'paid'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes?: string
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string
}

export interface SendInvoiceData {
  id: string
  userId: string
}

export interface DeleteInvoiceData {
  id: string
  userId: string
}

export interface UserSubscription {
  maxInvoices: number
  status: 'free' | 'active' | 'expired'
}

export interface InvoiceCount {
  currentCount: number
  maxInvoices: number
  canCreate: boolean
  subscriptionStatus: string
}

// For sorting functionality
export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  key: string | null
  direction: SortDirection
}

// For invoice PDF generation
export interface UserInfo {
  id: string
  email: string
  full_name?: string
  company_name?: string
  address?: string
  phone?: string
  website?: string
}

// For invoice status display
export interface InvoiceStatus {
  status: 'draft' | 'paid' | 'sent'
  label: string
  color: string
  backgroundColor: string
}

// For invoice filtering and search
export interface InvoiceFilters {
  searchTerm: string
  status?: 'draft' | 'paid' | 'sent'
  dateRange?: {
    start: string
    end: string
  }
  clientId?: string
}

// For invoice statistics
export interface InvoiceStats {
  totalInvoices: number
  totalPaid: number
  totalDraft: number
  totalSent: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
}
