import { supabase, Brand, Contact, Deal, Communication, Document, Task, BrandWithRelations } from './supabase';

// ============================================
// BRANDS API
// ============================================
export const brandsApi = {
  // Get all brands with filters
  async getAll(filters?: {
    status?: string;
    deal_stage?: string;
    priority?: number;
    sales_owner?: string;
    search?: string;
  }) {
    let query = supabase
      .from('brands')
      .select('*')
      .eq('hide', false)
      .order('name', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.deal_stage) {
      query = query.eq('deal_stage', filters.deal_stage);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.sales_owner) {
      query = query.eq('sales_owner', filters.sales_owner);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Brand[];
  },

  // Get single brand with all relations
  async getById(id: string) {
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (brandError) throw brandError;

    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('brand_id', id);

    const { data: deal } = await supabase
      .from('deals')
      .select('*')
      .eq('brand_id', id)
      .single();

    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('brand_id', id)
      .order('date', { ascending: false });

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('brand_id', id)
      .order('upload_date', { ascending: false });

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('brand_id', id)
      .order('due_date', { ascending: true });

    return {
      ...brand,
      contacts: contacts || [],
      deal: deal || null,
      communications: communications || [],
      documents: documents || [],
      tasks: tasks || [],
    } as BrandWithRelations;
  },

  // Create brand
  async create(brand: Partial<Brand>) {
    const { data, error } = await supabase
      .from('brands')
      .insert(brand)
      .select()
      .single();

    if (error) throw error;
    return data as Brand;
  },

  // Update brand
  async update(id: string, updates: Partial<Brand>) {
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Brand;
  },

  // Delete brand
  async delete(id: string) {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get dashboard stats
  async getDashboardStats() {
    const { data: brands } = await supabase.from('brands').select('*');
    const { data: tasks } = await supabase.from('tasks').select('*');
    
    if (!brands) return null;

    const stats = {
      total_partners: brands.length,
      active_partners: brands.filter(b => b.status === 'active').length,
      in_negotiation: brands.filter(b => b.deal_stage === 'negotiation').length,
      overdue_followups: brands.filter(b => 
        b.next_followup_date && new Date(b.next_followup_date) < new Date()
      ).length,
      pending_tasks: tasks?.filter(t => t.status === 'pending').length || 0,
      by_status: brands.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_stage: brands.reduce((acc, b) => {
        acc[b.deal_stage] = (acc[b.deal_stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  },
};

// ============================================
// CONTACTS API
// ============================================
export const contactsApi = {
  async create(contact: Partial<Contact>) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data as Contact;
  },

  async update(id: string, updates: Partial<Contact>) {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Contact;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// DEALS API
// ============================================
export const dealsApi = {
  async createOrUpdate(brandId: string, deal: Partial<Deal>) {
    // Check if deal exists
    const { data: existing } = await supabase
      .from('deals')
      .select('id')
      .eq('brand_id', brandId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('deals')
        .update(deal)
        .eq('brand_id', brandId)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    } else {
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...deal, brand_id: brandId })
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    }
  },

  async delete(brandId: string) {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('brand_id', brandId);

    if (error) throw error;
  },
};

// ============================================
// COMMUNICATIONS API
// ============================================
export const communicationsApi = {
  async create(communication: Partial<Communication>) {
    const { data, error } = await supabase
      .from('communications')
      .insert(communication)
      .select()
      .single();

    if (error) throw error;

    // Update brand's last_contact_date
    if (communication.brand_id) {
      await supabase
        .from('brands')
        .update({ last_contact_date: communication.date || new Date().toISOString() })
        .eq('id', communication.brand_id);
    }

    return data as Communication;
  },

  async update(id: string, updates: Partial<Communication>) {
    const { data, error } = await supabase
      .from('communications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Communication;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getRecent(limit = 10) {
    const { data, error } = await supabase
      .from('communications')
      .select(`
        *,
        brands(name)
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

// ============================================
// DOCUMENTS API
// ============================================
export const documentsApi = {
  async create(document: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async update(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// TASKS API
// ============================================
export const tasksApi = {
  async create(task: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async update(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getUpcoming(limit = 10) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        brands(name)
      `)
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getOverdue() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        brands(name)
      `)
      .in('status', ['pending', 'in_progress'])
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },
};
