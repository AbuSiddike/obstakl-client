'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProperties } from '@/services/api';
import { authClient } from '@/lib/auth-client';
import {
  FiSearch,
  FiMapPin,
  FiHome,
  FiSliders,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  // State variables
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 9,
    totalPages: 1,
    total: 0,
  });

  // Filter input states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [propertyType, setPropertyType] = useState(
    searchParams.get('propertyType') || ''
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const fetchProps = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search') || undefined,
        propertyType: searchParams.get('propertyType') || undefined,
        minPrice: searchParams.get('minPrice')
          ? parseFloat(searchParams.get('minPrice'))
          : undefined,
        maxPrice: searchParams.get('maxPrice')
          ? parseFloat(searchParams.get('maxPrice'))
          : undefined,
        sort: searchParams.get('sort') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: 9,
      };

      const res = await getProperties(params);
      if (res.success && res.data) {
        setProperties(res.data);
        if (res.meta) {
          setMeta(res.meta);
        } else {
          setMeta({
            page: params.page,
            limit: 9,
            totalPages: Math.ceil(res.data.length / 9),
            total: res.data.length,
          });
        }
      } else {
        setProperties([]);
        setMeta({ page: params.page, limit: 9, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Properties fetch failed', err);
      setProperties([]);
      setMeta({
        page: parseInt(searchParams.get('page') || '1'),
        limit: 9,
        totalPages: 1,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProps();
    // Update local filter inputs when query parameters change
    setSearch(searchParams.get('search') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || '');
    setPage(parseInt(searchParams.get('page') || '1'));
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (propertyType) query.append('propertyType', propertyType);
    if (minPrice) query.append('minPrice', minPrice);
    if (maxPrice) query.append('maxPrice', maxPrice);
    if (sort) query.append('sort', sort);
    query.append('page', '1'); // always reset to page 1 on search
    router.push(`/properties?${query.toString()}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    const query = new URLSearchParams(searchParams.toString());
    query.set('page', newPage.toString());
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          All Rental Properties
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Showing {meta.total} properties found across all locations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start flex-grow">
        {/* Filters Sidebar */}
        <form
          onSubmit={handleApplyFilters}
          className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm lg:sticky lg:top-24"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <FiSliders className="text-indigo-500" />
              <span>Filters</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPropertyType('');
                setMinPrice('');
                setMaxPrice('');
                setSort('');
                router.push('/properties');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Search by location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="City, State"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Property Type
            </label>
            <div className="relative">
              <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white appearance-none"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Condo">Condo</option>
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Budget Range
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative w-1/2">
                <FiDollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>
              <span className="text-zinc-400 text-xs">-</span>
              <div className="relative w-1/2">
                <FiDollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Sort By Price
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white appearance-none"
            >
              <option value="">Default (Latest)</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition"
          >
            Apply Filters
          </button>
        </form>

        {/* Properties Grid */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                ></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <span className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-full text-indigo-500 text-3xl">
                <FiHome />
              </span>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  No properties found
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                  We couldn&apos;t find any approved properties matching your
                  filter selection. Try resetting them.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {properties.map((property, idx) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
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
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-zinc-900/90 text-indigo-600 dark:text-indigo-400 shadow-sm">
                      {property.propertyType}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-600 text-white shadow-md">
                      ${property.rent}{' '}
                      <span className="text-[9px] font-normal">
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
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1 text-zinc-400 text-xs">
                        <FiMapPin className="text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-950 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {property.title}
                      </h3>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-1 py-2.5 border-y border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">
                          {property.bedrooms}
                        </p>
                        <p className="text-[9px] text-zinc-400">Beds</p>
                      </div>
                      <div className="border-x border-zinc-100 dark:border-zinc-800">
                        <p className="font-bold text-zinc-900 dark:text-white">
                          {property.bathrooms}
                        </p>
                        <p className="text-[9px] text-zinc-400">Baths</p>
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">
                          {property.propertySize} sqft
                        </p>
                        <p className="text-[9px] text-zinc-400">Area</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(property._id)}
                      className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-zinc-800 dark:text-zinc-200 hover:text-white dark:hover:text-white font-bold rounded-xl transition duration-300 flex items-center justify-center space-x-1 text-sm"
                    >
                      <span>View Details</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 text-zinc-700 dark:text-zinc-300"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(meta.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === meta.page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 text-zinc-700 dark:text-zinc-300"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Properties() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-950">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
