'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientsApi, duplicateApi, authApi } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

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
  duplicates: number;
  errors: string[];
}

export default function ImportClientsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedClient[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  }

  async function parseFile(file: File) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(file);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  }

  async function parseCSV(file: File) {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('File is empty or has no data rows');
      return;
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Parse rows
    const data: ParsedClient[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      header.forEach((key, index) => {
        row[key] = values[index] || '';
      });

      // Map to client structure
      const client: ParsedClient = {
        name: row.name || row['client name'] || row['full name'] || '',
        email: row.email || '',
        company_name: row.company || row.company_name || row['company name'] || '',
        phone: row.phone || row.mobile || '',
        type: mapClientType(row.type || 'other'),
        city: row.city || '',
        country: row.country || '',
        notes: row.notes || '',
        relationship_strength: mapRelationship(row.relationship || 'new'),
      };

      if (client.name) {
        data.push(client);
      }
    }

    setParsedData(data);
    setStep('preview');
    await checkForDuplicates(data);
  }

  async function parseExcel(file: File) {
    // Import xlsx library dynamically
    const XLSX = await import('xlsx');
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    const data: ParsedClient[] = jsonData.map((row: any) => ({
      name: row.Name || row.name || row['Client Name'] || row['Full Name'] || '',
      email: row.Email || row.email || '',
      company_name: row.Company || row.company || row.company_name || row['Company Name'] || '',
      phone: row.Phone || row.phone || row.Mobile || row.mobile || '',
      type: mapClientType(row.Type || row.type || 'other'),
      city: row.City || row.city || '',
      country: row.Country || row.country || '',
      notes: row.Notes || row.notes || '',
      relationship_strength: mapRelationship(row.Relationship || row.relationship || 'new'),
    })).filter((client: ParsedClient) => client.name);

    setParsedData(data);
    setStep('preview');
    await checkForDuplicates(data);
  }

  function mapClientType(type: string): string {
    const normalized = type.toLowerCase().trim();
    const mapping: Record<string, string> = {
      'architect': 'architect',
      'interior designer': 'interior_designer',
      'designer': 'interior_designer',
      'developer': 'developer',
      'client': 'end_client',
      'end client': 'end_client',
      'contractor': 'contractor',
    };
    return mapping[normalized] || 'other';
  }

  function mapRelationship(rel: string): string {
    const normalized = rel.toLowerCase().trim();
    const mapping: Record<string, string> = {
      'new': 'new',
      'developing': 'developing',
      'strong': 'strong',
      'key account': 'key_account',
      'key': 'key_account',
    };
    return mapping[normalized] || 'new';
  }

  async function checkForDuplicates(data: ParsedClient[]) {
    const foundDuplicates: any[] = [];
    
    for (const client of data) {
      try {
        const dups = await duplicateApi.findDuplicateClients(
          client.name,
          client.email,
          client.company_name
        );
        
        if (dups && dups.length > 0) {
          foundDuplicates.push({
            import: client,
            existing: dups[0],
          });
        }
      } catch (error) {
        console.error('Error checking duplicates:', error);
      }
    }
    
    setDuplicates(foundDuplicates);
  }

  async function handleImport() {
    if (!parsedData.length) return;

    const confirmed = confirm(
      `Import ${parsedData.length} clients?\n\n` +
      (duplicates.length > 0 
        ? `⚠️ Warning: ${duplicates.length} potential duplicates found.\nThey will be skipped.`
        : ''
      )
    );

    if (!confirmed) return;

    setImporting(true);
    const currentUser = authApi.getCurrentUser();
    
    const result: ImportResult = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
    };

    // Get names of duplicates to skip
    const duplicateNames = new Set(duplicates.map(d => d.import.name.toLowerCase()));

    for (const client of parsedData) {
      // Skip duplicates
      if (duplicateNames.has(client.name.toLowerCase())) {
        result.duplicates++;
        continue;
      }

      try {
        await clientsApi.create({
          ...client,
          user_id: currentUser?.id,
          projects_completed: 0,
        });
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(`${client.name}: ${error.message || 'Unknown error'}`);
      }
    }

    setImportResult(result);
    setImporting(false);
    setStep('complete');
  }

  function downloadTemplate() {
    const csvContent = 'Name,Email,Company,Phone,Type,City,Country,Relationship,Notes\n' +
      'John Doe,john@example.com,Example Co,+1234567890,architect,Dubai,UAE,new,Test client\n' +
      'Jane Smith,jane@example.com,Smith Design,+0987654321,interior designer,London,UK,developing,';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-import-template.csv';
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/clients" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Clients</h1>
              <p className="text-sm text-gray-500">Upload CSV or Excel file to import clients</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload File</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV or Excel file with your client data
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  Choose File
                </label>
                {file && (
                  <p className="text-sm text-green-600 mt-4">Selected: {file.name}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Required Columns</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Name</strong> - Client's full name (required)</li>
                <li><strong>Email</strong> - Email address (optional)</li>
                <li><strong>Company</strong> - Company name (optional)</li>
                <li><strong>Phone</strong> - Phone number (optional)</li>
                <li><strong>Type</strong> - architect, interior designer, developer, etc. (optional)</li>
                <li><strong>City</strong> - City (optional)</li>
                <li><strong>Country</strong> - Country (optional)</li>
                <li><strong>Relationship</strong> - new, developing, strong, key account (optional)</li>
                <li><strong>Notes</strong> - Any notes (optional)</li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Preview & Import</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600">Ready to Import</p>
                  <p className="text-2xl font-bold text-green-700">{parsedData.length - duplicates.length}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-600">Duplicates Found</p>
                  <p className="text-2xl font-bold text-yellow-700">{duplicates.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Total Rows</p>
                  <p className="text-2xl font-bold text-blue-700">{parsedData.length}</p>
                </div>
              </div>

              {duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        {duplicates.length} potential duplicate(s) found
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        These will be skipped during import. Review them below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto max-h-96 border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Company</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((client, index) => {
                      const isDuplicate = duplicates.some(d => d.import.name === client.name);
                      return (
                        <tr key={index} className={isDuplicate ? 'bg-yellow-50' : ''}>
                          <td className="px-4 py-2">
                            {isDuplicate ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{client.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{client.email || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{client.company_name || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{client.type}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setStep('upload');
                    setFile(null);
                    setParsedData([]);
                    setDuplicates([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || parsedData.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : `Import ${parsedData.length - duplicates.length} Clients`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && importResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Import Complete!</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Imported</p>
                  <p className="text-3xl font-bold text-green-700">{importResult.success}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-600">Skipped (Duplicates)</p>
                  <p className="text-3xl font-bold text-yellow-700">{importResult.duplicates}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-3xl font-bold text-red-700">{importResult.failed}</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setStep('upload');
                    setFile(null);
                    setParsedData([]);
                    setDuplicates([]);
                    setImportResult(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Import More
                </button>
                <Link
                  href="/clients"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Clients
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
