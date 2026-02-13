'use client';

import { useEffect, useState } from 'react';
import { communicationsApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
  }, []);

  async function loadCommunications() {
    try {
      const data = await communicationsApi.getRecent(100);
      setCommunications(data);
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
              <p className="text-sm text-gray-500">{communications.length} total communications</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading communications...</p>
          </div>
        ) : communications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communications yet</h3>
            <p className="text-gray-500">Start logging your interactions with brand partners</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y">
              {communications.map((comm) => (
                <Link key={comm.id} href={`/brands/${comm.brand_id}`}>
                  <div className="p-6 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {comm.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                        {comm.type === 'phone' && <Phone className="w-5 h-5 text-green-600" />}
                        {comm.type === 'meeting' && <Calendar className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {comm.brands?.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(comm.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {comm.subject && (
                          <p className="text-sm font-medium text-gray-700 mb-1">{comm.subject}</p>
                        )}
                        {comm.summary && (
                          <p className="text-sm text-gray-600 mb-2">{comm.summary}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">{comm.type}</span>
                          {comm.created_by && <span>By: {comm.created_by}</span>}
                          {comm.follow_up_required && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                              Follow-up required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}