'use client';

import { useEffect, useState } from 'react';
import { clientsApi, authApi, type Client } from '@/lib/api';
import Link from 'next/link';
import { 
  Plus, 
  Search,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Users,
  Filter,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  FileSpreadsheet
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

interface ParsedClient {
  name: string;
  email?: string;
  company_name?: string;
  phone?: string;
  type: string;
  city?: string;
  country?: string;
  notes?: string;
  relationship_strength: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'mine'>('all');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const user = authApi.getCurrentUser();
    setCurrentUser(user);
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, typeFilter, relationshipFilter, ownershipFilter]);

  async function loadClients() {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterClients() {
    let filtered = [...clients];
    if (ownershipFilter === 'mine' && currentUser) {
      filtered = filtered.filter(c => c.user_id === currentUser.id);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.company_name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query) ||
        c.country?.toLowerCase().includes(query)
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    if (relationshipFilter !== 'all') {
      filtered = filtered.filter(c => c.relationship_strength === relationshipFilter);
    }
    setFilteredClients(filtered);
  }

  const myClientsCount = currentUser ? clients.filter(c => c.user_id === currentUser.id).length : 0;
  const architectCount = clients.filter(c => c.type === 'architect').length;
  const designerCount = clients.filter(c => c.type === 'interior_designer').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your architects, designers, and clients</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Import
              </button>
              <Link
                href="/clients/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Client
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Architects</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{architectCount}</p>
              </div>
              <Building2 className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interior Designers</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{designerCount}</p>
              </div>
              <User className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Clients</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{myClientsCount}</p>
              </div>
              <div className="w-10 h-10 text-yellow-600 flex items-center justify-center text-2xl">👤</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">View:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOwnershipFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ownershipFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
                >
                  All Clients ({clients.length})
                </button>
                <button
                  onClick={() => setOwnershipFilter('mine')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ownershipFilter === 'mine' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
                >
                  My Clients ({myClientsCount})
                </button>
              </div>
            </div>
            {currentUser && (
              <div className="text-sm text-blue-700">
                Logged in as: <span className="font-medium">{currentUser.name}</span>
                {currentUser.role === 'admin' && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Admin</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="architect">Architect</option>
              <option value="interior_designer">Interior Designer</option>
              <option value="developer">Developer</option>
              <option value="end_client">End Client</option>
              <option value="contractor">Contractor</option>
              <option value="other">Other</option>
            </select>
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Relationships</option>
              <option value="new">New</option>
              <option value="developing">Developing</option>
              <option value="strong">Strong</option>
              <option value="key_account">Key Account</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {client.name}
                        </Link>
                        {client.company_name && <p className="text-xs text-gray-500 mt-1">{client.company_name}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS] || client.type}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${client.email}`} className="hover:text-blue-600">{client.email}</a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${client.phone}`} className="hover:text-blue-600">{client.phone}</a>
                            </div>
                          )}
                          {!client.email && !client.phone && <span className="text-sm text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(client.city || client.country) ? (
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{[client.city, client.country].filter(Boolean).join(', ')}</span>
                          </div>
                        ) : <span className="text-sm text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${RELATIONSHIP_COLORS[client.relationship_strength as keyof typeof RELATIONSHIP_COLORS] || 'bg-gray-100 text-gray-700'}`}>
                          {RELATIONSHIP_LABELS[client.relationship_strength as keyof typeof RELATIONSHIP_LABELS] || client.relationship_strength}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {client.projects_completed > 0 ? <span>{client.projects_completed} completed</span> : <span className="text-gray-400">No projects</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || typeFilter !== 'all' || relationshipFilter !== 'all' || ownershipFilter === 'mine'
                  ? 'Try adjusting your filters' : 'Get started by creating your first client'}
              </p>
            </div>
          )}
        </div>

        {filteredClients.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        )}
      </main>

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { setShowImportModal(false); loadClients(); }}
          currentUser={currentUser}
        />
      )}
    </div>
  </div>
  );
}

function ImportModal({ onClose, onSuccess, currentUser }: { onClose: () => void; onSuccess: () => void; currentUser: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedClient[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');

  function downloadTemplate() {
    const csv = 'Name,Email,Company,Phone,Type,City,Country,Relationship,Notes\nJohn Doe,john@example.com,Example Co,+1234567890,architect,Dubai,UAE,new,Notes here\nJane Smith,jane@example.com,Smith Design,,interior designer,London,UK,developing,';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-template.csv';
    a.click();
  }

  function mapType(type: string): string {
    const t = (type || '').toLowerCase().trim();
    if (t.includes('architect')) return 'architect';
    if (t.includes('interior') || t.includes('designer')) return 'interior_designer';
    if (t.includes('developer')) return 'developer';
    if (t.includes('contractor')) return 'contractor';
    if (t.includes('end') || t.includes('client')) return 'end_client';
    return 'other';
  }

  function mapRelationship(rel: string): string {
    const r = (rel || '').toLowerCase().trim();
    if (r.includes('key')) return 'key_account';
    if (r.includes('strong')) return 'strong';
    if (r.includes('develop')) return 'developing';
    return 'new';
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const ext = f.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const text = await f.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { alert('File has no data rows'); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const data: ParsedClient[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
        const name = row.name || row['client name'] || row['full name'] || '';
        if (!name) continue;
        data.push({
          name,
          email: row.email || '',
          company_name: row.company || row['company name'] || row.company_name || '',
          phone: row.phone || row.mobile || '',
          type: mapType(row.type || ''),
          city: row.city || '',
          country: row.country || '',
          notes: row.notes || '',
          relationship_strength: mapRelationship(row.relationship || ''),
        });
      }
      setParsedData(data);
      setStep('preview');
    } else if (ext === 'xlsx' || ext === 'xls') {
      const XLSX = await import('xlsx');
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const data: ParsedClient[] = rows.map(row => ({
        name: row.Name || row.name || row['Client Name'] || row['Full Name'] || '',
        email: row.Email || row.email || '',
        company_name: row.Company || row.company || row['Company Name'] || '',
        phone: row.Phone || row.phone || row.Mobile || '',
        type: mapType(row.Type || row.type || ''),
        city: row.City || row.city || '',
        country: row.Country || row.country || '',
        notes: row.Notes || row.notes || '',
        relationship_strength: mapRelationship(row.Relationship || row.relationship || ''),
      })).filter(c => c.name);
      setParsedData(data);
      setStep('preview');
    } else {
      alert('Please upload a CSV or Excel (.xlsx) file');
    }
  }

  async function handleImport() {
    if (!parsedData.length) return;
    setImporting(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const client of parsedData) {
      try {
        await clientsApi.create({
          ...client,
          user_id: currentUser?.id,
          projects_completed: 0,
          relationship_strength: client.relationship_strength as any,
          type: client.type as any,
        });
        result.success++;
      } catch (err: any) {
        result.failed++;
        result.errors.push(`${client.name}: ${err.message || 'Failed'}`);
      }
    }

    setImportResult(result);
    setImporting(false);
    setStep('complete');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Import Clients</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload a CSV or Excel file</p>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Choose File
                </label>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Required columns:</p>
                <p className="text-sm text-blue-700">Name (required), Email, Company, Phone, Type, City, Country, Relationship, Notes</p>
                <p className="text-sm text-blue-700 mt-1">Type options: architect, interior designer, developer, contractor, end client</p>
                <p className="text-sm text-blue-700">Relationship options: new, developing, strong, key account</p>
                <button onClick={downloadTemplate} className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600">Ready to Import</p>
                  <p className="text-3xl font-bold text-green-700">{parsedData.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600">File</p>
                  <p className="text-sm font-medium text-blue-700 mt-1 truncate">{file?.name}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Company</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Country</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-sm text-gray-500">{i + 1}</td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{c.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{c.email || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{c.company_name || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{c.type}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{c.country || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => { setStep('upload'); setParsedData([]); setFile(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Back
                </button>
                <button onClick={handleImport} disabled={importing} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {importing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Importing...</> : `Import ${parsedData.length} Clients`}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-600">Imported</p>
                  <p className="text-3xl font-bold text-green-700">{importResult.success}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-1" />
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-3xl font-bold text-red-700">{importResult.failed}</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button onClick={() => { setStep('upload'); setParsedData([]); setFile(null); setImportResult(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Import More
                </button>
                <button onClick={onSuccess} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

