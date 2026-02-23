// =====================================================
// API FUNCTIONS FOR PROJECTS MODULE
// =====================================================
// Save this as: lib/projects-api.ts

import { supabase } from './supabase';
import type { Brand } from './supabase';

// =====================================================
// TYPE DEFINITIONS
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
  total_value_delivered?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

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

export interface ProjectWithRelations extends Project {
  client?: Client;
  project_brands?: ProjectBrand[];
  timeline?: ProjectTimelineEvent[];
}

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

export interface ProjectBrandWithDetails extends ProjectBrand {
  brand?: Brand;
}

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

export interface BrandComparisonWithDetails extends BrandComparison {
  brand_a?: Brand;
  brand_b?: Brand;
}

// =====================================================
// CLIENTS API
// =====================================================

export const clientsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as Client[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        projects (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(client: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  async update(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data as Client[];
  },

  async getByType(type: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('type', type)
      .order('name');
    
    if (error) throw error;
    return data as Client[];
  },
};

// =====================================================
// PROJECTS API
// =====================================================

export const projectsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        project_brands(
          *,
          brand:brands(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProjectWithRelations[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        project_brands(
          *,
          brand:brands(*)
        ),
        timeline:project_timeline(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ProjectWithRelations;
  },

  async create(project: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data as Project;
  },

  async update(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Project;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        project_brands(
          *,
          brand:brands(*)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProjectWithRelations[];
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_brands(
          *,
          brand:brands(*)
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProjectWithRelations[];
  },

  async getByManager(manager: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        project_brands(
          *,
          brand:brands(*)
        )
      `)
      .eq('project_manager', manager)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProjectWithRelations[];
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProjectWithRelations[];
  },

  async getStatistics() {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('status, estimated_value, actual_value, project_type');
    
    if (error) throw error;

    const stats = {
      total: projects.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      totalEstimatedValue: 0,
      totalActualValue: 0,
      averageValue: 0,
    };

    projects.forEach((p: any) => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      stats.byType[p.project_type] = (stats.byType[p.project_type] || 0) + 1;
      stats.totalEstimatedValue += p.estimated_value || 0;
      stats.totalActualValue += p.actual_value || 0;
    });

    stats.averageValue = stats.totalEstimatedValue / projects.length || 0;

    return stats;
  },
};

// =====================================================
// PROJECT-BRANDS API
// =====================================================

export const projectBrandsApi = {
  async addBrandToProject(projectBrand: Partial<ProjectBrand>) {
    const { data, error } = await supabase
      .from('project_brands')
      .insert(projectBrand)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectBrand;
  },

  async update(id: string, updates: Partial<ProjectBrand>) {
    const { data, error } = await supabase
      .from('project_brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectBrand;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('project_brands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getProjectsByBrand(brandId: string) {
    const { data, error } = await supabase
      .from('project_brands')
      .select(`
        *,
        project:projects(
          *,
          client:clients(*)
        )
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getBrandStatistics(brandId: string) {
    const { data, error } = await supabase
      .from('project_brands')
      .select('status, quoted_amount, actual_amount')
      .eq('brand_id', brandId);
    
    if (error) throw error;

    const stats = {
      totalProjects: data.length,
      byStatus: {} as Record<string, number>,
      totalQuoted: 0,
      totalActual: 0,
      conversionRate: 0,
    };

    data.forEach((pb: any) => {
      stats.byStatus[pb.status] = (stats.byStatus[pb.status] || 0) + 1;
      stats.totalQuoted += pb.quoted_amount || 0;
      stats.totalActual += pb.actual_amount || 0;
    });

    const approved = stats.byStatus['approved'] || 0;
    const quoted = stats.byStatus['quoted'] || 0;
    stats.conversionRate = quoted > 0 ? (approved / quoted) * 100 : 0;

    return stats;
  },
};

// =====================================================
// PROJECT TIMELINE API
// =====================================================

export const projectTimelineApi = {
  async create(event: Partial<ProjectTimelineEvent>) {
    const { data, error } = await supabase
      .from('project_timeline')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectTimelineEvent;
  },

  async update(id: string, updates: Partial<ProjectTimelineEvent>) {
    const { data, error } = await supabase
      .from('project_timeline')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ProjectTimelineEvent;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('project_timeline')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('project_timeline')
      .select('*')
      .eq('project_id', projectId)
      .order('event_date', { ascending: false });
    
    if (error) throw error;
    return data as ProjectTimelineEvent[];
  },

  async getUpcoming(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('project_timeline')
      .select(`
        *,
        project:projects(name, status)
      `)
      .gte('event_date', today)
      .eq('is_completed', false)
      .order('event_date')
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
};

// =====================================================
// BRAND COMPARISONS API
// =====================================================

export const brandComparisonsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('brand_comparisons')
      .select(`
        *,
        brand_a:brands!brand_comparisons_brand_a_id_fkey(*),
        brand_b:brands!brand_comparisons_brand_b_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as BrandComparisonWithDetails[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('brand_comparisons')
      .select(`
        *,
        brand_a:brands!brand_comparisons_brand_a_id_fkey(*),
        brand_b:brands!brand_comparisons_brand_b_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as BrandComparisonWithDetails;
  },

  async getByBrands(brandAId: string, brandBId: string) {
    const { data, error } = await supabase
      .from('brand_comparisons')
      .select(`
        *,
        brand_a:brands!brand_comparisons_brand_a_id_fkey(*),
        brand_b:brands!brand_comparisons_brand_b_id_fkey(*)
      `)
      .or(`and(brand_a_id.eq.${brandAId},brand_b_id.eq.${brandBId}),and(brand_a_id.eq.${brandBId},brand_b_id.eq.${brandAId})`)
      .maybeSingle();
    
    if (error) throw error;
    return data as BrandComparisonWithDetails | null;
  },

  async create(comparison: Partial<BrandComparison>) {
    const { data, error } = await supabase
      .from('brand_comparisons')
      .insert(comparison)
      .select()
      .single();
    
    if (error) throw error;
    return data as BrandComparison;
  },

  async update(id: string, updates: Partial<BrandComparison>) {
    const { data, error } = await supabase
      .from('brand_comparisons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as BrandComparison;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('brand_comparisons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async incrementUseCount(id: string) {
    const { data: current, error: fetchError } = await supabase
      .from('brand_comparisons')
      .select('use_count')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('brand_comparisons')
      .update({ 
        use_count: (current.use_count || 0) + 1,
        last_used_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as BrandComparison;
  },

  async getMostUsed(limit = 10) {
    const { data, error } = await supabase
      .from('brand_comparisons')
      .select(`
        *,
        brand_a:brands!brand_comparisons_brand_a_id_fkey(*),
        brand_b:brands!brand_comparisons_brand_b_id_fkey(*)
      `)
      .order('use_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as BrandComparisonWithDetails[];
  },
};

// =====================================================
// COMBINED/HELPER FUNCTIONS
// =====================================================

export async function getDashboardOverview() {
  const [projects, clients, projectStats] = await Promise.all([
    projectsApi.getAll(),
    clientsApi.getAll(),
    projectsApi.getStatistics(),
  ]);

  return {
    totalProjects: projects.length,
    activeProjects: projects.filter((p: ProjectWithRelations) => 
      ['specification', 'quotation', 'negotiation', 'order', 'delivery'].includes(p.status)
    ).length,
    totalClients: clients.length,
    keyAccounts: clients.filter((c: Client) => c.relationship_strength === 'key_account').length,
    projectStats,
    recentProjects: projects.slice(0, 5),
    recentClients: clients.slice(0, 5),
  };
}

export async function getProjectPipeline() {
  const projects = await projectsApi.getAll();
  
  const pipeline = {
    lead: projects.filter((p: ProjectWithRelations) => p.status === 'lead'),
    specification: projects.filter((p: ProjectWithRelations) => p.status === 'specification'),
    quotation: projects.filter((p: ProjectWithRelations) => p.status === 'quotation'),
    negotiation: projects.filter((p: ProjectWithRelations) => p.status === 'negotiation'),
    order: projects.filter((p: ProjectWithRelations) => p.status === 'order'),
    delivery: projects.filter((p: ProjectWithRelations) => p.status === 'delivery'),
    installation: projects.filter((p: ProjectWithRelations) => p.status === 'installation'),
  };

  return pipeline;
}
