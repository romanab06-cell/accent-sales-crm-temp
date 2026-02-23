'use client';

import { useEffect, useState } from 'react';
import { projectsApi, type Project, type ProjectWithRelations } from '@/lib/api';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  Building2,
  User,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

const PROJECT_STATUS_COLORS = {
  lead: 'bg-gray-100 text-gray-700',
  specification: 'bg-blue-100 text-blue-700',
  quotation: 'bg-purple-100 text-purple-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  order: 'bg-green-100 text-green-700',
  delivery: 'bg-teal-100 text-teal-700',
  installation: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PROJECT_STATUS_LABELS = {
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

const PROJECT_TYPE_LABELS = {
  private_residential: 'Private Residential',
  hospitality_hotel: 'Hotel',
  hospitality_restaurant: 'Restaurant',
  hospitality_cafe: 'Café',
  hospitality_bar: 'Bar',
  hospitality_leisure: 'Leisure & Entertainment',
  hospitality_wellness: 'Wellness & Spa',
  retail: 'Retail',
  workspace_office: 'Office',
  workspace_coworking: 'Co-working',
  public_spaces: 'Public Spaces',
  other: 'Other',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, typeFilter]);

  async function loadProjects() {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  function filterProjects() {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.country?.toLowerCase().includes(query) ||
        p.client?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.project_type === typeFilter);
    }

    setFilteredProjects(filtered);
  }

  function getStatusCounts() {
    const counts: Record<string, number> = {
      all: projects.length,
      lead: 0,
      specification: 0,
      quotation: 0,
      negotiation: 0,
      order: 0,
      delivery: 0,
      active: 0,
    };

    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
      if (['specification', 'quotation', 'negotiation', 'order', 'delivery'].includes(p.status)) {
        counts.active++;
      }
    });

    return counts;
  }

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your design projects and track progress
              </p>
            </div>
            <Link
              href="/projects/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{projects.length}</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts.active}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.lead || 0}</p>
              </div>
              <User className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Quotation</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.quotation || 0}</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="lead">Lead</option>
                  <option value="specification">Specification</option>
                  <option value="quotation">Quotation</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="order">Order</option>
                  <option value="delivery">Delivery</option>
                  <option value="installation">Installation</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="private_residential">Private Residential</option>
                  <option value="hospitality_hotel">Hotel</option>
                  <option value="hospitality_restaurant">Restaurant</option>
                  <option value="retail">Retail</option>
                  <option value="workspace_office">Office</option>
                  <option value="public_spaces">Public Spaces</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brands
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {project.name}
                        </Link>
                        {project.project_manager && (
                          <p className="text-xs text-gray-500 mt-1">PM: {project.project_manager}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {project.client ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{project.client.name}</p>
                            <p className="text-xs text-gray-500">{project.client.type}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No client</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                      </td>
                      <td className="px-6 py-4">
                        {project.city && project.country ? (
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{project.city}, {project.country}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]
                        }`}>
                          {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {project.project_brands && project.project_brands.length > 0 ? (
                          <span>{project.project_brands.length} brands</span>
                        ) : (
                          <span className="text-gray-400">No brands</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {project.estimated_value ? (
                          <span>€{project.estimated_value.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first project'}
              </p>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create First Project
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredProjects.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}
      </main>
    </div>
  );
}
