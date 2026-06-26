'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { getFeaturedProperties, getAllReviews } from '@/services/api';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiMapPin,
  FiHome,
  FiDollarSign,
  FiChevronRight,
  FiShield,
  FiStar,
  FiUser,
  FiActivity,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);

  // Search parameters
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await getFeaturedProperties();
        if (res.success && res.data && res.data.length > 0) {
          setProperties(res.data);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to load featured properties', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadReviews() {
      try {
        const res = await getAllReviews();
        if (res.success && res.data && res.data.length > 0) {
          setReviews(res.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Failed to load reviews', err);
        setReviews([]);
      }
    }

    loadFeatured();
    loadReviews();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (propertyType) query.append('propertyType', propertyType);
    if (minPrice) query.append('minPrice', minPrice);
    if (maxPrice) query.append('maxPrice', maxPrice);
    router.push(`/properties?${query.toString()}`);
  };

  const handleViewDetails = (propertyId) => {
    if (!session) {
      toast('Please login to view property details', { icon: '🔒' });
      router.push(`/login?redirect=/properties/${propertyId}`);
    } else {
      router.push(`/properties/${propertyId}`);
    }
  };

  return (
    <div className="flex-grow space-y-24 pb-20">
      {/* Banner Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-zinc-900 text-white py-20">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80"
            alt="Obstakl Hero"
            className="w-full h-full object-cover opacity-30 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/50 to-zinc-900/30"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
              Premium Property Booking
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Find Your Perfect Home <br />
              <span className="text-indigo-400">Without the Hassle</span>
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-300 text-lg leading-relaxed">
              Discover verified rental properties, connect directly with
              property owners, and book instantly through our secure gateway.
            </p>
          </motion.div>

          {/* Search Bar Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSearchSubmit}
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-2xl border border-zinc-200/20 grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-zinc-800"
          >
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center space-x-1">
                <FiMapPin className="text-indigo-500" /> <span>Location</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Miami, New York"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 text-sm font-semibold p-1.5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1 text-left sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 sm:pl-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center space-x-1">
                <FiHome className="text-indigo-500" />{' '}
                <span>Property Type</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 text-sm font-semibold p-1.5 text-zinc-900 dark:text-white focus:outline-none appearance-none"
              >
                <option value="" className="text-zinc-800">
                  All Types
                </option>
                <option value="Apartment" className="text-zinc-800">
                  Apartment
                </option>
                <option value="House" className="text-zinc-800">
                  House
                </option>
                <option value="Condo" className="text-zinc-800">
                  Condo
                </option>
              </select>
            </div>

            <div className="space-y-1 text-left sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 sm:pl-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center space-x-1">
                <FiDollarSign className="text-indigo-500" />{' '}
                <span>Budget Range</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-transparent border-0 focus:ring-0 text-sm font-semibold p-1 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
                <span className="text-zinc-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-transparent border-0 focus:ring-0 text-sm font-semibold p-1 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
              >
                <FiSearch className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Featured Properties
            </h2>
          </div>
          <Link
            href="/properties"
            className="group flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline mt-4 sm:mt-0"
          >
            <span>Explore All Properties</span>
            <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {properties.map((property, idx) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Property Image */}
                <div className="relative h-56 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      property.images && property.images[0]
                        ? property.images[0]
                        : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-white/90 dark:bg-zinc-900/90 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/10">
                    {property.propertyType}
                  </div>
                  <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                    ${property.rent}{' '}
                    <span className="text-[10px] font-medium">
                      /{' '}
                      {property.rentType === 'Monthly'
                        ? 'mo'
                        : property.rentType === 'Weekly'
                          ? 'wk'
                          : 'day'}
                    </span>
                  </div>
                </div>

                {/* Property Content */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1 text-zinc-400 text-xs">
                      <FiMapPin className="text-zinc-400" />
                      <span>{property.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {property.title}
                    </h3>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {property.bedrooms}
                      </p>
                      <p className="text-[10px] text-zinc-400">Beds</p>
                    </div>
                    <div className="border-x border-zinc-100 dark:border-zinc-800">
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {property.bathrooms}
                      </p>
                      <p className="text-[10px] text-zinc-400">Baths</p>
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {property.propertySize} sqft
                      </p>
                      <p className="text-[10px] text-zinc-400">Area</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(property._id)}
                    className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-zinc-800 dark:text-zinc-200 hover:text-white dark:hover:text-white font-bold rounded-2xl transition duration-300 flex items-center justify-center space-x-1"
                  >
                    <span>View Details</span>
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-zinc-100 dark:bg-zinc-900/50 transition-colors duration-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Platform Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
              A Secure and Transparent Marketplace for Everyone
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base">
              Obstakl bridges the gap between tenant discovery and owner
              hosting. No hidden margins, secure deposits, and simplified
              operations make it a class-leading booking workspace.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3.5">
                <div className="flex-shrink-0 p-2.5 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FiShield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    Strict Verification Check
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Admin moderation guarantees listings have proper fire exit
                    plans and verified addresses.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3.5">
                <div className="flex-shrink-0 p-2.5 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FiStar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    Trusted Review Mechanism
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Only verified booked tenants can submit reviews, maintaining
                    review integrity.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
              alt="Obstakl Workplace"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Tenant Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            What Our Tenants Say
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {reviews.slice(0, 4).map((review, idx) => {
            const rId = review._id || review.id;
            const rRating = review.rating || 5;
            const rComment = review.comment || '';
            const rName = review.tenant?.name || review.name || 'Anonymous';
            const rAvatar =
              review.tenant?.photo ||
              review.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
            const rLocation = review.location || 'Verified Tenant';

            return (
              <motion.div
                key={rId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(rRating)].map((_, i) => (
                      <FiStar
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                    &ldquo;{rComment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rAvatar}
                    alt={rName}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {rName}
                    </h4>
                    <p className="text-xs text-zinc-400">{rLocation}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Extra Section 1: Top Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Inspiration for Stays
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Explore Top Locations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            {
              name: 'New York',
              img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80',
              count: '140+ Listings',
            },
            {
              name: 'Miami',
              img: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=400&q=80',
              count: '90+ Listings',
            },
            {
              name: 'Los Angeles',
              img: 'https://images.unsplash.com/photo-1422405153578-4bd676b19036?auto=format&fit=crop&w=400&q=80',
              count: '110+ Listings',
            },
            {
              name: 'Chicago',
              img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80',
              count: '60+ Listings',
            },
          ].map((loc, idx) => (
            <motion.div
              key={loc.name}
              onClick={() =>
                router.push(
                  `/properties?search=${encodeURIComponent(loc.name)}`
                )
              }
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loc.img}
                alt={loc.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 space-y-1 text-white">
                <h4 className="text-xl font-bold">{loc.name}</h4>
                <p className="text-xs text-zinc-300 font-semibold">
                  {loc.count}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Extra Section 2: Stats */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Total Bookings', value: '15,000+', icon: FiActivity },
            { label: 'Approved Listings', value: '3,200+', icon: FiHome },
            { label: 'Active Tenant Users', value: '24,000+', icon: FiUser },
            {
              label: 'Secure Transactions',
              value: '$1.8M+',
              icon: FiDollarSign,
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-2.5 flex flex-col items-center"
            >
              <stat.icon className="w-7 h-7 text-indigo-300" />
              <h3 className="text-3xl sm:text-4xl font-extrabold">
                {stat.value}
              </h3>
              <p className="text-sm text-indigo-200 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
