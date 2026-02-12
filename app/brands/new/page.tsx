'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { brandsApi, contactsApi, dealsApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Brand fields
    name: '',
    type: '',
    website: '',
    country: '',
    country_of_origin: '',
  project_sectors: [] as string[],
  design_categories: [] as string[],
    status: 'prospect' as const,
    deal_stage: 'lead' as const,
    priority: undefined as number | undefined,
    comments: '',
    
    // Contact fields (required)
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_role: '',
    
    // Deal fields (required)
    discount: '',
    payment_terms: '',
    shipping_terms: '',
    dealer_access: '',
    freight_free_limit: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSectorToggle = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      project_sectors: prev.project_sectors.includes(sector)
        ? prev.project_sectors.filter(s => s !== sector)
        : [...prev.project_sectors, sector]
    }));
  };
  
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      design_categories: prev.design_categories.includes(category)
        ? prev.design_categories.filter(c => c !== category)
        : [...prev.design_categories, category]
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Brand name is required');
      return;
    }
    if (!formData.contact_name.trim() || !formData.contact_email.trim()) {
      alert('Contact name and email are required');
      return;
    }
    if (!formData.discount || !formData.payment_terms || !formData.shipping_terms) {
      alert('Discount, payment terms, and shipping terms are required');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create brand
      const brand = await brandsApi.create({
        name: formData.name,
        type: formData.type || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        country_of_origin: formData.country_of_origin || undefined,
  project_sectors: formData.project_sectors.length > 0 ? formData.project_sectors : undefined,
  design_categories: formData.design_categories.length > 0 ? formData.design_categories : undefined,
        status: formData.status,
        deal_stage: formData.deal_stage,
        priority: formData.priority || undefined,
        comments: formData.comments || undefined,
      });

      // 2. Create primary contact
      await contactsApi.create({
        brand_id: brand.id,
        name: formData.contact_name,
        email: formData.contact_email,
        phone: formData.contact_phone || undefined,
        role: formData.contact_role || undefined,
        is_primary: true,
      });

      // 3. Create deal
      await dealsApi.createOrUpdate(brand.id, {
        discount: parseFloat(formData.discount) / 100, // Convert percentage to decimal
        payment_terms: formData.payment_terms,
        shipping_terms: formData.shipping_terms,
        dealer_access: formData.dealer_access || undefined,
        freight_free_limit: formData.freight_free_limit ? parseFloat(formData.freight_free_limit) : undefined,
      });

      // Redirect to brand detail page
      router.push(`/brands/${brand.id}`);
    } catch (error) {
      console.error('Error creating brand:', error);
      alert('Failed to create brand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/brands" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Brand Partner</h1>
              <p className="text-sm text-gray-500">Add a new brand to your CRM</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., &Tradition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type/Category</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Furniture/Lighting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Denmark"
                />
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
  <input
    type="text"
    name="country_of_origin"
    value={formData.country_of_origin}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="e.g., Italy, Denmark, Finland"
  />
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Design Categories
  </label>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
    {['Furniture', 'Lighting', 'Accessories', 'Textiles', 'Rugs', 'Art', 'Home Decor', 'Tableware'].map(category => (
      <label key={category} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.design_categories.includes(category)}
          onChange={() => handleCategoryToggle(category)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{category}</span>
      </label>
    ))}
  </div>
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Project Sectors <span className="text-gray-500 text-xs">(Select all that apply)</span>
  </label>
  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
    {['Residential', 'Hospitality', 'Retail', 'Workspace', 'Public Spaces', 'Marine', 'Airports', 'Healthcare', 'Education', 'Entertainment'].map(sector => (
      <label key={sector} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.project_sectors.includes(sector)}
          onChange={() => handleSectorToggle(sector)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{sector}</span>
      </label>
    ))}
  </div>
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="prospect">Prospect</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="contract">Contract</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="not_relevant">Not Relevant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Stage</label>
                <select
                  name="deal_stage"
                  value={formData.deal_stage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  <option value="1">1 - High</option>
                  <option value="2">2 - Medium</option>
                  <option value="3">3 - Low</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments/Notes</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
                <input
                  type="text"
                  name="contact_role"
                  value={formData.contact_role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Sales Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Deal Terms */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Prepayment">Prepayment</option>
                  <option value="Net 14">Net 14</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="EX WORKS">EX WORKS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Terms <span className="text-red-500">*</span>
                </label>
                <select
                  name="shipping_terms"
                  value={formData.shipping_terms}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="EXW">EXW (Ex Works)</option>
                  <option value="DAP">DAP (Delivered at Place)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                  <option value="FOB">FOB (Free on Board)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Access</label>
                <select
                  name="dealer_access"
                  value={formData.dealer_access}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Yes, through Partner">Yes, through Partner</option>
                  <option value="Negotiation">Under Negotiation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freight Free Limit (€)</label>
                <input
                  type="number"
                  name="freight_free_limit"
                  value={formData.freight_free_limit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/brands"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Brand
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
