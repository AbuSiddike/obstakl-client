'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  getAllUsers,
  changeUserRole,
  getAdminProperties,
  approveOrRejectProperty,
  getAllBookings,
  getAllTransactions,
} from '@/services/api';
import {
  getPropertyTitle,
  getPersonName,
  getBookingStatus,
  getPaymentStatus,
  getAmount,
  getTransactionId,
  formatRecordDate,
  getBookingDate,
} from '@/lib/admin/record-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiShield,
  FiCalendar,
  FiCreditCard,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiLock,
} from 'react-icons/fi';
import { ROLES } from '@/lib/auth/dashboard-access';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState('users');

  // States
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Moderate rejection state
  const [rejectingProperty, setRejectingProperty] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);
  const [showAdminRoleAlert, setShowAdminRoleAlert] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      try {
        const res = await getAllUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Users load failed', err);
        setUsers([]);
      }

      // 2. Fetch properties
      try {
        const res = await getAdminProperties();
        if (res.success && res.data) {
          setProperties(res.data);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Properties load failed', err);
        setProperties([]);
      }

      // 3. Fetch bookings
      try {
        const res = await getAllBookings();
        if (res.success && res.data) {
          setBookings(res.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Bookings load failed', err);
        setBookings([]);
      }

      // 4. Fetch transactions
      try {
        const res = await getAllTransactions();
        if (res.success && res.data) {
          setTransactions(res.data);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Transactions load failed', err);
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    const currentRole = user.role || ROLES.TENANT;

    if (currentRole === ROLES.ADMIN) {
      setShowAdminRoleAlert(true);
      return;
    }

    const userId = user.id || user._id;

    try {
      const res = await changeUserRole(userId, newRole);
      if (res.success) {
        toast.success(`User role changed to ${newRole}!`);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId || u._id === userId ? { ...u, role: newRole } : u
          )
        );
      }
    } catch (err) {
      console.error(err);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId || u._id === userId ? { ...u, role: newRole } : u
        )
      );
      toast.error(`User role updated to ${newRole} (Simulated).`);
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      const res = await approveOrRejectProperty(propertyId, {
        status: 'Approved',
      });
      if (res.success) {
        toast.success('Property listing approved!');
        setProperties((prev) =>
          prev.map((p) =>
            p._id === propertyId ? { ...p, status: 'Approved' } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
      // Simulate status change offline
      setProperties((prev) =>
        prev.map((p) =>
          p._id === propertyId ? { ...p, status: 'Approved' } : p
        )
      );
      toast.success('Property listing approved (Simulated).');
    }
  };

  const handleRejectPropertySubmit = async (e) => {
    e.preventDefault();
    if (!rejectionFeedback.trim()) {
      toast.error('Please enter rejection feedback.');
      return;
    }

    setSubmittingRejection(true);
    try {
      const res = await approveOrRejectProperty(rejectingProperty._id, {
        status: 'Rejected',
        rejectionFeedback,
      });

      if (res.success) {
        toast.success('Property listing rejected.');
        setProperties((prev) =>
          prev.map((p) =>
            p._id === rejectingProperty._id
              ? { ...p, status: 'Rejected', rejectionFeedback }
              : p
          )
        );
        setRejectingProperty(null);
        setRejectionFeedback('');
      }
    } catch (err) {
      console.error(err);
      // Simulate status change offline
      setProperties((prev) =>
        prev.map((p) =>
          p._id === rejectingProperty._id
            ? { ...p, status: 'Rejected', rejectionFeedback }
            : p
        )
      );
      toast.success('Property listing rejected (Simulated).');
      setRejectingProperty(null);
      setRejectionFeedback('');
    } finally {
      setSubmittingRejection(false);
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
      <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-8 sticky top-24">
        {/* User Card */}
        <div className="flex items-center space-x-3.5 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-600/20">
            A
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white truncate max-w-[120px]">
              {session.user.name}
            </h4>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              Admin
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            <span>All Users</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'properties'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiShield className="w-4 h-4" />
            <span>All Properties</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            <span>All Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'transactions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiCreditCard className="w-4 h-4" />
            <span>Transactions</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-grow w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Manage Users Workspace */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                All Users
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Update account levels and roles of Obstakl accounts
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-4">User Details</th>
                    <th className="py-4">Email</th>
                    <th className="py-4">Role / Level</th>
                    <th className="py-4 text-right">Transition Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id || u._id}
                      className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition"
                    >
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="py-4 text-zinc-500 font-medium">
                        {u.email}
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {u.role || 'Tenant'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {(u.role || ROLES.TENANT) === ROLES.ADMIN ? (
                          <button
                            type="button"
                            onClick={() => setShowAdminRoleAlert(true)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-not-allowed"
                            title="Admin role is protected"
                          >
                            <FiLock className="w-3.5 h-3.5" />
                            <span>Admin (Locked)</span>
                          </button>
                        ) : (
                          <select
                            value={u.role || ROLES.TENANT}
                            onChange={(e) =>
                              handleRoleChange(u, e.target.value)
                            }
                            className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                          >
                            <option value={ROLES.TENANT}>Tenant</option>
                            <option value={ROLES.OWNER}>Owner</option>
                            <option value={ROLES.ADMIN}>Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Moderate Properties Workspace */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                All Properties
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review, approve, or reject property listings across the platform
              </p>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                No listings need moderation at this time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-4">Property</th>
                      <th className="py-4">Owner</th>
                      <th className="py-4">Rent</th>
                      <th className="py-4">Status</th>
                      <th className="py-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr
                        key={prop._id}
                        className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center space-x-3.5">
                            {prop.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prop.images[0]}
                                alt={prop.title}
                                className="w-12 h-12 rounded-lg object-cover border border-zinc-200/20"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/20 flex items-center justify-center text-zinc-400">
                                <FiShield className="w-5 h-5" />
                              </div>
                            )}
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
                        <td className="py-4 text-zinc-550 font-semibold">
                          {prop.owner?.name || 'N/A'}
                        </td>
                        <td className="py-4 font-bold text-indigo-650 dark:text-indigo-400">
                          ${prop.rent}{' '}
                          <span className="text-[10px] text-zinc-400">
                            / mo
                          </span>
                        </td>
                        <td className="py-4">
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
                        </td>
                        <td className="py-4 text-right">
                          {prop.status === 'Pending' || !prop.status ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setRejectingProperty(prop)}
                                className="p-2 border border-rose-200 dark:border-rose-900/50 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-rose-500"
                                title="Reject with Feedback"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleApproveProperty(prop._id)}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md"
                                title="Approve Listing"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 font-semibold">
                              Done
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Bookings Workspace */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                All Bookings
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monitor booking activity across all tenants and properties
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                No booking records found.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[760px] text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-4">Property Name</th>
                      <th className="py-4">Tenant</th>
                      <th className="py-4">Owner</th>
                      <th className="py-4">Booking Date</th>
                      <th className="py-4">Amount Paid</th>
                      <th className="py-4">Booking Status</th>
                      <th className="py-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition"
                      >
                        <td className="py-4 font-bold text-zinc-900 dark:text-white">
                          {getPropertyTitle(booking)}
                        </td>
                        <td className="py-4">
                          <h5 className="font-bold text-zinc-900 dark:text-white">
                            {getPersonName(booking.tenant)}
                          </h5>
                          {booking.tenant?.email && (
                            <p className="text-[10px] text-zinc-400">
                              {booking.tenant.email}
                            </p>
                          )}
                        </td>
                        <td className="py-4 font-semibold text-zinc-700 dark:text-zinc-300">
                          {getPersonName(booking.owner)}
                        </td>
                        <td className="py-4 text-zinc-600 dark:text-zinc-400">
                          {formatRecordDate(getBookingDate(booking))}
                        </td>
                        <td className="py-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                          ${getAmount(booking)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                              getBookingStatus(booking) === 'Approved'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                : getBookingStatus(booking) === 'Rejected'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                                  : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                            }`}
                          >
                            {getBookingStatus(booking)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {getPaymentStatus(booking)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Workspace */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Transactions
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Reservation payment records with property, tenant, and owner
                details
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                No transaction records registered.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[640px] md:min-w-0 table-fixed text-left text-sm border-collapse">
                  <colgroup>
                    <col className="w-[16%]" />
                    <col className="w-[24%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[12%]" />
                    <col className="w-[8%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-4">Transaction ID</th>
                      <th className="py-4">Property Name</th>
                      <th className="py-4">Tenant Name</th>
                      <th className="py-4">Owner Name</th>
                      <th className="py-4">Amount</th>
                      <th className="py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx._id}
                        className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition"
                      >
                        <td className="py-4 font-bold text-zinc-900 dark:text-white">
                          <code className="text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg truncate inline-block max-w-full">
                            {getTransactionId(tx)}
                          </code>
                        </td>
                        <td className="py-4 font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                          {getPropertyTitle(tx)}
                        </td>
                        <td className="py-4 font-bold text-zinc-900 dark:text-white truncate">
                          {tx.tenantName || 'N/A'}
                        </td>
                        <td className="py-4 font-bold text-zinc-900 dark:text-white truncate">
                          {tx.ownerName || 'N/A'}
                        </td>
                        <td className="py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${getAmount(tx)}
                        </td>
                        <td className="py-4 text-right text-xs text-zinc-400">
                          {formatRecordDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Moderation Rejection Feedback */}
      <AnimatePresence>
        {rejectingProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingProperty(null)}
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
                  Reject Property Listing
                </h3>
                <button
                  onClick={() => setRejectingProperty(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectPropertySubmit} className="space-y-4">
                <p className="text-xs text-zinc-500">
                  Provide feedback to the owner explaining why their listing for{' '}
                  <strong>{rejectingProperty.title}</strong> is being rejected.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                    <FiMessageSquare className="text-indigo-500" />
                    <span>Moderation Comment *</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. Please upload pictures showing fire exit locations and confirm emergency contacts."
                    value={rejectionFeedback}
                    onChange={(e) => setRejectionFeedback(e.target.value)}
                    className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white placeholder-zinc-400"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingProperty(null)}
                    className="w-1/2 py-2.5 border border-zinc-200 dark:border-zinc-700 font-semibold rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRejection}
                    className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {submittingRejection ? 'Submitting...' : 'Reject Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Admin role protected */}
      <AnimatePresence>
        {showAdminRoleAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminRoleAlert(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-zinc-950 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    Role Change Not Allowed
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminRoleAlert(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                The <strong>Admin</strong> role is protected and cannot be
                changed. Admin accounts retain full platform access for security
                and operational stability.
              </p>

              <button
                type="button"
                onClick={() => setShowAdminRoleAlert(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
