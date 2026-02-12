'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { brandsApi, contactsApi, dealsApi, communicationsApi, documentsApi, tasksApi } from '@/lib/api';
import { BrandWithRelations, Contact, Communication, Document, Task } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  User, 
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'documents' | 'tasks'>('overview');
  
  // Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    loadBrand();
  }, [params.id]);

  async function loadBrand() {
    try {
      const data = await brandsApi.getById(params.id);
      setBrand(data);
    } catch (error) {
      console.error('Error loading brand:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBrand() {
    if (!confirm('Are you sure you want to delete this brand? This cannot be undone.')) return;
    
    try {
      await brandsApi.delete(params.id);
      router.push('/brands');
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brand details...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Brand not found</h2>
          <Link href="/brands" className="text-blue-600 hover:underline">
            Back to brands
          </Link>
        </div>
      </div>
    );
  }

  const primaryContact = brand.contacts?.find(c => c.is_primary);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/brands" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                {brand.type && <p className="text-sm text-gray-500">{brand.type}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/brands/${brand.id}/edit`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 inline mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDeleteBrand}
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
          {/* Left Column - Brand Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-3">
                {brand.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {brand.country && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">{brand.country}</span>
                  </div>
                )}
                {brand.country_of_origin && (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-gray-600">Origin:</span>
    <span className="font-medium">{brand.country_of_origin}</span>
  </div>
)}

{brand.design_categories && brand.design_categories.length > 0 && (
  <div className="text-sm">
    <span className="text-gray-600 block mb-1">Design Categories:</span>
    <div className="flex flex-wrap gap-1">
      {brand.design_categories.map(cat => (
        <span key={cat} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
          {cat}
        </span>
      ))}
    </div>
  </div>
)}

{brand.project_sectors && brand.project_sectors.length > 0 && (
  <div className="text-sm">
    <span className="text-gray-600 block mb-1">Project Sectors:</span>
    <div className="flex flex-wrap gap-1">
      {brand.project_sectors.map(sector => (
        <span key={sector} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          {sector}
        </span>
      ))}
    </div>
  </div>
)}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    brand.status === 'active' ? 'bg-green-100 text-green-700' :
                    brand.status === 'negotiation' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {brand.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Deal Stage:</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                    {brand.deal_stage}
                  </span>
                </div>
                {brand.priority && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      brand.priority === 1 ? 'bg-red-100 text-red-700' :
                      brand.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {brand.priority === 1 ? 'High' : brand.priority === 2 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Contact */}
            {primaryContact && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{primaryContact.name}</span>
                  </div>
                  {primaryContact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${primaryContact.email}`} className="text-blue-600 hover:underline">
                        {primaryContact.email}
                      </a>
                    </div>
                  )}
                  {primaryContact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${primaryContact.phone}`} className="text-blue-600 hover:underline">
                        {primaryContact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deal Terms */}
            {brand.deal && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Terms</h2>
                <div className="space-y-3">
                  {brand.deal.discount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium">{(brand.deal.discount * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {brand.deal.payment_terms && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium">{brand.deal.payment_terms}</span>
                    </div>
                  )}
                  {brand.deal.shipping_terms && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">{brand.deal.shipping_terms}</span>
                    </div>
                  )}
                  {brand.deal.dealer_access && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dealer Access:</span>
                      <span className="font-medium">{brand.deal.dealer_access}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
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
                    onClick={() => setActiveTab('communications')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'communications'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Communications ({brand.communications?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'documents'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Documents ({brand.documents?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'tasks'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Tasks ({brand.tasks?.filter(t => t.status !== 'completed').length || 0})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OverviewTab brand={brand} />
                )}
                {activeTab === 'communications' && (
                  <CommunicationsTab 
                    communications={brand.communications || []} 
                    onAdd={() => setShowCommModal(true)}
                    onRefresh={loadBrand}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab 
                    documents={brand.documents || []} 
                    onAdd={() => setShowDocModal(true)}
                    onRefresh={loadBrand}
                  />
                )}
                {activeTab === 'tasks' && (
                  <TasksTab 
                    tasks={brand.tasks || []} 
                    onAdd={() => setShowTaskModal(true)}
                    onRefresh={loadBrand}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals would go here - simplified for now */}
    </div>
  );
}

// Tab Components
function OverviewTab({ brand }: { brand: BrandWithRelations }) {
  return (
    <div className="space-y-6">
      {/* All Contacts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">All Contacts</h3>
        {brand.contacts && brand.contacts.length > 0 ? (
          <div className="space-y-2">
            {brand.contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                  {contact.role && <p className="text-xs text-gray-500">{contact.role}</p>}
                </div>
                {contact.is_primary && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Primary</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No contacts added yet</p>
        )}
      </div>

      {/* Comments */}
      {brand.comments && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Comments</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{brand.comments}</p>
        </div>
      )}
    </div>
  );
}

function CommunicationsTab({ communications, onAdd, onRefresh }: { 
  communications: Communication[]; 
  onAdd: () => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Log Communication
        </button>
      </div>

      {communications.length > 0 ? (
        <div className="space-y-4">
          {communications.map((comm) => (
            <div key={comm.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {comm.type === 'email' && <Mail className="w-4 h-4 text-gray-400" />}
                    {comm.type === 'phone' && <Phone className="w-4 h-4 text-gray-400" />}
                    {comm.type === 'meeting' && <Calendar className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium text-gray-900">{comm.subject || comm.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comm.summary}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(comm.date).toLocaleDateString()}
                </span>
              </div>
              {comm.follow_up_required && (
                <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  Follow-up required
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No communications logged yet</p>
      )}
    </div>
  );
}

function DocumentsTab({ documents, onAdd, onRefresh }: { 
  documents: Document[]; 
  onAdd: () => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add Document
        </button>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-sm text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(doc.upload_date).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
      )}
    </div>
  );
}

function TasksTab({ tasks, onAdd, onRefresh }: { 
  tasks: Task[]; 
  onAdd: () => void;
  onRefresh: () => void;
}) {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add Task
        </button>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Pending</h4>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {task.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Completed</h4>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg opacity-75">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 line-through">{task.title}</p>
                  {task.completed_at && (
                    <span className="text-xs text-gray-500">
                      Completed: {new Date(task.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-gray-500 text-center py-8">No tasks created yet</p>
      )}
    </div>
  );
}
