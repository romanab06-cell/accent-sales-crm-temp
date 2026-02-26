'use client';

import { useEffect, useState } from 'react';
import { brandsApi } from '@/lib/api';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Building2,
  User,
  LogOut
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const statsData = await brandsApi.getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem('accent_user');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Accent CRM</h1>
              <p className="ml-4 text-sm text-gray-500">Sales & Partner Management</p>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link href="/brands" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Brands
              </Link>
              <Link href="/projects" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Projects
              </Link>
              <Link href="/clients" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Clients
              </Link>
              <Link href="/communications" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Communications
              </Link>
              <Link href="/tasks" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Tasks
              </Link>
              <Link href="/analytics" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Analytics
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href="/brands/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                + New Brand
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 inline mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">Welcome to your CRM overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Brands"
            value={stats?.totalBrands || 0}
            icon={<Building2 className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="Active Brands"
            value={stats?.activeBrands || 0}
            icon={<Briefcase className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="Total Projects"
            value={0}
            icon={<Users className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Total Clients"
            value={0}
            icon={<User className="w-8 h-8" />}
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/brands/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Building2 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-900">Add New Brand</p>
              <p className="text-sm text-gray-500">Create a new brand partner</p>
            </Link>
            <Link
              href="/projects/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Briefcase className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-900">Create Project</p>
              <p className="text-sm text-gray-500">Start a new project</p>
            </Link>
            <Link
              href="/clients/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <User className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-900">Add Client</p>
              <p className="text-sm text-gray-500">Add a new client</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

