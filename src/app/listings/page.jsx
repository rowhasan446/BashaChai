"use client";

import { useState, useEffect, useContext, useRef } from "react";
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

export default function ListingsPage() {
  const router = useRouter();
  const { user: authUser, logOut } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const dropdownRef = useRef(null);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // rent, sale, all
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Load favorites from localStorage
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

  // Fetch all properties
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties');
        const result = await response.json();

        if (result.success) {
          setProperties(result.data);
        } else {
          setError(result.message || 'Failed to load properties');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  // Close profile dropdown when clicking outside
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

  // Close modal on Escape key
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
      })
      .catch((error) => console.error('Error signing out:', error));
  };

  const handleSignIn = (e) => {
    router.push('/Login');
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

  const toggleFavorite = (property) => {
    if (!authUser) {
      alert('Please sign in to add favorites!');
      router.push('/Login');
      return;
    }

    setFavorites((prevFavorites) => {
      let updatedFavorites;
      const existingIndex = prevFavorites.findIndex(fav => fav._id === property._id);
      
      if (existingIndex !== -1) {
        updatedFavorites = prevFavorites.filter(fav => fav._id !== property._id);
      } else {
        updatedFavorites = [...prevFavorites, property];
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        } catch (error) {
          console.error('Error saving favorites:', error);
        }
      }

      return updatedFavorites;
    });
  };

  const isFavorited = (propertyId) => {
    return favorites.some(fav => fav._id === propertyId);
  };

  // Filter and Sort Logic
  const filteredAndSortedProperties = properties
    .filter((property) => {
      // Search filter
      const matchesSearch = 
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === "all" || property.category === categoryFilter;

      // Type filter (rent/sale)
      const matchesType = typeFilter === "all" || property.type === typeFilter;

      // Price filter
      let matchesPrice = true;
      if (priceFilter !== "all") {
        const priceValue = parseInt(property.price?.replace(/[^0-9]/g, '') || 0);
        switch (priceFilter) {
          case "under10k":
            matchesPrice = priceValue < 10000;
            break;
          case "10k-25k":
            matchesPrice = priceValue >= 10000 && priceValue <= 25000;
            break;
          case "25k-50k":
            matchesPrice = priceValue > 25000 && priceValue <= 50000;
            break;
          case "above50k":
            matchesPrice = priceValue > 50000;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesType && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-low":
          return parseInt(a.price?.replace(/[^0-9]/g, '') || 0) - parseInt(b.price?.replace(/[^0-9]/g, '') || 0);
        case "price-high":
          return parseInt(b.price?.replace(/[^0-9]/g, '') || 0) - parseInt(a.price?.replace(/[^0-9]/g, '') || 0);
        default:
          return 0;
      }
    });

  return (
    <main className="font-sans bg-gray-50 text-black min-h-screen">
      {/* Navbar */}
     ?

      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-3">All Properties</h1>
          <p className="text-purple-100">Browse through {properties.length} available properties</p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
              <svg className="w-6 h-6 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Flat to Rent">Flat/Apartment</option>
              <option value="Single Room to Rent">Single Room</option>
              <option value="Sublet Room to Rent">Sublet</option>
              <option value="Office Space to Rent">Office Space</option>
              <option value="Male Student Hostel">Male Hostel</option>
              <option value="Female Student Hostel">Female Hostel</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="under10k">Under ৳10,000</option>
              <option value="10k-25k">৳10,000 - ৳25,000</option>
              <option value="25k-50k">৳25,000 - ৳50,000</option>
              <option value="above50k">Above ৳50,000</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Active Filters Count */}
          {(searchQuery || categoryFilter !== "all" || typeFilter !== "all" || priceFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredAndSortedProperties.length}</span> of {properties.length} properties
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setTypeFilter("all");
                  setPriceFilter("all");
                  setSortBy("newest");
                }}
                className="text-sm text-purple-700 hover:text-purple-800 font-semibold flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : filteredAndSortedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredAndSortedProperties.map((property) => (
              <ListingCard
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setTypeFilter("all");
                setPriceFilter("all");
              }}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 shadow hover:shadow-lg transition font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

         {/* Footer */}
      <footer className="bg-purple-900 text-white py-12">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <div className="font-bold text-xl mb-2">BashaChai.com</div>
          <div>Find your dream home</div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-24 mb-8">
          <div>
            <h4 className="font-semibold mb-3">Information</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/post-ad" className="hover:underline">How to Post Ad</Link></li>
              <li><Link href="/boost-ad" className="hover:underline">How to Boost Ad</Link></li>
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal and Policy</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Use</Link></li>
              <li><Link href="/cookies" className="hover:underline">Cookie Policy</Link></li>
              <li><Link href="/listing-policy" className="hover:underline">Listing Policy</Link></li>
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

      {/* Property Modal */}
      {isModalOpen && selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={closeModal} />
      )}
    </main>
  );
}

// ListingCard Component (same as homepage)
function ListingCard({ property, onViewDetails, onToggleFavorite, isFavorited }) {
  const { title, location, price, beds, baths, image, images, category } = property;
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  
  const displayImage = (images && images.length > 0) ? images[0] : (image || fallbackImage);
  
  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 p-4 flex flex-col relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorited ? (
          <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>

      {/* Category Badge */}
      {category && (
        <div className="absolute top-6 left-6 z-10 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
          {category}
        </div>
      )}

      <div className="relative mt-8">
        <img src={displayImage} alt={title} className="w-full h-32 object-cover rounded-xl mb-3" />
        {images && images.length > 1 && (
          <div className="absolute bottom-5 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {images.length}
          </div>
        )}
      </div>

      <div className="text-black font-semibold text-lg line-clamp-2">{title}</div>
      <div className="text-black text-sm mt-1 flex items-center">
        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {location}
      </div>
      <div className="text-black text-sm mt-1">
        {beds > 0 && `${beds} Beds`} {beds > 0 && baths > 0 && " • "} {baths > 0 && `${baths} Baths`}
      </div>
      <div className="text-black font-bold text-xl mt-2">{price}</div>
      <button
        onClick={onViewDetails}
        className="mt-4 px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition w-full"
      >
        View Details
      </button>
    </div>
  );
}

// PropertyModal Component (copy from your homepage - same modal code)
function PropertyModal({ property, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.image 
      ? [property.image] 
      : [fallbackImage];

  const previousImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? propertyImages.length - 1 : prev - 1);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === propertyImages.length - 1 ? 0 : prev + 1);
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

        <div className="relative w-full h-80 overflow-hidden bg-gray-900">
          <img
            src={propertyImages[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-300"
          />

          {propertyImages.length > 1 && (
            <>
              <button onClick={previousImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110">
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
                    className={`transition-all ${index === currentImageIndex ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white bg-opacity-50 hover:bg-opacity-75'} rounded-full`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rest of modal content - same as homepage PropertyModal */}
        <div className="p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-purple-700">{property.price}</p>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${property.type === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                For {property.type === 'rent' ? 'Rent' : 'Sale'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900">{property.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="text-lg font-semibold text-gray-900">{property.category}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <a href={`mailto:${property.createdByEmail}?subject=Inquiry about ${property.title}`} className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition font-semibold text-center">
              Send Email
            </a>
            <a href={`tel:+8801775549500`} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center">
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
