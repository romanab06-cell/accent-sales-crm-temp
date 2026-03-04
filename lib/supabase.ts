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
// =====================================================
// TYPESCRIPT TYPES FOR PROJECTS MODULE
// =====================================================
// Add these to your existing lib/supabase.ts file

// =====================================================
// CLIENT TYPES
// =====================================================

export type ClientType = 
  | 'architect' 
  | 'interior_designer' 
  | 'developer' 
  | 'end_client' 
  | 'contractor' 
  | 'other';

export type RelationshipStrength = 
  | 'new' 
  | 'developing' 
  | 'strong' 
  | 'key_account';

export type BudgetRange = 
  | 'under_50k' 
  | '50k_200k' 
  | '200k_500k' 
  | '500k_1m' 
  | '1m_plus' 
  | 'over_2m';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  company_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  design_style_preferences?: string[];
  preferred_brands?: string[];
  budget_range?: BudgetRange;
  communication_style?: string;
  notes?: string;
  relationship_strength: RelationshipStrength;
  projects_completed: number;
  user_id?: string;
  total_value_delivered?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// =====================================================
// PROJECT TYPES
// =====================================================

export type ProjectType = 
  | 'private_residential'
  | 'hospitality_hotel'
  | 'hospitality_restaurant'
  | 'hospitality_cafe'
  | 'hospitality_bar'
  | 'hospitality_leisure'
  | 'hospitality_wellness'
  | 'retail'
  | 'workspace_office'
  | 'workspace_coworking'
  | 'public_spaces'
  | 'other';

export type ProjectStatus = 
  | 'lead'
  | 'specification'
  | 'quotation'
  | 'negotiation'
  | 'order'
  | 'delivery'
  | 'installation'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type DesignStyle = 
  | 'modern'
  | 'contemporary'
  | 'minimalist'
  | 'mid_century_modern'
  | 'industrial'
  | 'scandinavian'
  | 'japandi'
  | 'art_deco'
  | 'traditional'
  | 'transitional'
  | 'coastal'
  | 'mediterranean'
  | 'bohemian'
  | 'eclectic'
  | 'luxury'
  | 'classic_european';

export interface Project {
  id: string;
  name: string;
  client_id?: string;
  project_type: ProjectType;
  country?: string;
  city?: string;
  location_details?: string;
  budget_range?: BudgetRange;
  estimated_value?: number;
  actual_value?: number;
  currency: string;
  design_style?: string[];
  required_categories?: string[];
  project_sectors?: string[];
  inquiry_date?: string;
  specification_deadline?: string;
  quotation_deadline?: string;
  decision_date?: string;
  order_date?: string;
  delivery_start_date?: string;
  delivery_end_date?: string;
  installation_date?: string;
  completion_date?: string;
  status: ProjectStatus;
  project_manager?: string;
  sales_team?: string[];
  priority?: 1 | 2 | 3;
  description?: string;
  notes?: string;
  client_requirements?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Project with related data
export interface ProjectWithRelations extends Project {
  client?: Client;
  project_brands?: ProjectBrand[];
  timeline?: ProjectTimelineEvent[];
}

// =====================================================
// PROJECT-BRAND LINK TYPES
// =====================================================

export type ProjectBrandStatus = 
  | 'considering'
  | 'researching'
  | 'specifying'
  | 'quoted'
  | 'negotiating'
  | 'approved'
  | 'ordered'
  | 'delivered'
  | 'installed'
  | 'rejected';

export interface ProjectBrand {
  id: string;
  project_id: string;
  brand_id: string;
  status: ProjectBrandStatus;
  quoted_amount?: number;
  actual_amount?: number;
  currency: string;
  categories_specified?: string[];
  products_specified?: string;
  quote_submitted_date?: string;
  quote_expiry_date?: string;
  order_placed_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// With brand details
export interface ProjectBrandWithDetails extends ProjectBrand {
  brand?: Brand;
}

// =====================================================
// PROJECT TIMELINE TYPES
// =====================================================

export type TimelineEventType = 
  | 'meeting'
  | 'site_visit'
  | 'presentation'
  | 'specification_submitted'
  | 'quotation_submitted'
  | 'client_feedback'
  | 'order_placed'
  | 'delivery'
  | 'milestone'
  | 'other';

export interface ProjectTimelineEvent {
  id: string;
  project_id: string;
  event_type: TimelineEventType;
  title: string;
  description?: string;
  event_date: string;
  attendees?: string[];
  brands_discussed?: string[];
  is_completed: boolean;
  created_at: string;
  created_by?: string;
}

// =====================================================
// BRAND COMPARISON TYPES
// =====================================================

export interface BrandComparison {
  id: string;
  brand_a_id: string;
  brand_b_id: string;
  title: string;
  price_positioning_a?: string;
  price_positioning_b?: string;
  lead_time_a?: string;
  lead_time_b?: string;
  design_style_a?: string;
  design_style_b?: string;
  best_for_a?: string;
  best_for_b?: string;
  pros_a?: string;
  pros_b?: string;
  cons_a?: string;
  cons_b?: string;
  recommendations?: string;
  use_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// With brand details
export interface BrandComparisonWithDetails extends BrandComparison {
  brand_a?: Brand;
  brand_b?: Brand;
}

// =====================================================
// HELPER TYPES & CONSTANTS
// =====================================================

// Display labels for dropdown/select options
export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  architect: 'Architect',
  interior_designer: 'Interior Designer',
  developer: 'Developer',
  end_client: 'End Client',
  contractor: 'Contractor',
  other: 'Other',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  private_residential: 'Private Residential',
  hospitality_hotel: 'Hotel',
  hospitality_restaurant: 'Restaurant',
  hospitality_cafe: 'Café',
  hospitality_bar: 'Bar',
  hospitality_leisure: 'Leisure & Entertainment',
  hospitality_wellness: 'Wellness & Spa',
  retail: 'Retail',
  workspace_office: 'Office',
  workspace_coworking: 'Co-working Space',
  public_spaces: 'Public Spaces',
  other: 'Other',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  lead: 'Lead',
  specification: 'Specification',
  quotation: 'Quotation',
  negotiation: 'Negotiation',
  order: 'Order',
  delivery: 'Delivery',
  installation: 'Installation',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export const DESIGN_STYLE_LABELS: Record<DesignStyle, string> = {
  modern: 'Modern',
  contemporary: 'Contemporary',
  minimalist: 'Minimalist',
  mid_century_modern: 'Mid-Century Modern',
  industrial: 'Industrial',
  scandinavian: 'Scandinavian',
  japandi: 'Japandi',
  art_deco: 'Art Deco',
  traditional: 'Traditional',
  transitional: 'Transitional',
  coastal: 'Coastal',
  mediterranean: 'Mediterranean',
  bohemian: 'Bohemian',
  eclectic: 'Eclectic',
  luxury: 'Luxury',
  classic_european: 'Classic European',
};

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_50k: 'Under €50K',
  '50k_200k': '€50K - €200K',
  '200k_500k': '€200K - €500K',
  '500k_1m': '€500K - €1M',
  '1m_plus': '€1M - €2M',
  over_2m: 'Over €2M',
};

export const PROJECT_BRAND_STATUS_LABELS: Record<ProjectBrandStatus, string> = {
  considering: 'Considering',
  researching: 'Researching',
  specifying: 'Specifying',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
  approved: 'Approved',
  ordered: 'Ordered',
  delivered: 'Delivered',
  installed: 'Installed',
  rejected: 'Rejected',
};

export const RELATIONSHIP_STRENGTH_LABELS: Record<RelationshipStrength, string> = {
  new: 'New',
  developing: 'Developing',
  strong: 'Strong',
  key_account: 'Key Account',
};

export const TIMELINE_EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  meeting: 'Meeting',
  site_visit: 'Site Visit',
  presentation: 'Presentation',
  specification_submitted: 'Specification Submitted',
  quotation_submitted: 'Quotation Submitted',
  client_feedback: 'Client Feedback',
  order_placed: 'Order Placed',
  delivery: 'Delivery',
  milestone: 'Milestone',
  other: 'Other',
};
