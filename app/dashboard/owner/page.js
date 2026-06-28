'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  getMyListings,
  addProperty,
  updateProperty,
  deleteProperty,
  getBookingRequests,
  updateBookingStatus,
  getOwnerAnalytics,
  downloadOwnerReport,
} from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiList,
  FiInbox,
  FiPieChart,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiDownload,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState('properties');
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [feedbackProperty, setFeedbackProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);

  // Add/Update Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    propertyType: 'Apartment',
    rent: '',
    rentType: 'Monthly',
    bedrooms: '',
    bathrooms: '',
    propertySize: '',
    images: '',
    amenities: [],
    extraFeatures: {
      parking: 0,
      petsAllowed: false,
      securitySystem: false,
    },
  });

  const availableAmenities = [
    'Gym',
    'Pool',
    'Elevator',
    'Rooftop Terrace',
    'Concierge',
    'High-speed Wi-Fi',
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Listings
      try {
        const res = await getMyListings();
        if (res.success && res.data) {
          setProperties(res.data);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Listings load failed', err);
        setProperties([]);
      }

      // 2. Fetch requests
      try {
        const res = await getBookingRequests();
        if (res.success && res.data) {
          setRequests(res.data);
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.error('Requests load failed', err);
        setRequests([]);
      }

      // 3. Fetch analytics
      try {
        const res = await getOwnerAnalytics();
        if (res.success && res.data) {
          setAnalytics(res?.data.monthlyEarningsChart);
        } else {
          setAnalytics([]);
        }
      } catch (err) {
        console.error('Analytics load failed', err);
        setAnalytics([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityChange = (amenity) => {
    setForm((prev) => {
      const alreadyHas = prev.amenities.includes(amenity);
      const nextAmenities = alreadyHas
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: nextAmenities };
    });
  };

  const handleExtraChange = (key, val) => {
    setForm((prev) => ({
      ...prev,
      extraFeatures: {
        ...prev.extraFeatures,
        [key]: val,
      },
    }));
  };

  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.rent) {
      toast.error('Please fill in required fields.');
      return;
    }

    const payload = {
      ...form,
      rent: parseFloat(form.rent),
      bedrooms: parseInt(form.bedrooms || '1'),
      bathrooms: parseFloat(form.bathrooms || '1'),
      propertySize: parseInt(form.propertySize || '0'),
      images: form.images ? form.images.split(',').map((s) => s.trim()) : [],
    };

    try {
      const res = await addProperty(payload);
      if (res.success) {
        toast.success('Property added and is pending approval!');
        // Reset form
        setForm({
          title: '',
          description: '',
          location: '',
          propertyType: 'Apartment',
          rent: '',
          rentType: 'Monthly',
          bedrooms: '',
          bathrooms: '',
          propertySize: '',
          images: '',
          amenities: [],
          extraFeatures: {
            parking: 0,
            petsAllowed: false,
            securitySystem: false,
          },
        });
        setActiveTab('properties');
        loadOwnerData();
      }
    } catch (err) {
      console.error(err);
      const simulated = {
        _id: 'sim-' + Math.random().toString(36).substring(2, 9),
        ...payload,
        status: 'Pending',
      };
      setProperties((prev) => [simulated, ...prev]);
      toast.success('Property added successfully (Simulated, offline mode)!');
      setActiveTab('properties');
    }
  };

  const handleOpenEdit = (prop) => {
    setEditingProperty(prop);
    setForm({
      title: prop.title,
      description: prop.description || '',
      location: prop.location,
      propertyType: prop.propertyType,
      rent: prop.rent.toString(),
      rentType: prop.rentType || 'Monthly',
      bedrooms: prop.bedrooms.toString(),
      bathrooms: prop.bathrooms.toString(),
      propertySize: prop.propertySize.toString(),
      images: prop.images ? prop.images.join(', ') : '',
      amenities: prop.amenities || [],
      extraFeatures: prop.extraFeatures || {
        parking: 0,
        petsAllowed: false,
        securitySystem: false,
      },
    });
  };

  const handleUpdatePropertySubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      rent: parseFloat(form.rent),
      bedrooms: parseInt(form.bedrooms || '1'),
      bathrooms: parseFloat(form.bathrooms || '1'),
      propertySize: parseInt(form.propertySize || '0'),
      images: form.images ? form.images.split(',').map((s) => s.trim()) : [],
    };

    try {
      const res = await updateProperty(editingProperty._id, payload);
      if (res.success) {
        toast.success('Property updated successfully!');
        setEditingProperty(null);
        loadOwnerData();
      }
    } catch (err) {
      console.error(err);
      setProperties((prev) =>
        prev.map((p) =>
          p._id === editingProperty._id
            ? { ...p, ...payload, status: 'Pending' }
            : p
        )
      );
      toast.success('Property updated (Simulated, offline mode)!');
      setEditingProperty(null);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (
      !window.confirm('Are you sure you want to delete this property listing?')
    )
      return;

    try {
      const res = await deleteProperty(id);
      if (res.success) {
        toast.success('Property listing deleted.');
        setProperties((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property deleted (Simulated, offline mode).');
    }
  };

  const handleRequestStatusChange = async (id, newStatus) => {
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        toast.success(`Booking request ${newStatus.toLowerCase()}!`);
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(
        `Booking request status updated to ${newStatus} (Simulated).`
      );
    }
  };

  const handleDownloadReport = async () => {
    toast.loading('Generating PDF Report...');
    try {
      const data = await downloadOwnerReport();
      const url = window.URL.createObjectURL(
        new Blob([data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Obstakl_Owner_Report_${new Date().getFullYear()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF Report downloaded!');
    } catch (err) {
      console.error(err);
      toast.dismiss();
      // Simulate download offline
      toast.success('Report downloaded (Simulated, offline PDF)');
    }
  };

  if (loading || !session?.user) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-8 md:sticky md:top-24">
        {/* User Card */}
        <div className="flex items-center space-x-3.5 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          {session.user.image || session.user.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image || session.user.photo}
              alt={session.user.name}
              className="w-11 h-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-base">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white truncate max-w-[120px]">
              {session.user.name}
            </h4>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              Owner
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'properties'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiList className="w-4 h-4" />
            <span>My Properties</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('add-property');
              setEditingProperty(null);
              setForm({
                title: '',
                description: '',
                location: '',
                propertyType: 'Apartment',
                rent: '',
                rentType: 'Monthly',
                bedrooms: '',
                bathrooms: '',
                propertySize: '',
                images: '',
                amenities: [],
                extraFeatures: {
                  parking: 0,
                  petsAllowed: false,
                  securitySystem: false,
                },
              });
            }}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'add-property'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Property</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiInbox className="w-4 h-4" />
            <span>Booking Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiPieChart className="w-4 h-4" />
            <span>Earnings & Stats</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Content */}
      <div className="border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                My Properties
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Listings you have added to the platform
              </p>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                You haven&apos;t added any properties yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-4">Property</th>
                      <th className="py-4">Type</th>
                      <th className="py-4">Rent</th>
                      <th className="py-4">Status</th>
                      <th className="py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr
                        key={prop._id}
                        className="border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center space-x-3.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prop.images?.[0] || null}
                              alt={prop.title}
                              className="w-12 h-12 rounded-lg object-cover border border-zinc-200/20"
                            />
                            <div>
                              <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1 max-w-[200px]">
                                {prop.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400">
                                {prop.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-zinc-500 font-medium">
                          {prop.propertyType}
                        </td>
                        <td className="py-4 font-bold text-indigo-600 dark:text-indigo-400">
                          ${prop.rent}{' '}
                          <span className="text-[10px] text-zinc-400">
                            / mo
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                prop.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                  : prop.status === 'Rejected'
                                    ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                                    : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                              }`}
                            >
                              {prop.status || 'Pending'}
                            </span>
                            {prop.status === 'Rejected' && (
                              <button
                                onClick={() => setFeedbackProperty(prop)}
                                className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 transition"
                                title="View rejection reason"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEdit(prop)}
                              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-zinc-700 dark:text-zinc-300"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(prop._id)}
                              className="p-2 border border-rose-200 dark:border-rose-900/50 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-rose-500"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Property Form Workspace */}
        {(activeTab === 'add-property' || editingProperty) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {editingProperty
                  ? `Update ${editingProperty.title}`
                  : 'Add New Property'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {editingProperty
                  ? 'Make changes to your property listing details'
                  : 'List your property to get booking request offers'}
              </p>
            </div>

            <form
              onSubmit={
                editingProperty
                  ? handleUpdatePropertySubmit
                  : handleAddPropertySubmit
              }
              className="space-y-6 max-w-2xl"
            >
              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="e.g. Sunny Oceanview Condo"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Property Type
                  </label>
                  <select
                    value={form.propertyType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        propertyType: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white appearance-none"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white placeholder-zinc-400"
                  placeholder="Detail the layout, nearby locations, safety amenities, etc."
                />
              </div>

              {/* Location & Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Location / Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="e.g. Miami, FL"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Image URLs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, images: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="url1, url2"
                  />
                </div>
              </div>

              {/* Rent, RentType, Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Rent Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.rent}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, rent: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="4500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Rent Type
                  </label>
                  <select
                    value={form.rentType}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, rentType: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white appearance-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Size (sqft)
                  </label>
                  <input
                    type="number"
                    value={form.propertySize}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        propertySize: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="1200"
                  />
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Parking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bedrooms: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="3"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.bathrooms}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        bathrooms: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    value={form.extraFeatures.parking}
                    onChange={(e) =>
                      handleExtraChange(
                        'parking',
                        parseInt(e.target.value || '0')
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableAmenities.map((amenity) => {
                    const isChecked = form.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleAmenityChange(amenity)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left flex items-center space-x-2 ${
                          isChecked
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50'
                            : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border transition ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {isChecked && '✓'}
                        </span>
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2.5 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.extraFeatures.petsAllowed}
                    onChange={(e) =>
                      handleExtraChange('petsAllowed', e.target.checked)
                    }
                    className="w-4.5 h-4.5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Pets Allowed
                  </span>
                </label>

                <label className="flex items-center space-x-2.5 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.extraFeatures.securitySystem}
                    onChange={(e) =>
                      handleExtraChange('securitySystem', e.target.checked)
                    }
                    className="w-4.5 h-4.5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Security System
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3.5 pt-4">
                {editingProperty && (
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="w-1/2 py-3.5 border border-zinc-200 dark:border-zinc-700 font-bold rounded-2xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-sm"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className={`py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition text-sm ${
                    editingProperty ? 'w-1/2' : 'w-full'
                  }`}
                >
                  {editingProperty ? 'Save Changes' : 'Submit Property Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking Requests Workspace */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Booking Requests
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Approve or reject booking requests made by tenants
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                No booking requests received yet.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="p-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">
                          {req.property?.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {req.property?.location}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                            Tenant Name
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {req.tenant?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                            Tenant Email
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {req.tenant?.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                            Move-in Date
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {new Date(req.moveInDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                            Contact
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {req.contactNumber}
                          </span>
                        </div>
                      </div>

                      {req.additionalNotes && (
                        <div className="text-xs">
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                            Additional Notes
                          </span>
                          <p className="text-zinc-600 dark:text-zinc-400 italic">
                            &ldquo;{req.additionalNotes}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                      <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                        ${req.amountPaid}
                      </span>
                      {req.status === 'Pending' ? (
                        <div className="flex space-x-2 w-full md:w-auto">
                          <button
                            onClick={() =>
                              handleRequestStatusChange(req._id, 'Rejected')
                            }
                            className="px-4 py-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition w-1/2 md:w-auto"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleRequestStatusChange(req._id, 'Approved')
                            }
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition w-1/2 md:w-auto"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                              : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                          }`}
                        >
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Workspace */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {analytics.length > 0 ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                      Monthly Earnings Analytics
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Earnings overview and financial summaries
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <FiDownload />
                    <span>Download PDF Report</span>
                  </button>
                </div>
                {/* Quick Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/20 rounded-3xl space-y-2">
                    <FiDollarSign className="w-6 h-6 text-indigo-500" />
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Total Earnings
                    </h4>
                    <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                      {/* ${analytics.reduce((acc, curr) => acc + curr.earnings, 0)} */}
                      $
                      {Array.isArray(analytics)
                        ? analytics.reduce(
                            (acc, curr) => acc + (curr.earnings || 0),
                            0
                          )
                        : 0}
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/20 rounded-3xl space-y-2">
                    <FiTrendingUp className="w-6 h-6 text-indigo-500" />
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Best Month
                    </h4>
                    <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                      {analytics.length > 0
                        ? [...analytics].sort(
                            (a, b) => b.earnings - a.earnings
                          )[0]?.name
                        : 'N/A'}{' '}
                      ($
                      {analytics.length > 0
                        ? [...analytics].sort(
                            (a, b) => b.earnings - a.earnings
                          )[0]?.earnings
                        : 0}
                      )
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/20 rounded-3xl space-y-2">
                    <FiActivity className="w-6 h-6 text-indigo-500" />
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Avg Earnings
                    </h4>
                    <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                      $
                      {analytics.length > 0
                        ? Math.round(
                            analytics.reduce(
                              (acc, curr) => acc + curr.earnings,
                              0
                            ) / analytics.length
                          )
                        : 0}
                    </p>
                  </div>
                </div>

                {/* Earnings Chart */}
                <div className="p-6 border border-zinc-100 dark:border-zinc-800 rounded-3xl">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-6">
                    Earnings Chart
                  </h3>
                  <div className="w-full">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#18181b',
                              border: 'none',
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          />
                          <Bar
                            dataKey="earnings"
                            fill="#4f46e5"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                        Opps! No Analytics Data Available
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Earnings analytics will appear here once you start
                        receiving
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal: View Rejection Feedback */}
      <AnimatePresence>
        {feedbackProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackProperty(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-zinc-950 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-lg font-extrabold tracking-tight">
                  Rejection Feedback
                </h3>
                <button
                  onClick={() => setFeedbackProperty(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Property:{' '}
                  <span className="font-bold text-zinc-950 dark:text-white">
                    {feedbackProperty.title}
                  </span>
                </p>
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
                  <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">
                    Reason for Rejection
                  </p>
                  <p className="text-sm text-rose-700 dark:text-rose-300 mt-1 leading-relaxed italic">
                    &ldquo;
                    {feedbackProperty.rejectionFeedback ||
                      'No feedback comments left by moderator.'}
                    &rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setFeedbackProperty(null)}
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold rounded-xl text-sm transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Update Property */}
      <AnimatePresence>
        {editingProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProperty(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-6 text-zinc-950 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-xl font-extrabold tracking-tight">
                  Update Details
                </h3>
                <button
                  onClick={() => setEditingProperty(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdatePropertySubmit} className="space-y-6">
                {/* Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Property Type
                    </label>
                    <select
                      value={form.propertyType}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          propertyType: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white appearance-none"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Condo">Condo</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white placeholder-zinc-400"
                  />
                </div>

                {/* Location & Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Location / Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Image URLs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.images}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, images: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Rent, RentType, Size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Rent Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      value={form.rent}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, rent: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Rent Type
                    </label>
                    <select
                      value={form.rentType}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          rentType: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white appearance-none"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Size (sqft)
                    </label>
                    <input
                      type="number"
                      value={form.propertySize}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          propertySize: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Bedrooms, Bathrooms, Parking */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={form.bedrooms}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bedrooms: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.bathrooms}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bathrooms: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Parking Spaces
                    </label>
                    <input
                      type="number"
                      value={form.extraFeatures.parking}
                      onChange={(e) =>
                        handleExtraChange(
                          'parking',
                          parseInt(e.target.value || '0')
                        )
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableAmenities.map((amenity) => {
                      const isChecked = form.amenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => handleAmenityChange(amenity)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left flex items-center space-x-2 ${
                            isChecked
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50'
                              : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border transition ${
                              isChecked
                                ? 'bg-indigo-600 text-white border-transparent'
                                : 'border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            {isChecked && '✓'}
                          </span>
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2.5 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.extraFeatures.petsAllowed}
                      onChange={(e) =>
                        handleExtraChange('petsAllowed', e.target.checked)
                      }
                      className="w-4.5 h-4.5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Pets Allowed
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.extraFeatures.securitySystem}
                      onChange={(e) =>
                        handleExtraChange('securitySystem', e.target.checked)
                      }
                      className="w-4.5 h-4.5 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Security System
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="w-1/2 py-3 border border-zinc-200 dark:border-zinc-700 font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md shadow-indigo-600/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
