'use client';

import { useEffect, useState } from 'react';
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

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
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
    relationship_strength: 'new',
  });

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    try {
      const client = await clientsApi.getById(params.id);
      setFormData({
        name: client.name || '',
        type: client.type || 'other',
        company_name: client.company_name || '',
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        country: client.country || '',
        city: client.city || '',
        design_style_preferences: client.design_style_preferences || [],
        preferred_brands: (client.preferred_brands || []).join(', '),
        budget_range: client.budget_range || '',
        communication_style: client.communication_style || '',
        notes: client.notes || '',
        relationship_strength: client.relationship_strength || 'new',
      });
    } catch (error) {
      console.error('Error loading client:', error);
      alert('Failed to load client');
    } finally {
      setLoading(false);
    }
  }

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
    setSaving(true);
    try {
      await clientsApi.update(params.id, {
        name: formData.name,
        type: formData.type as any,
        company_name: formData.company_name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        design_style_preferences: formData.design_style_preferences.length > 0 ? formData.design_style_preferences : undefined,
        preferred_brands: formData.preferred_brands ? formData.preferred_brands.split(',').map(b => b.trim()) : undefined,
        budget_range: formData.budget_range as any || undefined,
        communication_style: formData.communication_style || undefined,
        notes: formData.notes || undefined,
        relationship_strength: formData.relationship_strength as any,
      });
      router.push(`/clients/${params.id}`);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/clients/${params.id}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
              <p className="text-sm text-gray-500">Update client information</p>
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
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
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
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
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Brands</label>
                <input type="text" name="preferred_brands" value={formData.preferred_brands} onChange={handleChange} placeholder="e.g., Flos, B&B Italia (comma separated)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <select name="budget_range" value={formData.budget_range} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
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
                <textarea name="communication_style" value={formData.communication_style} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Relationship */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Relationship</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Strength</label>
                <select name="relationship_strength" value={formData.relationship_strength} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="new">New</option>
                  <option value="developing">Developing</option>
                  <option value="strong">Strong</option>
                  <option value="key_account">Key Account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href={`/clients/${params.id}`} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
