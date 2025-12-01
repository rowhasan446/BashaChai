"use client";

import { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../Provider/AuthProvider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "To Rent", href: "/to-rent" },
  { name: "For Sale", href: "/for-sale" },
  { name: "Properties", href: "/properties" },
  { name: "Inquiry", href: "/inquiry" },
  { name: "Contact", href: "/contact" },
  { name: "Blog", href: "/blog" },
];

export default function FavouritesPage() {
  const router = useRouter();
  const { user: authUser, logOut } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check authentication and load favorites
  useEffect(() => {
    if (!authUser) {
      router.push('/Login');
      return;
    }
    loadFavorites();
  }, [authUser, router]);

  // Load favorites from localStorage
  const loadFavorites = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites);
          setFavorites(Array.isArray(parsed) ? parsed : []);
          console.log('✅ Loaded favorites:', parsed.length);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    }
  };

  // Remove from favorites
  const removeFavorite = (propertyId) => {
    const updatedFavorites = favorites.filter(fav => fav._id !== propertyId);
    setFavorites(updatedFavorites);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        console.log('✅ Removed from favorites. Remaining:', updatedFavorites.length);
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  };

  // Close dropdown when clicking outside
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

  // Close modal on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleSignOut = (e) => {
    e.preventDefault();
    setProfileDropdownOpen(false);
    logOut()
      .then(() => {
        console.log('User signed out successfully');
        router.push('/');
      })
      .catch((error) => console.error('Error signing out:', error));
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
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
                  className="text-black hover:bg-purple-200 hover:shadow-md rounded-md px-3 py-1 transition-transform transform hover:-translate-y-1"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-8 flex items-center space-x-4">
            <Link href="/list-property">
              <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                List Your Property
              </button>
            </Link>
            
            {/* Profile Dropdown */}
            {authUser && (
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
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
                        className="flex items-center px-4 py-2 text-sm text-purple-700 bg-purple-50 font-semibold"
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
            )}
          </div>
        </nav>
      </header>

      {/* Page Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-10 h-10 mr-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                My Favourites
              </h1>
              <p className="text-gray-600">Properties you've saved for later</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-700">{favorites.length}</p>
              <p className="text-sm text-gray-500">Saved Properties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-32 h-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">No Favourites Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Start exploring and save properties you love!</p>
            <Link href="/">
              <button className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 shadow hover:shadow-lg transition text-lg font-semibold">
                Browse Properties
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-700">
                Showing <span className="font-semibold">{favorites.length}</span> {favorites.length === 1 ? 'property' : 'properties'}
              </p>
              <button
                onClick={loadFavorites}
                className="flex items-center text-purple-700 hover:text-purple-800 font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {favorites.map((property) => (
                <FavoritePropertyCard
                  key={property._id}
                  property={property}
                  onRemove={() => removeFavorite(property._id)}
                  onViewDetails={() => openModal(property)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <div className="font-bold text-xl mb-2">BashaChai.com</div>
          <div>Find your dream home</div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-24 mb-8">
          <div>
            <h4 className="font-semibold mb-3">Information</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal and Policy</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Use</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>+880 177554 9500</li>
              <li>support@bashachai.com</li>
              <li>Office: Flat 4, House #10A, Road #3/A, Dhaka</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-300">© 2025 BashaChai. All rights reserved.</div>
      </footer>

      {/* Property Details Modal */}
      {isModalOpen && selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={closeModal} />
      )}
    </main>
  );
}

// Favorite Property Card Component
function FavoritePropertyCard({ property, onRemove, onViewDetails }) {
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  const displayImage = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : (property.image || fallbackImage);
  
  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 p-4 flex flex-col relative group">
      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('Remove this property from favourites?')) {
            onRemove();
          }
        }}
        className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
        aria-label="Remove from favorites"
      >
        <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Property Image */}
      <div className="relative">
        <img src={displayImage} alt={property.title} className="w-full h-32 object-cover rounded-xl mb-3" />
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-5 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {property.images.length}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="text-black font-semibold text-lg line-clamp-2">{property.title}</div>
      <div className="text-black text-sm mt-1 flex items-center">
        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {property.location}
      </div>
      
      {/* Beds and Baths */}
      <div className="text-black text-sm mt-1 flex items-center gap-3">
        {property.beds > 0 && (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.beds} Beds
          </span>
        )}
        {property.baths > 0 && (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            {property.baths} Baths
          </span>
        )}
      </div>
      
      {/* Price */}
      <div className="text-black font-bold text-xl mt-2">{property.price}</div>
      
      {/* Category Badge */}
      {property.category && (
        <div className="mt-2">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
            {property.category}
          </span>
        </div>
      )}
      
      {/* View Details Button */}
      <button
        onClick={onViewDetails}
        className="mt-4 px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition w-full"
      >
        View Details
      </button>
    </div>
  );
}

// Reuse the PropertyModal from your HomePage (copy the entire PropertyModal function here)
function PropertyModal({ property, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.image 
      ? [property.image] 
      : [fallbackImage];

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') previousImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, propertyImages.length]);
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative w-full h-80 overflow-hidden bg-gray-900">
          <img
            src={propertyImages[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-300"
          />

          {propertyImages.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {currentImageIndex + 1} / {propertyImages.length}
              </div>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {propertyImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`transition-all ${
                      index === currentImageIndex
                        ? 'w-8 h-3 bg-white'
                        : 'w-3 h-3 bg-white bg-opacity-50 hover:bg-opacity-75'
                    } rounded-full`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rest of modal content - same as HomePage */}
        <div className="p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-purple-700">{property.price}</p>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                property.type === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                For {property.type === 'rent' ? 'Rent' : 'Sale'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="text-lg font-semibold text-gray-900">{property.category}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Property Features</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="text-xl font-bold text-gray-900">{property.beds || 0}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="text-xl font-bold text-gray-900">{property.baths || 0}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <p className="text-sm text-gray-500">Size</p>
                <p className="text-xl font-bold text-gray-900">{property.size ? `${property.size} sqft` : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Property Owner
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-semibold text-gray-900">{property.createdByName || 'Property Owner'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-semibold text-gray-900">{property.createdByEmail || 'contact@bashachai.com'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Posted On</p>
                <p className="text-lg font-semibold text-gray-900">
                  {property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <a
              href={`mailto:${property.createdByEmail}?subject=Inquiry about ${property.title}`}
              className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition font-semibold text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </a>
            <a
              href={`tel:+8801775549500`}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
