'use client';

import { useEffect, useState } from 'react';
import { brandsApi } from '@/lib/api';
import { Brand } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Filter, Building2, ArrowLeft, X, Upload, Download, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    deal_stage: '',
    priority: '',
    project_sector: '',
    design_category: '',
    country_of_origin: '',
    has_discount: '',
    has_dealer_access: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, brands]);

  async function exportToExcel() {
    const XLSX = await import("xlsx");
    const data = filteredBrands.map(b => ({
      Name: b.name,
      Status: b.status,
      "Deal Stage": b.deal_stage,
      Country: b.country || "",
      "Sales Owner": b.sales_owner || "",
      Website: b.website || "",
      Comments: b.comments || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brands");
    XLSX.writeFile(wb, "brands.xlsx");
  }
  async function loadBrands() {
    try {
      setLoading(true);
      const data = await brandsApi.getAll();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...brands];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(brand => 
        brand.name.toLowerCase().includes(searchLower) ||
        brand.type?.toLowerCase().includes(searchLower) ||
        brand.country?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(brand => brand.status === filters.status);
    }

    // Deal stage filter
    if (filters.deal_stage) {
      filtered = filtered.filter(brand => brand.deal_stage === filters.deal_stage);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(brand => brand.priority === parseInt(filters.priority));
    }

    // Project sector filter
    if (filters.project_sector) {
      filtered = filtered.filter(brand => 
        brand.project_sectors?.includes(filters.project_sector)
      );
    }

    // Design category filter
    if (filters.design_category) {
      filtered = filtered.filter(brand => 
        brand.design_categories?.includes(filters.design_category)
      );
    }

    // Country of origin filter
    if (filters.country_of_origin) {
      filtered = filtered.filter(brand => 
        brand.country_of_origin?.toLowerCase().includes(filters.country_of_origin.toLowerCase())
      );
    }

    // Has discount filter
    if (filters.has_discount === 'yes') {
      filtered = filtered.filter(brand => {
        // This requires loading deal data - we'll check in the brand detail
        // For now, just show all brands
        return true;
      });
    }

    // Dealer access filter
    if (filters.has_dealer_access) {
      filtered = filtered.filter(brand => {
        // This also requires deal data
        return true;
      });
    }

    setFilteredBrands(filtered);
  }

  function clearFilters() {
    setFilters({
      search: '',
      status: '',
      deal_stage: '',
      priority: '',
      project_sector: '',
      design_category: '',
      country_of_origin: '',
      has_discount: '',
      has_dealer_access: '',
    });
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  // Get unique values for dropdown filters
  const uniqueCountries = Array.from(new Set(brands.map(b => b.country_of_origin).filter(Boolean))).sort();
  const uniqueSectors = Array.from(new Set(brands.flatMap(b => b.project_sectors || []))).sort();
  const uniqueCategories = Array.from(new Set(brands.flatMap(b => b.design_categories || []))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Brand Partners</h1>
                <p className="text-sm text-gray-500">
                  {filteredBrands.length} of {brands.length} brands
                  {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
<button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">Import</button>
              <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Export Excel</button>
              <Link href="/brands/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                + New Brand
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search brands, type, country..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="prospect">Prospect</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="contract">Contract</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="not_relevant">Not Relevant</option>
                </select>
              </div>

              {/* Deal Stage Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Stage</label>
                <select
                  value={filters.deal_stage}
                  onChange={(e) => setFilters({ ...filters, deal_stage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Stages</option>
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="1">High (1)</option>
                  <option value="2">Medium (2)</option>
                  <option value="3">Low (3)</option>
                </select>
              </div>

              {/* Design Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Design Category</label>
                <select
                  value={filters.design_category}
                  onChange={(e) => setFilters({ ...filters, design_category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Project Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Sector</label>
                <select
                  value={filters.project_sector}
                  onChange={(e) => setFilters({ ...filters, project_sector: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sectors</option>
                  {uniqueSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Country of Origin Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
                <select
                  value={filters.country_of_origin}
                  onChange={(e) => setFilters({ ...filters, country_of_origin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Brands Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-500 mb-4">
              {activeFilterCount > 0 
                ? 'Try adjusting your filters or clear all filters to see more results'
                : 'Get started by adding your first brand partner'
              }
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={clearFilters}
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/brands/new" className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                + Add Brand
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{brand.name}</h3>
                    {brand.priority && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        brand.priority === 1 ? 'bg-red-100 text-red-700' :
                        brand.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        P{brand.priority}
                      </span>
                    )}
                  </div>

                  {brand.type && (
                    <p className="text-sm text-gray-600 mb-3">{brand.type}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      brand.status === 'active' ? 'bg-green-100 text-green-700' :
                      brand.status === 'negotiation' ? 'bg-blue-100 text-blue-700' :
                      brand.status === 'prospect' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {brand.status}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                      {brand.deal_stage}
                    </span>
                  </div>

                  {/* Show categories */}
                  {brand.design_categories && brand.design_categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {brand.design_categories.slice(0, 3).map(cat => (
                        <span key={cat} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                          {cat}
                        </span>
                      ))}
                      {brand.design_categories.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                          +{brand.design_categories.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Show sectors */}
                  {brand.project_sectors && brand.project_sectors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {brand.project_sectors.slice(0, 2).map(sector => (
                        <span key={sector} className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded">
                          {sector}
                        </span>
                      ))}
                      {brand.project_sectors.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded">
                          +{brand.project_sectors.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {brand.country_of_origin && (
                    <p className="text-xs text-gray-500 mb-2">
                      Origin: {brand.country_of_origin}
                    </p>
                  )}

                  {brand.last_contact_date && (
                    <p className="text-xs text-gray-400">
                      Last contact: {new Date(brand.last_contact_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      {showImportModal && (
        <BrandImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { setShowImportModal(false); loadBrands(); }}
          existingBrands={brands}
        />
      )}
    </div>
  );
}

function BrandImportModal({ onClose, onSuccess, existingBrands }: {
  onClose: () => void;
  onSuccess: () => void;
  existingBrands: Brand[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    skipped: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');

  function downloadTemplate() {
    const csv = [
      'Name,Website,Country,Status,Deal Stage,Priority,Sales Owner,Comments',
      'Flos,https://flos.com,Italy,prospect,lead,2,Roman,Lighting brand',
      'Minotti,https://minotti.com,Italy,prospect,lead,1,,Furniture brand',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brands-template.csv';
    a.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const ext = f.name.split('.').pop()?.toLowerCase();
    let rows: any[] = [];

    if (ext === 'csv') {
      const text = await f.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { alert('No data rows found'); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
        if (row.name) rows.push(row);
      }
    } else if (ext === 'xlsx' || ext === 'xls') {
      const XLSX = await import('xlsx');
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = (XLSX.utils.sheet_to_json(ws) as any[]).filter((r: any) => r.Name || r.name);
    } else {
      alert('Please upload a CSV or Excel file');
      return;
    }

    const normalized = rows.map(r => ({
      name: r.Name || r.name || '',
      website: r.Website || r.website || '',
      country: r.Country || r.country || '',
      status: (r.Status || r.status || 'prospect').toLowerCase(),
      deal_stage: (r['Deal Stage'] || r.deal_stage || 'lead').toLowerCase().replace(' ', '_'),
      priority: parseInt(r.Priority || r.priority || '2') || 2,
      sales_owner: r['Sales Owner'] || r.sales_owner || '',
      comments: r.Comments || r.comments || '',
      hide: false,
      date_added: new Date().toISOString().split('T')[0],
    }));

    const existingNames = existingBrands.map(b => b.name.toLowerCase().trim());
    const dups = normalized
      .filter(r => existingNames.includes(r.name.toLowerCase().trim()))
      .map(r => r.name);

    setParsedData(normalized);
    setDuplicates(dups);
    setStep('preview');
  }

  async function handleImport() {
    setImporting(true);
    const result = { success: 0, skipped: 0, failed: 0, errors: [] as string[] };
    const dupNames = new Set(duplicates.map(d => d.toLowerCase().trim()));

    for (const brand of parsedData) {
      if (dupNames.has(brand.name.toLowerCase().trim())) {
        result.skipped++;
        continue;
      }
      try {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.from('brands').insert(brand);
        if (error) throw error;
        result.success++;
      } catch (err: any) {
        result.failed++;
        result.errors.push(brand.name + ': ' + (err.message || 'Failed'));
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
          <h2 className="text-xl font-bold text-gray-900">Import Brands</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload a CSV or Excel file</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="brand-file-upload"
                />
                <label
                  htmlFor="brand-file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Choose File
                </label>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Required columns:</p>
                <p className="text-sm text-blue-700">
                  Name (required), Website, Country, Status, Deal Stage, Priority, Sales Owner, Comments
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Status options: prospect, negotiation, contract, active, inactive
                </p>
                <p className="text-sm text-blue-700">
                  Deal Stage options: lead, qualified, proposal, negotiation, won, lost
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600">New Brands</p>
                  <p className="text-3xl font-bold text-green-700">{parsedData.length - duplicates.length}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-600">Duplicates (skip)</p>
                  <p className="text-3xl font-bold text-yellow-700">{duplicates.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600">Total Rows</p>
                  <p className="text-3xl font-bold text-blue-700">{parsedData.length}</p>
                </div>
              </div>

              {duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Already in CRM (will be skipped):
                  </p>
                  <p className="text-sm text-yellow-700">{duplicates.join(', ')}</p>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Country</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((b, i) => {
                      const isDup = duplicates.map(d => d.toLowerCase()).includes(b.name.toLowerCase());
                      return (
                        <tr key={i} className={isDup ? 'bg-yellow-50' : ''}>
                          <td className="px-3 py-2">
                            {isDup ? (
                              <span className="text-xs text-yellow-600 font-medium">Skip</span>
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">{b.name}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{b.country || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{b.deal_stage}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setStep('upload'); setParsedData([]); setDuplicates([]); setFile(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || parsedData.length === duplicates.length}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import ' + (parsedData.length - duplicates.length) + ' Brands'}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-600">Imported</p>
                  <p className="text-3xl font-bold text-green-700">{importResult.success}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-600">Skipped</p>
                  <p className="text-3xl font-bold text-yellow-700">{importResult.skipped}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-1" />
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-3xl font-bold text-red-700">{importResult.failed}</p>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setStep('upload'); setParsedData([]); setDuplicates([]); setFile(null); setImportResult(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Import More
                </button>
                <button
                  onClick={onSuccess}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
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
