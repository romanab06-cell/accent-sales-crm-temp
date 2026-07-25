'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientsApi, projectsApi } from '@/lib/api';
import type { Client, ProjectWithRelations } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Briefcase
} from 'lucide-react';

const CLIENT_TYPE_LABELS = {
  architect: 'Architect',
  interior_designer: 'Interior Designer',
  developer: 'Developer',
  end_client: 'End Client',
  contractor: 'Contractor',
  other: 'Other',
};

const RELATIONSHIP_COLORS = {
  new: 'bg-gray-100 text-gray-700',
  developing: 'bg-blue-100 text-blue-700',
  strong: 'bg-green-100 text-green-700',
  key_account: 'bg-purple-100 text-purple-700',
};

const RELATIONSHIP_LABELS = {
  new: 'New',
  developing: 'Developing',
  strong: 'Strong',
  key_account: 'Key Account',
};

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

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
    loadClientProjects();
  }, [params.id]);

  async function loadClient() {
    try {
      const data = await clientsApi.getById(params.id);
      setClient(data);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadClientProjects() {
    try {
      const data = await projectsApi.getByClient(params.id);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) return;
    
    try {
      await clientsApi.delete(params.id);
      router.push('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client not found</h2>
          <Link href="/clients" className="text-blue-600 hover:underline">
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => 
    ['specification', 'quotation', 'negotiation', 'order', 'delivery'].includes(p.status)
  );
  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalValue = projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/clients" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">
                    {CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS]}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    RELATIONSHIP_COLORS[client.relationship_strength as keyof typeof RELATIONSHIP_COLORS]
                  }`}>
                    {RELATIONSHIP_LABELS[client.relationship_strength as keyof typeof RELATIONSHIP_LABELS]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/clients/${client.id}/edit`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 inline mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {client.company_name && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span>Company</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">{client.company_name}</p>
                  </div>
                )}

                {client.email && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    <a href={`mailto:${client.email}`} className="text-sm text-blue-600 hover:text-blue-800 ml-6">
                      {client.email}
                    </a>
                  </div>
                )}

                {client.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Phone className="w-4 h-4" />
                      <span>Phone</span>
                    </div>
                    <a href={`tel:${client.phone}`} className="text-sm text-blue-600 hover:text-blue-800 ml-6">
                      {client.phone}
                    </a>
                  </div>
                )}

                {client.website && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </div>
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 ml-6">
                      {client.website}
                    </a>
                  </div>
                )}

                {(client.city || client.country) && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">
                      {client.city}{client.city && client.country && ', '}{client.country}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Projects</span>
                  <span className="font-medium text-gray-900">{projects.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Projects</span>
                  <span className="font-medium text-green-600">{activeProjects.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-blue-600">{completedProjects.length}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-medium text-gray-900">€{totalValue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Design Preferences */}
            {(client.design_style_preferences?.length > 0 || client.preferred_brands?.length > 0) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                
                {client.design_style_preferences && client.design_style_preferences.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Design Styles</p>
                    <div className="flex flex-wrap gap-1">
                      {client.design_style_preferences.map((style: string) => (
                        <span key={style} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {client.preferred_brands && client.preferred_brands.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Preferred Brands</p>
                    <div className="flex flex-wrap gap-1">
                      {client.preferred_brands.map((brand: string) => (
                        <span key={brand} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Communication Style */}
            {client.communication_style && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Style</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.communication_style}</p>
              </div>
            )}
          </div>

          {/* Right Column - Projects & Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                  <Link
                    href={`/projects/new?client_id=${client.id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    + New Project
                  </Link>
                </div>
              </div>

              {projects.length > 0 ? (
                <div className="divide-y">
                  {projects.map((project) => (
                    <div key={project.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Link 
                            href={`/projects/${project.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                          >
                            {project.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]
                            }`}>
                              {project.status}
                            </span>
                            {project.city && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.city}
                              </span>
                            )}
                            {project.estimated_value && (
                              <span className="text-sm text-gray-500">
                                €{project.estimated_value.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {project.project_brands && project.project_brands.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {project.project_brands.length} brands involved
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <Link
                    href={`/projects/new?client_id=${client.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    + Create First Project
                  </Link>
                </div>
              )}
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
