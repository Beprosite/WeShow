'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  RiUserLine,
  RiProjectorLine,
  RiImageLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';

const stats = [
  { name: 'Total Clients', value: '12', icon: RiUserLine, color: 'bg-blue-500' },
  { name: 'Active Projects', value: '24', icon: RiProjectorLine, color: 'bg-green-500' },
  { name: 'Media Files', value: '164', icon: RiImageLine, color: 'bg-purple-500' },
  { name: 'Revenue', value: '$12.4k', icon: RiMoneyDollarCircleLine, color: 'bg-yellow-500' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
    </div>
  );
}