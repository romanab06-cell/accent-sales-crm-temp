'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientsApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const DESIGN_STYLES = [
  'Modern', 'Contemporary', 'Minimalist', 'Mid-Century Modern', 
  'Industrial', 'Scandinavian', 'Japandi', 'Art Deco',
  'Traditional', 'Transitional', 'Coastal', 'Mediterranean',
  'Bohemian', 'Eclectic', 'Luxury', 'Classic European'
];

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'architect' as const,
    company_name: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    city: '',
    design_style_preferences: [] as string[],
    preferred_brands: '',
    budget_range: '',
    communication_style: '',
    notes: '',
    relationship_strength: 'new' as const,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleStyleToggle(style: string) {
    setFormData(prev => {
      const current = prev.design_style_preferences;
      const updated = current.includes(style)
        ? current.filter(s => s !== style)
        : [...current, style];
      return { ...prev, design_style_preferences: updated };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Client name is required');
      return;
    }

    setLoading(true);

    try {
      const clientData: any = {
        name: formData.name,
        type: formData.type,
        company_name: formData.company_name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        design_style_preferences: formData.design_style_preferences.length > 0 ? formData.design_style_preferences : undefined,
        preferred_brands: formData.preferred_brands ? formData.preferred_brands.split(',').map(b => b.trim()) : undefined,
        budget_range: formData.budget_range || undefined,
        communication_style: formData.communication_style || undefined,
        notes: formData.notes || undefined,
        relationship_strength: formData.relationship_strength,
        projects_completed: 0,
      };

      const newClient = await clientsApi.create(clientData);
      router.push(`/clients/${newClient.id}`);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
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
            <Link href="/clients" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Client</h1>
              <p className="text-sm text-gray-500">Add a new client to your database</p>
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
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Sarah Al-Mansouri"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="architect">Architect</option>
                  <option value="interior_designer">Interior Designer</option>
                  <option value="developer">Developer</option>
                  <option value="end_client">End Client</option>
                  <option value="contractor">Contractor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g., Luxe Interiors Dubai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+971 50 123 4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Design Style Preferences</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DESIGN_STYLES.map(style => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.design_style_preferences.includes(style)}
                        onChange={() => handleStyleToggle(style)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Brands</label>
                <input
                  type="text"
                  name="preferred_brands"
                  value={formData.preferred_brands}
                  onChange={handleChange}
                  placeholder="e.g., Flos, B&B Italia, Minotti (comma separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter brand names separated by commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typical Budget Range</label>
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
                  <option value="1m_plus">€1M+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Communication Style</label>
                <textarea
                  name="communication_style"
                  value={formData.communication_style}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g., Prefers email, responds quickly, likes detailed presentations..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Relationship */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Relationship Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Strength</label>
                <select
                  name="relationship_strength"
                  value={formData.relationship_strength}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="developing">Developing</option>
                  <option value="strong">Strong</option>
                  <option value="key_account">Key Account</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Internal notes about the client, their preferences, project history, etc..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href="/clients"
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
                  Create Client
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
