'use client';

import { useEffect, useState } from 'react';
import { brandsApi, communicationsApi, tasksApi } from '@/lib/api';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentComms, setRecentComms] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, commsData, tasksData] = await Promise.all([
          brandsApi.getDashboardStats(),
          communicationsApi.getRecent(5),
          tasksApi.getUpcoming(5),
        ]);

        setStats(statsData);
        setRecentComms(commsData);
        setUpcomingTasks(tasksData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accent CRM</h1>
              <p className="text-sm text-gray-500">Sales & Partner Management</p>
            </div>
            <nav className="flex gap-4">
              <Link href="/brands" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Brands
              </Link>
              <Link href="/communications" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Communications
              </Link>
              <Link href="/tasks" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Tasks
              </Link>
              <Link href="/brands/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              <Link href="/analytics" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
    Analytics
  </Link>
                + New Brand
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Partners"
            value={stats?.total_partners || 0}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Active Partners"
            value={stats?.active_partners || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="In Negotiation"
            value={stats?.in_negotiation || 0}
            icon={<Briefcase className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Overdue Follow-ups"
            value={stats?.overdue_followups || 0}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Deal Pipeline
            </h2>
            <div className="space-y-3">
              {stats?.by_stage && Object.entries(stats.by_stage).map(([stage, count]: [string, any]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Status Breakdown
            </h2>
            <div className="space-y-3">
              {stats?.by_status && Object.entries(stats.by_status).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Communications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Communications
              </h2>
            </div>
            <div className="divide-y">
              {recentComms.length > 0 ? (
                recentComms.map((comm) => (
                  <div key={comm.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      {comm.type === 'email' && <Mail className="w-4 h-4 text-gray-400 mt-1" />}
                      {comm.type === 'phone' && <Phone className="w-4 h-4 text-gray-400 mt-1" />}
                      {comm.type === 'meeting' && <Calendar className="w-4 h-4 text-gray-400 mt-1" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{comm.brands?.name}</p>
                        <p className="text-sm text-gray-600 truncate">{comm.subject || comm.summary}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comm.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No communications yet
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Tasks
              </h2>
            </div>
            <div className="divide-y">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.brands?.name}</p>
                        {task.due_date && (
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No upcoming tasks
                </div>
              )}
            </div>
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
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
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
