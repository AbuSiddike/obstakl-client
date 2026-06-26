'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: '/dashboard',
      });

      if (res) {
        toast.success('Signed in successfully!');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err) {
      console.error(err);
      toast.error('Google sign in failed.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 shadow-xl"
      >
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25 mb-4">
            O
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your Obstakl dashboard
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <FiMail className="w-5 h-5" />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Link
                href="#"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-500 dark:text-zinc-400">
              Or sign in with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-2.5 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 font-semibold transition"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        {/* Toggle Register */}
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Register Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
