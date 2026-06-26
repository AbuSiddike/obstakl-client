import Link from "next/link";
import { FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold text-lg shadow-md shadow-indigo-500/30">
                O
              </span>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Obstakl
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Discover, book, and secure your next rental property online. Connecting tenants and property owners transparently.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition shadow-sm"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition shadow-sm"
                aria-label="X (formerly Twitter)"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition shadow-sm"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition shadow-sm"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Locations */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Popular Locations
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties?search=Manhattan" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Manhattan, NY
                </Link>
              </li>
              <li>
                <Link href="/properties?search=Miami" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Miami, FL
                </Link>
              </li>
              <li>
                <Link href="/properties?search=Los+Angeles" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Los Angeles, CA
                </Link>
              </li>
              <li>
                <Link href="/properties?search=Brooklyn" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Brooklyn, NY
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Get In Touch
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center space-x-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                <FiMapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>100 Broadway St, New York, NY 10005</span>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                <FiPhone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                <FiMail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <a href="mailto:support@obstakl.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  support@obstakl.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Obstakl Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-zinc-400 dark:text-zinc-500">
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Terms of Service</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
