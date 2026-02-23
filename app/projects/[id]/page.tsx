'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  projectsApi, 
  brandsApi,
  projectBrandsApi,
  projectTimelineApi,
  type ProjectWithRelations,
  type ProjectBrand,
  type Brand,
  type ProjectTimelineEvent
} from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Plus,
  Building2,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  X,
  ExternalLink
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

const PROJECT_BRAND_STATUS_COLORS = {
  considering: 'bg-gray-100 text-gray-700',
  researching: 'bg-blue-100 text-blue-700',
  specifying: 'bg-purple-100 text-purple-700',
  quoted: 'bg-yellow-100 text-yellow-700',
  negotiating: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  ordered: 'bg-teal-100 text-teal-700',
  delivered: 'bg-indigo-100 text-indigo-700',
  installed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'brands' | 'timeline'>('overview');
  
  // Modals
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  
  // Form states
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [timelineForm, setTimelineForm] = useState({
    event_type: 'meeting' as const,
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadProject();
  }, [params.id]);

  async function loadProject() {
    try {
      const data = await projectsApi.getById(params.id);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableBrands() {
    try {
      const allBrands = await brandsApi.getAll();
      const projectBrandIds = project?.project_brands?.map(pb => pb.brand_id) || [];
      const available = allBrands.filter(b => !projectBrandIds.includes(b.id));
      setAvailableBrands(available);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  async function handleAddBrand() {
    if (!selectedBrandId) {
      alert('Please select a brand');
      return;
    }

    try {
      await projectBrandsApi.addBrandToProject({
        project_id: params.id,
        brand_id: selectedBrandId,
        status: 'considering',
        currency: 'EUR',
      });
      
      setSelectedBrandId('');
      setShowAddBrandModal(false);
      loadProject();
    } catch (error) {
      console.error('Error adding brand:', error);
      alert('Failed to add brand');
    }
  }

  async function handleUpdateBrandStatus(projectBrandId: string, newStatus: string) {
    try {
      await projectBrandsApi.update(projectBrandId, { status: newStatus as any });
      loadProject();
    } catch (error) {
      console.error('Error updating brand status:', error);
      alert('Failed to update brand status');
    }
  }

  async function handleRemoveBrand(projectBrandId: string) {
    if (!confirm('Remove this brand from the project?')) return;
    
    try {
      await projectBrandsApi.remove(projectBrandId);
      loadProject();
    } catch (error) {
      console.error('Error removing brand:', error);
      alert('Failed to remove brand');
    }
  }

  async function handleAddTimelineEvent() {
    if (!timelineForm.title.trim()) {
      alert('Event title is required');
      return;
    }

    try {
      await projectTimelineApi.create({
        project_id: params.id,
        event_type: timelineForm.event_type,
        title: timelineForm.title,
        description: timelineForm.description || undefined,
        event_date: timelineForm.event_date,
        is_completed: false,
      });
      
      setTimelineForm({
        event_type: 'meeting',
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
      });
      setShowAddTimelineModal(false);
      loadProject();
    } catch (error) {
      console.error('Error adding timeline event:', error);
      alert('Failed to add timeline event');
    }
  }

  async function handleDeleteProject() {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    
    try {
      await projectsApi.delete(params.id);
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <Link href="/projects" className="text-blue-600 hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/projects" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]
                  }`}>
                    {project.status}
                  </span>
                  {project.priority === 1 && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 inline mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDeleteProject}
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
          {/* Left Column - Project Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
              <div className="space-y-3">
                {project.client && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>Client</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">{project.client.name}</p>
                    {project.client.company_name && (
                      <p className="text-xs text-gray-500 ml-6">{project.client.company_name}</p>
                    )}
                  </div>
                )}

                {(project.city || project.country) && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">
                      {project.city}{project.city && project.country && ', '}{project.country}
                    </p>
                    {project.location_details && (
                      <p className="text-xs text-gray-500 ml-6">{project.location_details}</p>
                    )}
                  </div>
                )}

                {project.estimated_value && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Estimated Value</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">
                      €{project.estimated_value.toLocaleString()}
                    </p>
                  </div>
                )}

                {project.project_manager && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>Project Manager</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">{project.project_manager}</p>
                  </div>
                )}

                {project.inquiry_date && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Inquiry Date</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 ml-6">
                      {new Date(project.inquiry_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Design Requirements */}
            {(project.design_style?.length || project.required_categories?.length) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Requirements</h2>
                
                {project.design_style && project.design_style.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Design Styles</p>
                    <div className="flex flex-wrap gap-1">
                      {project.design_style.map(style => (
                        <span key={style} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.required_categories && project.required_categories.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Required Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {project.required_categories.map(cat => (
                        <span key={cat} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Deadlines */}
            {(project.specification_deadline || project.quotation_deadline || project.decision_date) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Dates</h2>
                <div className="space-y-2">
                  {project.specification_deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Specification Deadline</span>
                      <span className="font-medium">{new Date(project.specification_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {project.quotation_deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quotation Deadline</span>
                      <span className="font-medium">{new Date(project.quotation_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {project.decision_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Decision Date</span>
                      <span className="font-medium">{new Date(project.decision_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('brands')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'brands'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Brands ({project.project_brands?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'timeline'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Timeline ({project.timeline?.length || 0})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OverviewTab project={project} />
                )}
                {activeTab === 'brands' && (
                  <BrandsTab 
                    projectBrands={project.project_brands || []}
                    onAddBrand={() => {
                      loadAvailableBrands();
                      setShowAddBrandModal(true);
                    }}
                    onUpdateStatus={handleUpdateBrandStatus}
                    onRemove={handleRemoveBrand}
                  />
                )}
                {activeTab === 'timeline' && (
                  <TimelineTab 
                    events={project.timeline || []}
                    onAdd={() => setShowAddTimelineModal(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Brand Modal */}
        {showAddBrandModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Brand to Project</h3>
                <button onClick={() => setShowAddBrandModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Brand</label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a brand...</option>
                  {availableBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddBrandModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBrand}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Brand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Timeline Event Modal */}
        {showAddTimelineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Timeline Event</h3>
                <button onClick={() => setShowAddTimelineModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={timelineForm.event_type}
                    onChange={(e) => setTimelineForm({...timelineForm, event_type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="site_visit">Site Visit</option>
                    <option value="presentation">Presentation</option>
                    <option value="specification_submitted">Specification Submitted</option>
                    <option value="quotation_submitted">Quotation Submitted</option>
                    <option value="client_feedback">Client Feedback</option>
                    <option value="milestone">Milestone</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={timelineForm.title}
                    onChange={(e) => setTimelineForm({...timelineForm, title: e.target.value})}
                    placeholder="e.g., Client meeting to review specifications"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={timelineForm.description}
                    onChange={(e) => setTimelineForm({...timelineForm, description: e.target.value})}
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={timelineForm.event_date}
                    onChange={(e) => setTimelineForm({...timelineForm, event_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddTimelineModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimelineEvent}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Tab Components
function OverviewTab({ project }: { project: ProjectWithRelations }) {
  return (
    <div className="space-y-6">
      {project.description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {project.client_requirements && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Client Requirements</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{project.client_requirements}</p>
        </div>
      )}

      {project.notes && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      {!project.description && !project.client_requirements && !project.notes && (
        <p className="text-gray-500 text-center py-8">No additional information</p>
      )}
    </div>
  );
}

function BrandsTab({ 
  projectBrands, 
  onAddBrand, 
  onUpdateStatus,
  onRemove 
}: { 
  projectBrands: any[];
  onAddBrand: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Brands in Project</h3>
        <button
          onClick={onAddBrand}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {projectBrands.length > 0 ? (
        <div className="space-y-4">
          {projectBrands.map((pb) => (
            <div key={pb.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link 
                    href={`/brands/${pb.brand_id}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    {pb.brand?.name}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  {pb.brand?.country && (
                    <p className="text-sm text-gray-500 mt-1">{pb.brand.country}</p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(pb.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select
                  value={pb.status}
                  onChange={(e) => onUpdateStatus(pb.id, e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="considering">Considering</option>
                  <option value="researching">Researching</option>
                  <option value="specifying">Specifying</option>
                  <option value="quoted">Quoted</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="delivered">Delivered</option>
                  <option value="installed">Installed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {pb.notes && (
                <p className="text-sm text-gray-600 mt-2">{pb.notes}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No brands added yet</p>
          <button
            onClick={onAddBrand}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add First Brand
          </button>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ events, onAdd }: { events: ProjectTimelineEvent[]; onAdd: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {event.event_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No timeline events yet</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add First Event
          </button>
        </div>
      )}
    </div>
  );
}
