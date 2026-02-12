import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Brand {
  id: string;
  name: string;
  type?: string;
  website?: string;
  country?: string;
  country_of_origin?: string;
  project_sectors?: string[];
  design_categories?: string[];
  status: 'prospect' | 'negotiation' | 'contract' | 'active' | 'inactive' | 'not_relevant';
  deal_stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  priority?: 1 | 2 | 3;
  annual_contract_value?: number;
  sales_owner?: string;
  date_added: string;
  last_contact_date?: string;
  next_followup_date?: string;
  excluded_categories?: string;
  comments?: string;
  hide: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  brand_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  brand_id: string;
  discount?: number;
  payment_terms?: string;
  shipping_terms?: string;
  freight_free_limit?: number;
  rrp_inc_vat?: number;
  rrp_exc_vat?: number;
  dealer_access?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  renewal_date?: string;
  first_purchase_date?: string;
  minimum_order_value?: number;
  commission_structure?: string;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  brand_id: string;
  contact_id?: string;
  type: 'email' | 'phone' | 'meeting';
  date: string;
  subject?: string;
  summary?: string;
  participants?: string;
  follow_up_required: boolean;
  next_action?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  brand_id: string;
  document_type: 'master_data' | 'price_list' | 'images' | 'contract' | 'other';
  name: string;
  url: string;
  file_size?: number;
  version?: string;
  upload_date: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  brand_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Extended types for joins
export interface BrandWithRelations extends Brand {
  contacts?: Contact[];
  deal?: Deal;
  communications?: Communication[];
  documents?: Document[];
  tasks?: Task[];
}
