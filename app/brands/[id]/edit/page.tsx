'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { brandsApi, contactsApi, dealsApi } from '@/lib/api';
import { BrandWithRelations } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditBrandPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brand, setBrand] = useState<BrandWithRelations | null>(null);
  
  // Contact states
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  // Form data state
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    website: string;
    country: string;
    country_of_origin: string;
    status: 'prospect' | 'negotiation' | 'contract' | 'active' | 'inactive' | 'not_relevant';
    deal_stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
    priority: 1 | 2 | 3 | undefined;
    comments: string;
    project_sectors: string[];
    design_categories: string[];
    discount: string;
    payment_terms: string;
    shipping_terms: string;
    dealer_access: string;
    freight_free_limit: string;
  }>({
    name: '',
    type: '',
    website: '',
    country: '',
    country_of_origin: '',
    status: 'prospect',
    deal_stage: 'lead',
    priority: undefined,
    comments: '',
    project_sectors: [],
    design_categories: [],
    discount: '',
    payment_terms: '',
    shipping_terms: '',
    dealer_access: '',
    freight_free_limit: '',
  });

  useEffect(() => {
    loadBrand();
  }, [params.id]);

  async function loadBrand() {
    try {
      const data = await brandsApi.getById(params.id);
      setBrand(data);
      
      // Populate form with existing data
      setFormData({
        name: data.name || '',
        type: data.type || '',
        website: data.website || '',
        country: data.country || '',
        country_of_origin: data.country_of_origin || '',
        status: data.status,
        deal_stage: data.deal_stage,
        priority: data.priority,
        comments: data.comments || '',
        project_sectors: data.project_sectors || [],
        design_categories: data.design_categories || [],
        
        discount: data.deal?.discount ? (data.deal.discount * 100).toString() : '',
        payment_terms: data.deal?.payment_terms || '',
        shipping_terms: data.deal?.shipping_terms || '',
        dealer_access: data.deal?.dealer_access || '',
        freight_free_limit: data.deal?.freight_free_limit?.toString() || '',
      });
    } catch (error) {
      console.error('Error loading brand:', error);
      alert('Failed to load brand');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddContact() {
    if (!newContact.name.trim() || !newContact.email.trim()) {
      alert('Name and email are required');
      return;
    }

    try {
      await contactsApi.create({
        brand_id: params.id,
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone || undefined,
        role: newContact.role || undefined,
        is_primary: !brand?.contacts || brand.contacts.length === 0,
      });

      setNewContact({ name: '', email: '', phone: '', role: '' });
      setShowAddContact(false);
      loadBrand(); // Reload to show new contact
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? (value === '' ? undefined : parseInt(value) as 1 | 2 | 3) : value
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
    
    if (!formData.name.trim()) {
      alert('Brand name is required');
      return;
    }

    setSaving(true);
    
    try {
      // Update brand
      await brandsApi.update(params.id, {
        name: formData.name,
        type: formData.type || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        country_of_origin: formData.country_of_origin || undefined,
        status: formData.status,
        deal_stage: formData.deal_stage,
        priority: formData.priority,
        comments: formData.comments || undefined,
        project_sectors: formData.project_sectors.length > 0 ? formData.project_sectors : undefined,
        design_categories: formData.design_categories.length > 0 ? formData.design_categories : undefined,
      });

      // Update deal if deal fields exist
      if (formData.discount || formData.payment_terms || formData.shipping_terms) {
        await dealsApi.createOrUpdate(params.id, {
          discount: formData.discount ? parseFloat(formData.discount) / 100 : undefined,
          payment_terms: formData.payment_terms || undefined,
          shipping_terms: formData.shipping_terms || undefined,
          dealer_access: formData.dealer_access || undefined,
          freight_free_limit: formData.freight_free_limit ? parseFloat(formData.freight_free_limi