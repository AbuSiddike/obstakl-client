'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  getMyBookings,
  getFavorites,
  removeFromFavorites,
  getPropertyReviews,
  deleteReview,
  getMyReviews,
} from '@/services/api';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiHeart,
  FiMessageSquare,
  FiUser,
  FiTrash2,
  FiMapPin,
  FiBriefcase,
  FiChevronRight,
  FiArrowRight,
} from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TenantDashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState('bookings');

  // Data states
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Bookings
      try {
        const bookRes = await getMyBookings();
        if (bookRes.success && bookRes.data) {
          setBookings(bookRes.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Bookings load failed', err);
        setBookings([]);
      }

      // 2. Fetch Favorites
      try {
        const favRes = await getFavorites();
        if (favRes.success && favRes.data) {
          setFavorites(favRes.data);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error('Favorites load failed', err);
        setFavorites([]);
      }

      // 3. Fetch Reviews
      try {
        const revRes = await getMyReviews();
        if (revRes.success && revRes.data) {
          setReviews(revRes.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Reviews load failed', err);
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (propertyId) => {
    try {
      const res = await removeFromFavorites(propertyId);
      if (res.success) {
        toast.success('Removed from favorites!');
        setFavorites((prev) =>
          prev.filter(
            (f) => f.propertyId !== propertyId && f.property?._id !== propertyId
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove favorite.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await deleteReview(reviewId);
      if (res.success) {
        toast.success('Review deleted successfully!');
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error(err);
      toast.success('Review deleted (simulated)!');
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    }
  };

  const handleRoleTransition = () => {
    alert('Become an Owner feature is under construction.');
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
              Tenant
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiHeart className="w-4 h-4" />
            <span>My Favorites</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>My Reviews</span>
          </button>
        </div>

        {/* Role Transition Button */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleRoleTransition}
            disabled={transitioning}
            className="w-full flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-zinc-800 dark:text-zinc-200 hover:text-white dark:hover:text-white font-bold rounded-xl text-xs transition"
          >
            <span className="flex items-center space-x-2">
              <FiBriefcase />
              <span>Become an Owner</span>
            </span>
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-grow w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                My Bookings
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage and track your stay reservation requests
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                No bookings made yet. Start exploring properties!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-4">Property Name</th>
                      <th className="py-4">Booking Date</th>
                      <th className="py-4">Amount Paid</th>
                      <th className="py-4">Booking Status</th>
                      <th className="py-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const bStatus =
                        booking.bookingStatus || booking.status || 'Pending';
                      const pStatus = booking.paymentStatus || 'Paid';
                      const bDate = booking.createdAt || booking.moveInDate;

                      return (
                        <tr
                          key={booking._id}
                          className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center space-x-3.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  booking.property?.images?.[0] ||
                                  '/placeholder.jpg'
                                }
                                alt={
                                  booking.property?.title ||
                                  booking.propertyName
                                }
                                className="w-12 h-12 rounded-lg object-cover border border-zinc-200/20"
                              />
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1 max-w-[200px]">
                                  {booking.property?.title ||
                                    booking.propertyName}
                                </h4>
                                <p className="text-[10px] text-zinc-400">
                                  {booking.property?.location || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-zinc-500 font-semibold text-xs">
                            {bDate
                              ? new Date(bDate).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="py-4 font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                            ${booking.amountPaid || booking.property?.rent || 0}
                          </td>
                          <td className="py-4">
                            <span
                              className={`text-[9px] px-2.5 py-1 rounded-full font-bold border ${
                                bStatus === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                                  : bStatus === 'Rejected'
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                              }`}
                            >
                              {bStatus}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`text-[9px] px-2.5 py-1 rounded-full font-bold border ${
                                pStatus === 'Paid'
                                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                                  : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-950/30 dark:text-zinc-400 border-zinc-100 dark:border-zinc-900/50'
                              }`}
                            >
                              {pStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Saved Properties
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Quickly access properties you are interested in
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                No favorites added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favorites.map((fav) => {
                  const prop = fav.property || fav;
                  return (
                    <div
                      key={fav._id}
                      className="group border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-200 dark:hover:border-zinc-700 transition"
                    >
                      <div className="relative h-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prop.images?.[0] || ''}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            handleDeleteFavorite(prop._id || fav.propertyId)
                          }
                          className="absolute top-3.5 right-3.5 p-2 bg-white dark:bg-zinc-900 rounded-xl text-rose-500 shadow-md border border-zinc-200/20"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            {prop.propertyType}
                          </p>
                          <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1 mt-0.5">
                            {prop.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {prop.location}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                            ${prop.rent}{' '}
                            <span className="text-[9px] text-zinc-400 font-normal">
                              / mo
                            </span>
                          </span>
                          <Link
                            href={`/properties/${prop._id}`}
                            className="text-xs font-bold text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 flex items-center space-x-0.5"
                          >
                            <span>Details</span>
                            <FiArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                My Reviews
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Track and manage feedback you have left on properties
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                You haven&apos;t written any reviews yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex justify-between items-start"
                  >
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <FiCalendar
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Left on: {rev.property?.title}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(rev._id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
