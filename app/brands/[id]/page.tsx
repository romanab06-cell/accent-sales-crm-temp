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
  Share2,
  FileText,
  Calendar,
  CheckCircle2,
  MessageSquare,
  X
} from 'lucide-react';

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [brand, setBrand] = useState<BrandWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'documents' | 'tasks'>('overview');
  
  // Modal states
  const [showCommModal, setShowCommModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPriceListModal, setShowPriceListModal] = useState(false);
  
  // Form states
  const [priceListUrl, setPriceListUrl] = useState('');
  const [priceListName, setPriceListName] = useState('');
  
  const [commForm, setCommForm] = useState({
    type: 'email' as 'email' | 'phone' | 'meeting',
    subject: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    follow_up_required: false,
  });
  
  const [docForm, setDocForm] = useState({
    name: '',
    url: '',
    document_type: 'master_data' as 'master_data' | 'price_list' | 'images' | 'contract' | 'other',
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to: '',
  });

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

  async function handleAddPriceList() {
    if (!priceListUrl.trim()) {
      alert('Please enter a URL or file path');
      return;
    }
  
    try {
      await documentsApi.create({
        brand_id: params.id,
        document_type: 'price_list',
        name: priceListName || 'Price List',
        url: priceListUrl,
      });
  
      setPriceListUrl('');
      setPriceListName('');
      setShowPriceListModal(false);
      loadBrand();
    } catch (error) {
      console.error('Error adding price list:', error);
      alert('Failed to add price list');
    }
  }

  async function handleAddCommunication() {
    if (!commForm.subject.trim() || !commForm.summary.trim()) {
      alert('Subject and summary are required');
      return;
    }

    try {
      await communicationsApi.create({
        brand_id: params.id,
        type: commForm.type,
        subject: commForm.subject,
        summary: commForm.summary,
        date: commForm.date,
        follow_up_required: commForm.follow_up_required,
      });

      setCommForm({
        type: 'email',
        subject: '',
        summary: '',
        date: new Date().toISOString().split('T')[0],
        follow_up_required: false,
      });
      setShowCommModal(false);
      loadBrand();
    } catch (error) {
      console.error('Error adding communication:', error);
      alert('Failed to add communication');
    }
  }

  async function handleAddDocument() {
    if (!docForm.name.trim() || !docForm.url.trim()) {
      alert('Name and URL are required');
      return;
    }

    try {
      await documentsApi.create({
        brand_id: params.id,
        name: docForm.name,
        url: docForm.url,
        document_type: docForm.document_type,
      });

      setDocForm({
        name: '',
        url: '',
        document_type: 'master_data',
      });
      setShowDocModal(false);
      loadBrand();
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Failed to add document');
    }
  }

  async function handleAddTask() {
    if (!taskForm.title.trim()) {
      alert('Task title is required');
      return;
    }

    try {
      await tasksApi.create({
        brand_id: params.id,
        title: taskForm.title,
        description: taskForm.description || undefined,
        due_date: taskForm.due_date || undefined,
        priority: taskForm.priority,
        assigned_to: taskForm.assigned_to || undefined,
        status: 'pending',
      });

      setTaskForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        assigned_to: '',
      });
      setShowTaskModal(false);
      loadBrand();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    }
  }

  async function handleDeleteCommunication(id: string) {
    if (!confirm('Delete this communication?')) return;
    
    try {
      await communicationsApi.delete(id);
      loadBrand();
    } catch (error) {
      console.error('Error deleting communication:', error);
      alert('Failed to delete communication');
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm('Delete this document?')) return;
    
    try {
      await documentsApi.delete(id);
      loadBrand();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  }

  async function handleDeleteTask(id: string) {
    if (!confirm('Delete this task?')) return;
    
    try {
      await tasksApi.delete(id);
      loadBrand();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  }

  async function handleToggleTaskComplete(task: Task) {
    try {
      await tasksApi.update(task.id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        completed_at: task.status === 'completed' ? null : new Date().toISOString(),
      });
      loadBrand();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
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

  async function handleShare() {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${brand?.name} - Brand Details`,
          text: `Check out ${brand?.name} in our CRM`,
          url: url
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard! Share it with your colleague.');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard! Share it with your colleague.');
      } catch (err) {
        alert(`Share this link: ${text}`);
      }
      document.body.removeChild(textArea);
    });
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
              <button
                onClick={handleShare}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 inline mr-1" />
                Share
              </button>
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

            {/* Price Lists */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Price Lists</h2>
                <button
                  onClick={() => setShowPriceListModal(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add
                </button>
              </div>
              {brand.documents && brand.documents.filter(d => d.document_type === 'price_list').length > 0 ? (
                <div className="space-y-2">
                  {brand.documents
                    .filter(d => d.document_type === 'price_list')
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 flex-1"
                        >
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              Added {new Date(doc.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No price list added yet</p>
              )}
            </div>
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
                    onDelete={handleDeleteCommunication}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab 
                    documents={brand.documents || []} 
                    onAdd={() => setShowDocModal(true)}
                    onDelete={handleDeleteDocument}
                  />
                )}
                {activeTab === 'tasks' && (
                  <TasksTab 
                    tasks={brand.tasks || []} 
                    onAdd={() => setShowTaskModal(true)}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleTaskComplete}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}
        
        {/* Price List Modal */}
        {showPriceListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Price List</h3>
                <button onClick={() => setShowPriceListModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    value={priceListName}
                    onChange={(e) => setPriceListName(e.target.value)}
                    placeholder="e.g., 2025 Price List, EUR Pricing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL or Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={priceListUrl}
                    onChange={(e) => setPriceListUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Google Drive, Dropbox, PDF URL, etc.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPriceListModal(false);
                    setPriceListUrl('');
                    setPriceListName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPriceList}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Price List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Communication Modal */}
        {showCommModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Log Communication</h3>
                <button onClick={() => setShowCommModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={commForm.type}
                    onChange={(e) => setCommForm({ ...commForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={commForm.subject}
                    onChange={(e) => setCommForm({ ...commForm, subject: e.target.value })}
                    placeholder="e.g., Discussed 2025 pricing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={commForm.summary}
                    onChange={(e) => setCommForm({ ...commForm, summary: e.target.value })}
                    placeholder="Brief summary of the communication..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={commForm.date}
                    onChange={(e) => setCommForm({ ...commForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="follow_up"
                    checked={commForm.follow_up_required}
                    onChange={(e) => setCommForm({ ...commForm, follow_up_required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="follow_up" className="text-sm text-gray-700">Follow-up required</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCommModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCommunication}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Communication
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Modal */}
        {showDocModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Document</h3>
                <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    placeholder="e.g., Master Data Sheet"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={docForm.document_type}
                    onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="master_data">Master Data</option>
                    <option value="price_list">Price List</option>
                    <option value="images">Images</option>
                    <option value="contract">Contract</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL or Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={docForm.url}
                    onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Google Drive, Dropbox, or direct link</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDocument}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Task</h3>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="e.g., Follow up on pricing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Optional details..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Task
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

function CommunicationsTab({ communications, onAdd, onDelete }: { 
  communications: Communication[]; 
  onAdd: () => void;
  onDelete: (id: string) => void;
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
            <div key={comm.id} className="border-l-4 border-blue-500 pl-4 py-2 relative group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {comm.type === 'email' && <Mail className="w-4 h-4 text-gray-400" />}
                    {comm.type === 'phone' && <Phone className="w-4 h-4 text-gray-400" />}
                    {comm.type === 'meeting' && <Calendar className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium text-gray-900">{comm.subject || comm.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comm.summary}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(comm.date).toLocaleDateString()}
                    </span>
                    {comm.created_at && (
                      <span className="text-xs text-gray-400">
                        Added {new Date(comm.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(comm.id)}
                  className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

function DocumentsTab({ documents, onAdd, onDelete }: { 
  documents: Document[]; 
  onAdd: () => void;
  onDelete: (id: string) => void;
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
            <div key={doc.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
              <FileText className="w-5 h-5 text-gray-400 mt-1" />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-sm text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(doc.upload_date).toLocaleDateString()}
                </p>
              </a>
              <button
                onClick={() => onDelete(doc.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
      )}
    </div>
  );
}

function TasksTab({ tasks, onAdd, onDelete, onToggleComplete }: { 
  tasks: Task[]; 
  onAdd: () => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
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
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                <button
                  onClick={() => onToggleComplete(task)}
                  className="mt-0.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-600" />
                </button>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {task.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {task.created_at && (
                      <span className="text-xs text-gray-400">
                        Created {new Date(task.created_at).toLocaleDateString()}
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
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <div key={task.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg opacity-75 group">
                <button
                  onClick={() => onToggleComplete(task)}
                  className="mt-0.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </button>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 line-through">{task.title}</p>
                  {task.completed_at && (
                    <span className="text-xs text-gray-500">
                      Completed: {new Date(task.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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