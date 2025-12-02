"use client";

import { useState, useEffect, useContext, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../Provider/AuthProvider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "To Rent", href: "/to-rent" },
  { name: "For Sale", href: "/for-sale" },
  { name: "Properties", href: "/properties" },
  { name: "Inquiry", href: "/inquiry" },
  { name: "Contact", href: "/contact" },
  { name: "Blog", href: "/blog" },
];

const sliderImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=1200&q=80"
];

const featuredImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1457296898342-cdd24585d095?auto=format&fit=crop&w=800&q=80",
];

export default function HomePage() {
  const router = useRouter();
  const { user: authUser, logOut } = useContext(AuthContext);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const dropdownRef = useRef(null);

  // ✅ NEW: Student Hostel States
  const [hostels, setHostels] = useState([]);
  const [hostelFilter, setHostelFilter] = useState("all"); // "all", "male", "female"
  const [hostelsLoading, setHostelsLoading] = useState(true);
  const [hostelsError, setHostelsError] = useState(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites);
          setFavorites(Array.isArray(parsed) ? parsed : []);
          console.log('✅ Loaded favorites from localStorage:', parsed.length);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  // Check if user is logged in on component mount
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch properties from backend
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties?limit=8');
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

  // ✅ NEW: Fetch Student Hostels
  useEffect(() => {
    async function fetchHostels() {
      try {
        setHostelsLoading(true);
        const response = await fetch('/api/properties');
        const result = await response.json();

        if (result.success) {
          // Filter only hostel properties
          const hostelProperties = result.data.filter(
            prop => prop.category === "Male Student Hostel" || prop.category === "Female Student Hostel"
          );
          setHostels(hostelProperties);
          console.log('✅ Loaded hostels:', hostelProperties.length);
        } else {
          setHostelsError(result.message || 'Failed to load hostels');
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
        setHostelsError('Failed to load hostels');
      } finally {
        setHostelsLoading(false);
      }
    }

    fetchHostels();
  }, []);

  // ✅ NEW: Filter hostels based on selected filter
  const filteredHostels = hostels.filter(hostel => {
    if (hostelFilter === "all") return true;
    if (hostelFilter === "male") return hostel.category === "Male Student Hostel";
    if (hostelFilter === "female") return hostel.category === "Female Student Hostel";
    return true;
  });

  // Close modal when clicking outside
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

  function prevSlide() {
    setSlideIndex((slideIndex - 1 + sliderImages.length) % sliderImages.length);
  }

  function nextSlide() {
    setSlideIndex((slideIndex + 1) % sliderImages.length);
  }

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

  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Toggle favorite function
  const toggleFavorite = (property) => {
    if (!authUser) {
      alert('Please sign in to add favorites!');
      router.push('/Login');
      return;
    }

    setFavorites((prevFavorites) => {
      let updatedFavorites;
      
      // Check if property already in favorites
      const existingIndex = prevFavorites.findIndex(fav => fav._id === property._id);
      
      if (existingIndex !== -1) {
        // Remove from favorites
        updatedFavorites = prevFavorites.filter(fav => fav._id !== property._id);
        console.log('❌ Removed from favorites:', property.title);
      } else {
        // Add to favorites
        updatedFavorites = [...prevFavorites, property];
        console.log('✅ Added to favorites:', property.title);
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
          console.log('💾 Saved to localStorage. Total favorites:', updatedFavorites.length);
        } catch (error) {
          console.error('Error saving favorites:', error);
        }
      }

      return updatedFavorites;
    });
  };

  // Check if property is favorited
  const isFavorited = (propertyId) => {
    return favorites.some(fav => fav._id === propertyId);
  };

  return (
    <main className="font-sans bg-gray-50 text-black">
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

      {/* Slider Banner */}
      <section className="relative max-w-6xl mx-auto mt-8 rounded-lg overflow-hidden shadow-lg">
        <img
          src={sliderImages[slideIndex]}
          alt={`Slide ${slideIndex + 1}`}
          className="w-full h-64 sm:h-80 md:h-96 object-cover transition-opacity duration-500"
          key={sliderImages[slideIndex]}
        />
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-purple-700 text-white p-2 hover:bg-purple-600 shadow-lg transition"
        >
          &#8249;
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-purple-700 text-white p-2 hover:bg-purple-600 shadow-lg transition"
        >
          &#8250;
        </button>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-3">
          {sliderImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`w-3 h-3 rounded-full transition-opacity ${
                idx === slideIndex ? "opacity-100 bg-purple-700" : "opacity-40 bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Main Heading & Search */}
      <section className="text-center mt-10 px-4 sm:px-0 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">
          A great platform to sell and rent your <span className="text-purple-700">Properties.</span>
        </h1>
        <div className="inline-flex items-center space-x-3 justify-center">
          <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
            To rent
          </button>
          <button className="px-4 py-2 rounded-md border border-purple-700 text-purple-700 hover:text-purple-800 hover:border-purple-800 transition">
            For sell
          </button>
          <input
            type="text"
            placeholder="Search Location..."
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          />
          <select className="px-3 py-2 border border-gray-300 rounded-md text-black">
            <option>Select Type</option>
          </select>
          <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
            Search
          </button>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-semibold mb-10">
          Our Most Popular <span className="text-purple-700">Categories</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {featuredImages.map((img, index) => (
            <CategoryCard
              key={index}
              img={img}
              title={[
                "Flat to Rent",
                "Single Room to Rent",
                "Sublet Room to Rent",
                "Office Space to Rent",
                "Girls Hostel to Rent",
              ][index]}
              count={[
                "528",
                "333",
                "207",
                "911",
                "395",
              ][index]}
            />
          ))}
        </div>
      </section>

      {/* Top Picks */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex space-x-4 mb-6">
            <button className="px-5 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
              Top Picks
            </button>
            <button className="px-5 py-2 rounded-md border border-purple-700 text-purple-700 hover:text-purple-800 hover:border-purple-800 transition">
              Recent Views
            </button>
            <button className="px-5 py-2 rounded-md border border-purple-700 text-purple-700 hover:text-purple-800 hover:border-purple-800 transition">
              Watchlist
            </button>
          </div>
          <p className="mb-8">Explore a wide range of properties for sale and rent, tailored to your needs.</p>
          
          {loading ? (
            <div className="py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {properties.map((property) => (
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
            <div className="py-12">
              <p className="text-gray-600">No properties found. Be the first to list!</p>
            </div>
          )}
          
          <div className="mt-10">
            <Link href="/listings">
              <button className="px-6 py-3 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                See all
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ NEW: Student Hostels Section */}
      <section className="py-12 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Student <span className="text-purple-700">Hostels</span>
          </h2>
          <p className="text-gray-600 mb-6">Find comfortable and affordable hostel accommodation</p>
          
          {/* Gender Filter Buttons */}
          <div className="inline-flex space-x-4">
            <button
              onClick={() => setHostelFilter("all")}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                hostelFilter === "all"
                  ? "bg-purple-700 text-white shadow-lg"
                  : "border border-purple-700 text-purple-700 hover:bg-purple-50"
              }`}
            >
              All Hostels
            </button>
            <button
              onClick={() => setHostelFilter("male")}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                hostelFilter === "male"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "border border-blue-600 text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Male Hostels
            </button>
            <button
              onClick={() => setHostelFilter("female")}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                hostelFilter === "female"
                  ? "bg-pink-600 text-white shadow-lg"
                  : "border border-pink-600 text-pink-600 hover:bg-pink-50"
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Female Hostels
            </button>
          </div>
        </div>

        {/* Hostels Display */}
        {hostelsLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            <p className="mt-4 text-gray-600">Loading hostels...</p>
          </div>
        ) : hostelsError ? (
          <div className="py-12 text-center">
            <p className="text-red-600">{hostelsError}</p>
          </div>
        ) : filteredHostels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredHostels.slice(0, 8).map((hostel) => (
              <HostelCard
                key={hostel._id}
                hostel={hostel}
                onViewDetails={() => openModal(hostel)}
                onToggleFavorite={() => toggleFavorite(hostel)}
                isFavorited={isFavorited(hostel._id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-lg shadow-md">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-600 text-lg">No {hostelFilter === "all" ? "" : hostelFilter} hostels available at the moment</p>
          </div>
        )}
      </section>

      {/* Discover Cities */}
      <section className="py-12 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-semibold mb-8">
          Discover towns and cities
        </h2>
        <div className="flex justify-center space-x-4 mb-8">
          <button className="px-6 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
            For sale
          </button>
          <button className="px-6 py-2 rounded-md border border-purple-700 text-purple-700 hover:text-purple-800 hover:border-purple-800 transition">
            To rent
          </button>
        </div>
        <div className="flex justify-center space-x-20 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold mb-3">In the city</h3>
            <ul className="space-y-2 text-black">
              <li>Live among the hustle and bustle</li>
              <li>Properties for sale in New Market</li>
              <li>Properties for sale in Mirpur 1</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Rural and countryside</h3>
            <ul className="space-y-2 text-black">
              <li>Enjoy living close to nature</li>
              <li>Properties for sale in Ranisankail</li>
              <li>Properties for sale in Kamarkanda</li>
            </ul>
          </div>
        </div>
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

      {/* Property Details Modal */}
      {isModalOpen && selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={closeModal} />
      )}
    </main>
  );
}

function CategoryCard({ img, title, count }) {
  return (
    <div className="w-48 rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 cursor-pointer">
      <img src={img} alt={title} className="w-full h-28 object-cover rounded-t-xl" />
      <div className="p-4 text-black">
        <div className="font-semibold text-lg">{title}</div>
        <div>{count} Listings</div>
      </div>
    </div>
  );
}

function ListingCard({ property, onViewDetails, onToggleFavorite, isFavorited }) {
  const { title, location, price, beds, baths, image, images, _id } = property;
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  
  // Use first image from images array, fallback to single image or default
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

      <div className="relative">
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

      <div className="text-black font-semibold text-lg">{title}</div>
      <div className="text-black text-sm mt-1">{location}</div>
      <div className="text-black text-sm mt-1">
        {beds > 0 && `${beds} Beds`} {beds > 0 && baths > 0 && " • "} {baths > 0 && `${baths} Baths`}
      </div>
      <div className="text-black font-bold mt-2">{price}</div>
      <button
        onClick={onViewDetails}
        className="mt-4 px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition w-full"
      >
        View Details
      </button>
    </div>
  );
}

// ✅ NEW: Hostel Card Component (similar to ListingCard but with gender badge)
function HostelCard({ hostel, onViewDetails, onToggleFavorite, isFavorited }) {
  const { title, location, price, beds, baths, image, images, _id, category } = hostel;
  const fallbackImage = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";
  
  const displayImage = (images && images.length > 0) ? images[0] : (image || fallbackImage);
  const isMale = category === "Male Student Hostel";
  
  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 p-4 flex flex-col relative">
      {/* Gender Badge */}
      <div className={`absolute top-6 left-6 z-10 px-3 py-1 rounded-full text-xs font-bold ${
        isMale ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
      }`}>
        {isMale ? '♂ Male' : '♀ Female'}
      </div>

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

      <div className="relative">
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

function PropertyModal({ property, onClose }) {
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  
  // Get images array - support both new 'images' array and old single 'image' field
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.image 
      ? [property.image] 
      : [fallbackImage];

  // State for image carousel (ONLY DECLARE ONCE)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Navigate to previous image
  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  // Go to specific image
  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Keyboard navigation
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
        {/* Modal Header */}
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
          {/* Current Image */}
          <img
            src={propertyImages[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-300"
          />

          {/* Navigation Buttons - Only show if multiple images */}
          {propertyImages.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {currentImageIndex + 1} / {propertyImages.length}
              </div>

              {/* Dot Indicators */}
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
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery - Only show if multiple images */}
        {propertyImages.length > 1 && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {propertyImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-purple-700 ring-2 ring-purple-300'
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Property Details */}
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
