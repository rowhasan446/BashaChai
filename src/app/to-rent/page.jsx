"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "To Rent", href: "/to-rent" },
  { name: "For Sale", href: "/for-sale" },
  { name: "Properties", href: "/properties" },
  { name: "Inquiry", href: "/inquiry" },
  { name: "Contact", href: "/contact" },
  { name: "Blog", href: "/blog" },
];

export default function ToRentPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    document.title = "Properties To Rent | BashaChai";
    
    // Load favorites
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Fetch rent properties
  useEffect(() => {
    async function fetchRentProperties() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties?type=rent');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
          setProperties(result.data);
          console.log('✅ Loaded rent properties:', result.data.length);
        } else {
          setError(result.message || 'Failed to load properties');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRentProperties();
  }, []);

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = 
      searchQuery === "" ||
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === "" || 
      property.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  const toggleFavorite = (property) => {
    setFavorites((prevFavorites) => {
      let updatedFavorites;
      const existingIndex = prevFavorites.findIndex(fav => fav._id === property._id);
      
      if (existingIndex !== -1) {
        updatedFavorites = prevFavorites.filter(fav => fav._id !== property._id);
      } else {
        updatedFavorites = [...prevFavorites, property];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }

      return updatedFavorites;
    });
  };

  const isFavorited = (propertyId) => {
    return favorites.some(fav => fav._id === propertyId);
  };

  return (
    <main className="font-sans bg-gray-50 text-black min-h-screen">
      {/* Navbar */}
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
                  className={`text-black hover:bg-purple-200 hover:shadow-md rounded-md px-3 py-1 transition-transform transform hover:-translate-y-1 ${
                    link.name === "To Rent" ? "bg-purple-100 font-semibold" : ""
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-8 flex space-x-2">
            <button
              onClick={() => router.push('/Login')}
              className="text-[15px] tracking-widest bg-purple-400 px-6 py-2 text-black hover:bg-purple-500 transition-colors duration-200 rounded-md"
            >
              Sign In
            </button>
            <Link href="/list-property">
              <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                List Your Property
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-700">Home</Link>
            <span>›</span>
            <span className="text-black font-semibold">To Rent</span>
          </div>
        </div>
      </section>

      {/* Header Section */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Properties To Rent</h1>
          <p className="text-lg mb-8">Find your perfect rental property in Bangladesh</p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center">
            <input
              type="text"
              placeholder="Search by location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 rounded-lg text-black w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All Categories</option>
              <option value="Flat to Rent">Flat/Apartment</option>
              <option value="Single Room to Rent">Single Room</option>
              <option value="Sublet Room to Rent">Sublet</option>
              <option value="Office Space to Rent">Office Space</option>
              <option value="Male Student Hostel">Male Hostel</option>
              <option value="Female Student Hostel">Female Hostel</option>
            </select>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="px-6 py-3 bg-white text-purple-700 rounded-lg hover:bg-gray-100 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProperties.length} Properties Available
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-white rounded-lg shadow-md">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600"
            >
              Try Again
            </button>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onViewDetails={() => openModal(property)}
                onToggleFavorite={() => toggleFavorite(property)}
                isFavorited={isFavorited(property._id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-lg shadow-md">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-xl mb-4">No properties found</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Footer - Minimal & Clean Design */}
      <footer className="bg-purple-900 text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">BashaChai.com</h3>
                  <p className="text-sm text-purple-200">Find your dream home</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mt-4">
                Your trusted property classifieds website in Bangladesh. Find the best opportunities to buy, sell, or rent real estate with ease.
              </p>
            </div>

            {/* Information Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Information</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition text-sm">About Us</Link></li>
                <li><Link href="/post-ad" className="text-gray-300 hover:text-white transition text-sm">How to Post Ad</Link></li>
                <li><Link href="/boost-ad" className="text-gray-300 hover:text-white transition text-sm">How to Boost Ad</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white transition text-sm">FAQ</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white transition text-sm">Blog</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal & Policy</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white transition text-sm">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition text-sm">Terms of Use</Link></li>
                <li><Link href="/cookies" className="text-gray-300 hover:text-white transition text-sm">Cookie Policy</Link></li>
                <li><Link href="/listing-policy" className="text-gray-300 hover:text-white transition text-sm">Listing Policy</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-purple-300 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-300">+880 177554 9500</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-purple-300 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300">support@bashachai.com</span>
                </li>
                <li className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-purple-300 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300">Flat 4, House #10A, Road #3/A, Dhaka</span>
                </li>
              </ul>

              {/* Social Media Icons */}
              <div className="flex space-x-3 mt-6">
                <a href="#" className="w-9 h-9 bg-purple-800 hover:bg-purple-700 rounded-full flex items-center justify-center transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-purple-800 hover:bg-purple-700 rounded-full flex items-center justify-center transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-purple-800 hover:bg-purple-700 rounded-full flex items-center justify-center transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-purple-800 hover:bg-purple-700 rounded-full flex items-center justify-center transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Minimal */}
        <div className="border-t border-purple-800">
          <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-300">© 2025 BashaChai.com - All rights reserved</p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition">Terms</Link>
              <Link href="/sitemap" className="text-gray-300 hover:text-white transition">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={closeModal} />
      )}
    </main>
  );
}

// Property Card Component
function PropertyCard({ property, onViewDetails, onToggleFavorite, isFavorited }) {
  const { title, location, price, beds, baths, images, image } = property;
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  const displayImage = (images && images.length > 0) ? images[0] : (image || fallbackImage);
  
  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 p-4 flex flex-col relative">
      <button
        onClick={onToggleFavorite}
        className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
      >
        {isFavorited ? (
          <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>

      <img src={displayImage} alt={title} className="w-full h-48 object-cover rounded-xl mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>
      <p className="text-gray-600 text-sm mt-1">{location}</p>
      <div className="text-sm text-gray-600 mt-1">
        {beds > 0 && `${beds} Beds`} {beds > 0 && baths > 0 && " • "} {baths > 0 && `${baths} Baths`}
      </div>
      <p className="text-xl font-bold text-purple-700 mt-2">{price}</p>
      <button
        onClick={onViewDetails}
        className="mt-4 px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 transition w-full"
      >
        View Details
      </button>
    </div>
  );
}

// Property Modal Component
function PropertyModal({ property, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{property.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {/* Image Gallery */}
          {property.images && property.images.length > 0 ? (
            <div className="mb-4">
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-96 object-cover rounded-lg mb-2" 
              />
              {property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.images.slice(1, 5).map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`${property.title} ${idx + 2}`} 
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <img 
              src={property.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"} 
              alt={property.title} 
              className="w-full h-80 object-cover rounded-lg mb-4" 
            />
          )}
          
          <div className="mb-4">
            <p className="text-3xl font-bold text-purple-700">{property.price}</p>
            <p className="text-gray-500 text-sm mt-1">{property.type === 'rent' ? 'For Rent' : 'For Sale'}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold">{property.location}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold">{property.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-semibold">{property.beds || 0} Beds</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-semibold">{property.baths || 0} Baths</p>
            </div>
            {property.size && (
              <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-semibold">{property.size}</p>
              </div>
            )}
          </div>

          {property.createdByName && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Listed by</p>
              <p className="font-semibold">{property.createdByName}</p>
              {property.createdByEmail && (
                <p className="text-sm text-gray-600">{property.createdByEmail}</p>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition font-semibold">
              Contact Owner
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
