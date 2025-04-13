'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RiUserLine,
  RiProjectorLine,
  RiImageLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri'
import Cookies from 'js-cookie'

interface DashboardStats {
  totalStudios: number;
  activeStudios: number;
  totalClients: number;
  totalProjects: number;
  totalRevenue: string;
  subscriptionTiers: Record<string, number>;
  recentStudios: {
    id: string;
    name: string;
    email: string;
    clientCount: number;
    projectCount: number;
    isActive: boolean;
  }[];
}

export default function MasterAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudios: 0,
    activeStudios: 0,
    totalClients: 0,
    totalProjects: 0,
    totalRevenue: '$0',
    subscriptionTiers: {},
    recentStudios: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/master-admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token')
    window.location.href = '/master-admin/login'
  }

  const statsConfig = [
    { name: 'Total Studios', value: stats.totalStudios.toString(), icon: RiUserLine, color: 'bg-blue-500' },
    { name: 'Active Studios', value: stats.activeStudios.toString(), icon: RiProjectorLine, color: 'bg-green-500' },
    { name: 'Total Clients', value: stats.totalClients.toString(), icon: RiImageLine, color: 'bg-purple-500' },
    { name: 'Total Revenue', value: stats.totalRevenue, icon: RiMoneyDollarCircleLine, color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Master Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsConfig.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">{stat.name}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Studios Section */}
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Studios</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-center py-3 px-4">Clients</th>
                      <th className="text-center py-3 px-4">Projects</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentStudios.length > 0 ? (
                      stats.recentStudios.map((studio) => (
                        <tr key={studio.id} className="border-b border-gray-700">
                          <td className="py-3 px-4">{studio.name}</td>
                          <td className="py-3 px-4">{studio.email}</td>
                          <td className="py-3 px-4 text-center">{studio.clientCount}</td>
                          <td className="py-3 px-4 text-center">{studio.projectCount}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${studio.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {studio.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-400">
                          No studios found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subscription Tiers Section */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Subscription Distribution</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.subscriptionTiers).map(([tier, count]) => (
                  <div key={tier} className="bg-gray-700 rounded-lg p-4">
                    <div className="text-lg font-medium">{tier}</div>
                    <div className="text-2xl font-bold mt-2">{count} studios</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 