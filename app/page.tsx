'use client';

import { AuthWrapper } from '@/components/auth-wrapper';

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
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* ... all your dashboard code ... */}
      </div>
    </AuthWrapper>
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
