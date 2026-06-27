'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  getPropertyById,
  getPropertyReviews,
  addReview,
  deleteReview,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiHome,
  FiDollarSign,
  FiHeart,
  FiStar,
  FiCalendar,
  FiPhone,
  FiMessageSquare,
  FiCheck,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PropertyDetails({ params }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // State
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    moveInDate: '',
    contactNumber: '',
    additionalNotes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Property Details
      try {
        const propRes = await getPropertyById(propertyId);
        if (propRes.success && propRes.data) {
          setProperty(propRes.data);
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error('Failed to load property details', err);
        setProperty(null);
      }

      // 2. Fetch Reviews
      try {
        const revRes = await getPropertyReviews(propertyId);
        if (revRes.success && revRes.data) {
          setReviews(revRes.data);
        }
      } catch (err) {
        console.error('Failed to load reviews', err);
      }

      // 3. Fetch Favorites status
      if (session) {
        try {
          const favRes = await getFavorites();
          if (favRes.success && favRes.data) {
            const found = favRes.data.some((f) => f.propertyId === propertyId);
            setIsFavorite(found);
          }
        } catch (err) {
          console.error('Failed to check favorites', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId, session]);

  const handleFavoriteToggle = async () => {
    if (!session) {
      toast('Please login to add favorites', { icon: '🔒' });
      router.push(`/login?redirect=/properties/${propertyId}`);
      return;
    }

    try {
      if (isFavorite) {
        const res = await removeFromFavorites(propertyId);
        if (res.success) {
          setIsFavorite(false);
          toast.success('Removed from favorites!');
        }
      } else {
        const res = await addToFavorites(propertyId);
        if (res.success) {
          setIsFavorite(true);
          toast.success('Added to favorites!');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update favorites.');
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.moveInDate || !bookingForm.contactNumber) {
      toast.error('Please fill in all required booking fields.');
      return;
    }

    setIsBookingModalOpen(false);

    // Redirect to the payment page with booking details in query params
    const query = new URLSearchParams({
      moveInDate: bookingForm.moveInDate,
      contactNumber: bookingForm.contactNumber,
      additionalNotes: bookingForm.additionalNotes,
    });
    router.push(`/properties/${propertyId}/payment?${query.toString()}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await addReview({
        propertyId,
        rating,
        comment,
      });
      if (res.success) {
        toast.success('Review submitted!');
        setComment('');
        setRating(5);
        // Reload reviews
        const revRes = await getPropertyReviews(propertyId);
        if (revRes.success && revRes.data) {
          setReviews(revRes.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await deleteReview(reviewId);
      if (res.success) {
        toast.success('Review deleted successfully!');
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Property not found</h2>
        <button
          onClick={() => router.push('/properties')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-grow">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 transition"
      >
        &larr; Back
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column (Images, Info, Amenities) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.images?.[0] || null}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-6 right-6 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/20 rounded-2xl shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-rose-500 transition-colors"
            >
              <FiHeart
                className={`w-6 h-6 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                {property.propertyType}
              </span>
              <span className="text-zinc-400 text-xs flex items-center space-x-1">
                <FiMapPin /> <span>{property.location}</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {property.title}
            </h1>
          </div>

          {/* Property Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              Description
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Amenities Offered
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-2.5 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl shadow-sm text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <FiCheck className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra Features */}
          {property.extraFeatures &&
            Object.keys(property.extraFeatures).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Extra Features
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(property.extraFeatures).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/80 rounded-2xl text-center"
                    >
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <p className="text-base font-extrabold text-zinc-900 dark:text-white mt-1">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Right Column (Booking, Owner Card) */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-6">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                Rental Price
              </p>
              <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                ${property.rent}{' '}
                <span className="text-xs text-zinc-400 font-semibold">
                  / {property.rentType || 'Monthly'}
                </span>
              </h3>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <div>
                <p className="font-extrabold text-zinc-900 dark:text-white">
                  {property.bedrooms}
                </p>
                <p className="text-[10px] text-zinc-400">Beds</p>
              </div>
              <div className="border-x border-zinc-100 dark:border-zinc-800">
                <p className="font-extrabold text-zinc-900 dark:text-white">
                  {property.bathrooms}
                </p>
                <p className="text-[10px] text-zinc-400">Baths</p>
              </div>
              <div>
                <p className="font-extrabold text-zinc-900 dark:text-white">
                  {property.propertySize} sqft
                </p>
                <p className="text-[10px] text-zinc-400">Area</p>
              </div>
            </div>

            {session?.user?.role === 'Owner' ||
            session?.user?.role === 'Admin' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                You are registered as an {session.user.role}. Booking is only
                available for Tenants.
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!session) {
                    toast('Please login to book this property', { icon: '🔒' });
                    router.push(`/login?redirect=/properties/${propertyId}`);
                  } else {
                    setIsBookingModalOpen(true);
                  }
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center space-x-1"
              >
                <span>Book Property Now</span>
              </button>
            )}
          </div>

          {/* Owner Info Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
              Listed By Owner
            </h4>
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-base border border-zinc-200/20">
                {(property.owner?.name || 'Owner').charAt(0).toUpperCase()}
              </div>
              <div>
                <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {property.owner?.name || 'Property Owner'}
                </h5>
                <p className="text-xs text-zinc-400">
                  {property.owner?.email || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review System Section */}
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/80 pt-12 space-y-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center space-x-2">
          <FiMessageSquare className="text-indigo-500" />
          <span>Tenant Reviews & Ratings</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Submit Review Card */}
          <div className="lg:col-span-1">
            {session && session.user?.role === 'Tenant' ? (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm"
              >
                <h4 className="font-bold text-zinc-950 dark:text-white text-sm">
                  Write a Review
                </h4>
                {/* Stars selector */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-bold">
                    Rating
                  </label>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none"
                      >
                        <FiStar
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-bold">
                    Comment
                  </label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white placeholder-zinc-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800 p-6 rounded-3xl text-center text-sm text-zinc-500">
                {!session ? (
                  <p>
                    Please{' '}
                    <a
                      href="/login"
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      login
                    </a>{' '}
                    as a tenant to write a review.
                  </p>
                ) : (
                  <p>Reviews can only be written by Tenant accounts.</p>
                )}
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-3xl">
                No reviews yet. Be the first to leave a review!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const isOwnerOfReview =
                    session && session.user?.email === rev.tenant?.email;
                  const isAdmin = session && session.user?.role === 'Admin';

                  return (
                    <div
                      key={rev._id}
                      className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0"
                    >
                      <div className="space-y-2">
                        {/* Rating */}
                        <div className="flex space-x-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <FiStar
                              key={i}
                              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
                          {rev.comment}
                        </p>
                        {/* Tenant Name */}
                        <div className="text-[11px] text-zinc-400 font-medium pt-2">
                          By{' '}
                          <span className="font-bold text-zinc-600 dark:text-zinc-300">
                            {rev.tenant?.name}
                          </span>{' '}
                          on {new Date(rev.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      {(isOwnerOfReview || isAdmin) && (
                        <button
                          onClick={() => handleReviewDelete(rev._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                          title="Delete Review"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-zinc-950 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-xl font-extrabold tracking-tight">
                  Book {property.title}
                </h3>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* User Info (Read-only) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={session?.user?.name || ''}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Your Email
                    </label>
                    <input
                      type="text"
                      disabled
                      value={session?.user?.email || ''}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Move-in Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                    <FiCalendar className="text-indigo-500" />{' '}
                    <span>Move-in Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.moveInDate}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        moveInDate: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white"
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                    <FiPhone className="text-indigo-500" />{' '}
                    <span>Contact Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={bookingForm.contactNumber}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white placeholder-zinc-400"
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="Any requests or messages for the property owner..."
                    value={bookingForm.additionalNotes}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        additionalNotes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-950 dark:text-white placeholder-zinc-400"
                  />
                </div>

                <div className="flex space-x-3.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="w-1/2 py-3 border border-zinc-200 dark:border-zinc-700 font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md shadow-indigo-600/10"
                  >
                    Go to Checkout
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
