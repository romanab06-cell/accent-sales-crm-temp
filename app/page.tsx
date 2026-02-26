'use client';

import { useEffect, useState } from 'react';
import { brandsApi, projectsApi, clientsApi, authApi } from '@/lib/api';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Building2,
  User,
  LogOut
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBrands: 0,
    activeBrands: 0,
    totalProjects: 0,
    totalClients: 0,
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get current user
        const user = authApi.getCurrentUser();
        setCurrentUser(user);

        // Load all stats in parallel
        const [brandsData, projectsData, clientsData] = await Promise.all([
          brandsApi.getDashboardStats(),
          projectsApi.getAll(),
          clientsApi.getAll(),
        ]);

        setStats({
          totalBrands: brandsData?.total_partners || 0,
          activeBrands: brandsData?.active_partners || 0,
          totalProjects: projectsData?.length || 0,
          totalClients: clientsData?.length || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    authApi.logout();
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

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Accent CRM</h1>
              </Link>
              <span className="text-sm text-gray-500 hidden sm:block">Sales & Partner Management</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/brands" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Brands
              </Link>
              <Link href="/projects" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Projects
              </Link>
              <Link href="/clients" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Clients
              </Link>
              <Link href="/communications" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Communications
              </Link>
              <Link href="/tasks" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Tasks
              </Link>
              <Link href="/analytics" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Analytics
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{currentUser.name}</span>
                  {isAdmin && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">Admin</span>
                  )}
                </div>
              )}
              <Link href="/brands/new" className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                + New Brand
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name || 'User'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Brands"
            value={stats.totalBrands}
            icon={<Building2 className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="Active Brands"
            value={stats.activeBrands}
            icon={<Briefcase className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<Users className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<User className="w-8 h-8" />}
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/brands/new"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <Building2 className="w-10 h-10 mx-auto text-gray-400 group-hover:text-blue-600 mb-3 transition-colors" />
              <p className="font-medium text-gray-900 mb-1">Add New Brand</p>
              <p className="text-sm text-gray-500">Create a new brand partner</p>
            </Link>
            <Link
              href="/projects/new"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <Briefcase className="w-10 h-10 mx-auto text-gray-400 group-hover:text-blue-600 mb-3 transition-colors" />
              <p className="font-medium text-gray-900 mb-1">Create Project</p>
              <p className="text-sm text-gray-500">Start a new project</p>
            </Link>
            <Link
              href="/clients/new"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <User className="w-10 h-10 mx-auto text-gray-400 group-hover:text-blue-600 mb-3 transition-colors" />
              <p className="font-medium text-gray-900 mb-1">Add Client</p>
              <p className="text-sm text-gray-500">Add a new client contact</p>
            </Link>
          </div>
        </div>

        {/* Info Box for Admin */}
        {isAdmin && (
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-2">👑 Admin Features</h4>
            <p className="text-sm text-purple-700">
              As an admin, you can see all users' data. Team members will only see their own clients and projects.
              To add team members, we'll need to create a User Management page.
            </p>
          </div>
        )}
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
