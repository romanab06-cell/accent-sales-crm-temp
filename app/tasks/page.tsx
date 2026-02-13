'use client';

import { useEffect, useState } from 'react';
import { tasksApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await tasksApi.getUpcoming(200);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending' || task.status === 'in_progress';
    if (filter === 'overdue') return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                <p className="text-sm text-gray-500">{filteredTasks.length} tasks</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'Create tasks from brand detail pages' : `No ${filter} tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              
              return (
                <Link key={task.id} href={`/brands/${task.brand_id}`}>
                  <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                    isOverdue ? 'border-l-4 border-red-500' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : isOverdue ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{task.brands?.name}</p>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {task.due_date && (
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                            {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}