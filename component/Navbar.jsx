'use client'

import { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../Provider/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const { user: authUser, logOut } = useContext(AuthContext);
  
  // ✅ Declare all state FIRST before using them
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const dropdownRef = useRef(null);

  // ✅ Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites);
          setFavorites(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleSignIn = (e) => {
    router.push('/Login');
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    setProfileDropdownOpen(false);
    logOut()
      .then(() => {
        console.log('User signed out successfully');
      })
      .catch((error) => console.error('Error signing out:', error));
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "To Rent", href: "/to-rent" },
    { name: "For Sale", href: "/for-sale" },
    { name: "Properties", href: "/listings" },
    { name: "Inquiry", href: "/inquiry" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="container mx-auto flex items-center px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-black">
          BashaChai.com
        </Link>
        <ul className="flex space-x-6 ml-auto">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-black hover:bg-purple-200 hover:shadow-md rounded-md px-3 py-1 transition-transform transform hover:-translate-y-1"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-8 flex items-center space-x-4">
          {!authUser ? (
            <>
              <button
                onClick={handleSignIn}
                className="text-[15px] tracking-widest bg-purple-400 px-6 py-2 text-black hover:bg-purple-500 transition-colors duration-200 rounded-md"
              >
                Sign In
              </button>
              <Link href="/list-property">
                <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                  List Your Property
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/list-property">
                <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                  List Your Property
                </button>
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-700 hover:bg-purple-600 transition flex items-center justify-center text-white border-2 border-purple-700 cursor-pointer">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white border-2 border-purple-700">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {authUser?.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {authUser?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/favourites"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Favourites ({favorites.length})
                      </Link>

                      <Link
                        href="/your-properties"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Your Properties
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
