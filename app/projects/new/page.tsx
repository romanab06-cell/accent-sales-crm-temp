'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi, clientsApi, authApi, type Client } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';


const PROJECT_TYPES = [
  { value: 'private_residential', label: 'Private Residential' },
  { value: 'hospitality_hotel', label: 'Hotel' },
  { value: 'hospitality_restaurant', label: 'Restaurant' },
  { value: 'hospitality_cafe', label: 'Café' },
  { value: 'hospitality_bar', label: 'Bar' },
  { value: 'hospitality_leisure', label: 'Leisure & Entertainment' },
  { value: 'hospitality_wellness', label: 'Wellness & Spa' },
  { value: 'retail', label: 'Retail' },
  { value: 'workspace_office', label: 'Office' },
  { value: 'workspace_coworking', label: 'Co-working' },
  { value: 'public_spaces', label: 'Public Spaces' },
  { value: 'other', label: 'Other' },
];

const DESIGN_STYLES = [
  'Modern', 'Contemporary', 'Minimalist', 'Mid-Century Modern', 
  'Industrial', 'Scandinavian', 'Japandi', 'Art Deco',
  'Traditional', 'Transitional', 'Coastal', 'Mediterranean',
  'Bohemian', 'Eclectic', 'Luxury', 'Classic European'
];

const DESIGN_CATEGORIES = [
  'Furniture', 'Lighting', 'Accessories', 'Textiles', 
  'Rugs', 'Art', 'Home Decor', 'Tableware'
];

const PROJECT_SECTORS = [
  'Residential', 'Hospitality', 'Retail', 'Workspace', 
  'Public Spaces', 'Marine', 'Airports', 'Healthcare', 
  'Education', 'Entertainment'
];

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    project_type: 'private_residential' as const,
    country: '',
    city: '',
    location_details: '',
    budget_range: '',
    estimated_value: '',
    design_style: [] as string[],
    required_categories: [] as string[],
    project_sectors: [] as string[],
    inquiry_date: new Date().toISOString().split('T')[0],
    specification_deadline: '',
    quotation_deadline: '',
    decision_date: '',
    status: 'lead' as const,
    project_manager: '',
    sales_team: [] as string[],
    priority: 2,
    description: '',
    notes: '',
    client_requirements: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleMultiSelect(field: 'design_style' | 'required_categories' | 'project_sectors', value: string) {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    setLoading(true);

    try {
      const currentUser = authApi.getCurrentUser();
      const projectData: any = {
        name: formData.name,
        client_id: formData.client_id || undefined,
        project_type: formData.project_type,
        country: formData.country || undefined,
        city: formData.city || undefined,
        location_details: formData.location_details || undefined,
        budget_range: formData.budget_range || undefined,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : undefined,
        currency: 'EUR',
        design_style: formData.design_style.length > 0 ? formData.design_style : undefined,
        required_categories: formData.required_categories.length > 0 ? formData.required_categories : undefined,
        project_sectors: formData.project_sectors.length > 0 ? formData.project_sectors : undefined,
        inquiry_date: formData.inquiry_date || undefined,
        specification_deadline: formData.specification_deadline || undefined,
        quotation_deadline: formData.quotation_deadline || undefined,
        decision_date: formData.decision_date || undefined,
        status: formData.status,
        project_manager: formData.project_manager || undefined,
        sales_team: formData.sales_team.length > 0 ? formData.sales_team : undefined,
        priority: formData.priority,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        client_requirements: formData.client_requirements || undefined,
        created_by: currentUser?.id,
      };

      const newProject = await projectsApi.create(projectData);
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
              <p className="text-sm text-gray-500">Create a new design project</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Four Seasons Dubai Tower 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a client (optional)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company_name ? `- ${client.company_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., United Arab Emirates"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Dubai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Details</label>
                <input
                  type="text"
                  name="location_details"
                  value={formData.location_details}
                  onChange={handleChange}
                  placeholder="e.g., Palm Jumeirah, Sheikh Zayed Road"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief overview of the project..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <select
                  name="budget_range"
                  value={formData.budget_range}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  <option value="under_50k">Under €50K</option>
                  <option value="50k_200k">€50K - €200K</option>
                  <option value="200k_500k">€200K - €500K</option>
                  <option value="500k_1m">€500K - €1M</option>
                  <option value="1m_plus">€1M - €2M</option>
                  <option value="over_2m">Over €2M</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (€)</label>
                <input
                  type="number"
                  name="estimated_value"
                  value={formData.estimated_value}
                  onChange={handleChange}
                  placeholder="e.g., 250000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Design Requirements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Requirements</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Design Styles</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DESIGN_STYLES.map(style => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.design_style.includes(style)}
                        onChange={() => handleMultiSelect('design_style', style)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DESIGN_CATEGORIES.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.required_categories.includes(category)}
                        onChange={() => handleMultiSelect('required_categories', category)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Sectors</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PROJECT_SECTORS.map(sector => (
                    <label key={sector} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.project_sectors.includes(sector)}
                        onChange={() => handleMultiSelect('project_sectors', sector)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Requirements</label>
                <textarea
                  name="client_requirements"
                  value={formData.client_requirements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Specific client requests or requirements..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Date</label>
                <input
                  type="date"
                  name="inquiry_date"
                  value={formData.inquiry_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specification Deadline</label>
                <input
                  type="date"
                  name="specification_deadline"
                  value={formData.specification_deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Deadline</label>
                <input
                  type="date"
                  name="quotation_deadline"
                  value={formData.quotation_deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision Date</label>
                <input
                  type="date"
                  name="decision_date"
                  value={formData.decision_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Project Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="lead">Lead</option>
                  <option value="specification">Specification</option>
                  <option value="quotation">Quotation</option>
                  <option value="negotiation">Negotiation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                <input
                  type="text"
                  name="project_manager"
                  value={formData.project_manager}
                  onChange={handleChange}
                  placeholder="e.g., Roman"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Internal notes, reminders, or action items..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href="/projects"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
