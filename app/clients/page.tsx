'use client';

import { useEffect, useState } from 'react';
import { clientsApi, type Client } from '@/lib/api';
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
  Users
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, typeFilter, relationshipFilter]);

  async function loadClients() {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  function filterClients() {
    let filtered = [...clients];

    // Search filter
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

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Relationship filter
    if (relationshipFilter !== 'all') {
      filtered = filtered.filter(c => c.relationship_strength === relationshipFilter);
    }

    setFilteredClients(filtered);
  }

  function getTypeCounts() {
    const counts: Record<string, number> = {
      all: clients.length,
      architect: 0,
      interior_designer: 0,
      developer: 0,
      key_account: 0,
    };

    clients.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
      if (c.relationship_strength === 'key_account') {
        counts.key_account++;
      }
    });

    return counts;
  }

  const typeCounts = getTypeCounts();

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your architects, designers, and clients
                </p>
              </div>
            </div>
            <Link
              href="/clients/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Client
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
                <p className="text-2xl font-bold text-purple-600 mt-1">{typeCounts.architect || 0}</p>
              </div>
              <Building2 className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interior Designers</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{typeCounts.interior_designer || 0}</p>
              </div>
              <User className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Key Accounts</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{typeCounts.key_account || 0}</p>
              </div>
              <div className="w-10 h-10 text-yellow-600 flex items-center justify-center text-2xl">★</div>
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
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
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
              </div>

              {/* Relationship Filter */}
              <div>
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
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {client.name}
                        </Link>
                        {client.company_name && (
                          <p className="text-xs text-gray-500 mt-1">{client.company_name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {CLIENT_TYPE_LABELS[client.type as keyof typeof CLIENT_TYPE_LABELS]}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                                {client.phone}
                              </a>
                            </div>
                          )}
                          {!client.email && !client.phone && (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {client.city && client.country ? (
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{client.city}, {client.country}</span>
                          </div>
                        ) : client.country ? (
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{client.country}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          RELATIONSHIP_COLORS[client.relationship_strength as keyof typeof RELATIONSHIP_COLORS]
                        }`}>
                          {RELATIONSHIP_LABELS[client.relationship_strength as keyof typeof RELATIONSHIP_LABELS]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {client.projects_completed > 0 ? (
                          <span>{client.projects_completed} completed</span>
                        ) : (
                          <span className="text-gray-400">No projects</span>
                        )}
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
                {searchQuery || typeFilter !== 'all' || relationshipFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first client'}
              </p>
              {!searchQuery && typeFilter === 'all' && relationshipFilter === 'all' && (
                <Link
                  href="/clients/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create First Client
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredClients.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        )}
      </main>
    </div>
  );
}
