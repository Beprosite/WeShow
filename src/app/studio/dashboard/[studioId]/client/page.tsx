'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import {
  RiBuilding4Line,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCloseLine,
  RiTeamLine,
  RiBarChartBoxLine
} from 'react-icons/ri'

// Types
type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  studioId: string;
  isActive: boolean;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  clientDetails: {
    industry: string;
    size: string;
    website: string;
    notes: string;
  };
  projects?: { id: string }[];
  createdAt: string;
  updatedAt: string;
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  clientDetails: {
    industry: string;
    size: string;
    website: string;
    notes: string;
  };
}

// Modal Component
function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-gray-800 rounded-xl p-6">
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

// Main Component
export default function ClientPage() {
  const params = useParams()
  const studioId = params.studioId as string
  const [client, setclient] = useState<Client[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    clientDetails: {
      industry: '',
      size: '',
      website: '',
      notes: ''
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchclient()
  }, [studioId])

  const fetchclient = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/client?studioId=${studioId}`)
      if (!response.ok) throw new Error('Failed to fetch client')
      const data = await response.json()
      setclient(data)
    } catch (error) {
      console.error('Error fetching client:', error)
      setError('Failed to load client')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/client'
      const method = selectedClient ? 'PUT' : 'POST'
      const body = selectedClient
        ? { id: selectedClient.id, ...formData }
        : { studioId, ...formData }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error('Failed to save client')
      
      await fetchclient() // Refresh the list
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedClient(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        isActive: true,
        contactPerson: {
          name: '',
          email: '',
          phone: '',
          position: ''
        },
        clientDetails: {
          industry: '',
          size: '',
          website: '',
          notes: ''
        }
      })
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save client')
    }
  }

  const handleDelete = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all associated projects.')) {
      try {
        const response = await fetch(`/api/client?id=${clientId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Failed to delete client')
        await fetchclient() // Refresh the list
      } catch (error) {
        console.error('Error deleting client:', error)
        alert('Failed to delete client')
      }
    }
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      isActive: client.isActive,
      contactPerson: client.contactPerson,
      clientDetails: client.clientDetails
    })
    setIsEditModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
        >
          <RiAddLine />
          Add Client
        </button>
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : client.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No client found. Add your first client to get started.
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Contact Person</th>
                  <th className="text-left py-3 px-4">Industry</th>
                  <th className="text-left py-3 px-4">Projects</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {client.map((client) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/20"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          {client.name[0]}
                        </div>
                        <div>
                          <div>{client.name}</div>
                          <div className="text-sm text-gray-400">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>{client.contactPerson.name}</div>
                      <div className="text-sm text-gray-400">{client.contactPerson.position}</div>
                    </td>
                    <td className="py-4 px-4">{client.clientDetails.industry}</td>
                    <td className="py-4 px-4">{client.projects?.length || 0}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        client.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <RiEditLine className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <RiDeleteBinLine className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedClient(null)
          setFormData({
            name: '',
            email: '',
            phone: '',
            isActive: true,
            contactPerson: {
              name: '',
              email: '',
              phone: '',
              position: ''
            },
            clientDetails: {
              industry: '',
              size: '',
              website: '',
              notes: ''
            }
          })
        }}
      >
        <div className="relative">
          <button
            onClick={() => {
              setIsAddModalOpen(false)
              setIsEditModalOpen(false)
            }}
            className="absolute right-0 top-0 p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <RiCloseLine size={20} />
          </button>
          
          <h2 className="text-xl font-semibold mb-6">
            {isEditModalOpen ? 'Edit Client' : 'Add New Client'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-400">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-400">Contact Person</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson.position}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, position: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactPerson.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPerson.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-400">Client Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.clientDetails.industry}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientDetails: { ...formData.clientDetails, industry: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.clientDetails.size}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientDetails: { ...formData.clientDetails, size: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.clientDetails.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientDetails: { ...formData.clientDetails, website: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.clientDetails.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientDetails: { ...formData.clientDetails, notes: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                {selectedClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}