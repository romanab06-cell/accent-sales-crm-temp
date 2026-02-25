// =====================================================
// USER AUTHENTICATION & MANAGEMENT API
// =====================================================
// Save as: lib/users-api.ts

import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

// =====================================================
// AUTHENTICATION
// =====================================================

export const authApi = {
  // Login with email/password
  async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        p_email: credentials.email,
        p_password: credentials.password,
      });
  
    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Invalid email or password');
    }
    
    console.log('Raw data from Supabase:', data);
  
    if (!data || data.length === 0) {
      throw new Error('Invalid email or password');
    }
  
    const user = data[0];
    console.log('User object:', user);
  
    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);
  
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accent_user', JSON.stringify(user));
      console.log('Saved to localStorage:', user);
    }
  
    return user;
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('accent_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accent_user');
    }
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

// =====================================================
// USER MANAGEMENT (Admin only)
// =====================================================

export const usersApi = {
  // Get all users
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, last_login_at, created_at, updated_at')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get single user
  async getById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, last_login_at, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new user
  async create(userData: CreateUserData): Promise<User> {
    // Hash password using PostgreSQL crypt function
    const { data, error } = await supabase
      .rpc('create_user', {
        p_email: userData.email,
        p_password: userData.password,
        p_name: userData.name,
        p_role: userData.role,
      });

    if (error) throw error;
    return data;
  },

  // Update user
  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, name, role, is_active, last_login_at, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  // Change password
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await supabase
      .rpc('change_user_password', {
        p_user_id: userId,
        p_new_password: newPassword,
      });

    if (error) throw error;
  },

  // Deactivate user (don't delete, just deactivate)
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Reactivate user
  async reactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// DUPLICATE DETECTION
// =====================================================

export const duplicateApi = {
  // Find duplicate clients
  async findDuplicateClients(name: string, email?: string, companyName?: string) {
    const { data, error } = await supabase
      .rpc('find_duplicate_clients', {
        p_name: name,
        p_email: email || null,
        p_company_name: companyName || null,
      });

    if (error) throw error;
    return data || [];
  },

  // Find duplicate projects
  async findDuplicateProjects(name: string, city?: string) {
    const { data, error } = await supabase
      .rpc('find_duplicate_projects', {
        p_name: name,
        p_city: city || null,
      });

    if (error) throw error;
    return data || [];
  },
};
