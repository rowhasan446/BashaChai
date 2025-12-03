"use client";

import { useState, useEffect, useContext, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../Provider/AuthProvider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "To Rent", href: "/to-rent" },
  { name: "For Sale", href: "/for-sale" },
  { name: "Properties", href: "/listings" },
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
  const [favorites, setFavorites] = useState([]);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("rent");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [hostels, setHostels] = useState([]);
  const [hostelFilter, setHostelFilter] = useState("all");
  const [hostelsLoading, setHostelsLoading] = useState(true);
  const [hostelsError, setHostelsError] = useState(null);

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

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties');
        const result = await response.json();

        if (result.success) {
          console.log('✅ Fetched properties:', result.data.length);
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

  useEffect(() => {
    async function fetchHostels() {
      try {
        setHostelsLoading(true);
        const response = await fetch('/api/properties');
        const result = await response.json();

        if (result.success) {
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

  const filteredHostels = hostels.filter(hostel => {
    if (hostelFilter === "all") return true;
    if (hostelFilter === "male") return hostel.category === "Male Student Hostel";
    if (hostelFilter === "female") return hostel.category === "Female Student Hostel";
    return true;
  });

  const filteredProperties = properties.filter((property) => {
    if (searchQuery === "" && selectedCategory === "") {
      return true;
    }

    const matchesSearch = 
      searchQuery === "" ||
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = property.type === selectedType;

    const matchesCategory = 
      selectedCategory === "" || 
      property.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

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

  function prevSlide() {
    setSlideIndex((slideIndex - 1 + sliderImages.length) % sliderImages.length);
  }

  function nextSlide() {
    setSlideIndex((slideIndex + 1) % sliderImages.length);
  }

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
        console.log('❌ Removed from favorites:', property.title);
      } else {
        updatedFavorites = [...prevFavorites, property];
        console.log('✅ Added to favorites:', property.title);
      }

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

  const isFavorited = (propertyId) => {
    return favorites.some(fav => fav._id === propertyId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('🔍 Searching:', { searchQuery, selectedType, selectedCategory });
  };

  return (
    <main className="font-sans bg-gray-50 text-black">
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

      <section className="text-center mt-10 px-4 sm:px-0 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">
          A great platform to sell and rent your <span className="text-purple-700">Properties.</span>
        </h1>
        <form onSubmit={handleSearch} className="inline-flex flex-wrap items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => setSelectedType("rent")}
            className={`px-6 py-2 rounded-md font-semibold shadow hover:shadow-lg transition ${
              selectedType === "rent"
                ? "bg-purple-700 text-white"
                : "border border-purple-700 text-purple-700 hover:text-purple-800 hover:border-purple-800"
            }`}
          >
            To rent
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("sale")}
            className={`px-6 py-2 rounded-md font-semibold shadow hover:shadow-lg transition ${
              selectedType === "sale"
                ? "bg-purple-700 text-white"
                : "border border-purple-700 text-purple-700 hover:text-purple-800 hover:border-purple-800"
            }`}
          >
            For sell
          </button>
          <input
            type="text"
            placeholder="Search Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-700 focus:outline-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-purple-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Flat to Rent">Flat/Apartment</option>
            <option value="Single Room to Rent">Single Room</option>
            <option value="Sublet Room to Rent">Sublet</option>
            <option value="Office Space to Rent">Office Space</option>
            <option value="Male Student Hostel">Male Hostel</option>
            <option value="Female Student Hostel">Female Hostel</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition font-semibold"
          >
            Search
          </button>
        </form>

        {(searchQuery || selectedCategory) && (
          <div className="mt-4 inline-flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
            <p className="text-sm text-purple-900">
              <span className="font-semibold">{filteredProperties.length}</span> properties found
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedType("rent");
              }}
              className="text-sm text-purple-700 hover:text-purple-800 font-semibold flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        )}
      </section>

      

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
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProperties.slice(0, 8).map((property) => (
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
            <div className="py-12 bg-white rounded-lg shadow-md">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg mb-4">No properties match your search</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedType("rent");
                }}
                className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 shadow hover:shadow-lg transition font-semibold"
              >
                Clear Filters
              </button>
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

      <section className="py-12 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Student <span className="text-purple-700">Hostels</span>
          </h2>
          <p className="text-gray-600 mb-6">Find comfortable and affordable hostel accommodation</p>
          
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

function HostelCard({ hostel, onViewDetails, onToggleFavorite, isFavorited }) {
  const { title, location, price, beds, baths, image, images, _id, category } = hostel;
  const fallbackImage = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";
  
  const displayImage = (images && images.length > 0) ? images[0] : (image || fallbackImage);
  const isMale = category === "Male Student Hostel";
  
  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 p-4 flex flex-col relative">
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

function PropertyModal({ property, onClose }) {
  const { user: authUser } = useContext(AuthContext);
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.image 
      ? [property.image] 
      : [fallbackImage];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setReviewsLoading(true);
        const response = await fetch(`/api/reviews?propertyId=${property._id}`);
        const result = await response.json();
        
        if (result.success) {
          setReviews(result.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    }

    if (property._id) {
      fetchReviews();
    }
  }, [property._id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!authUser) {
      alert('Please sign in to submit a review');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property._id,
          rating,
          comment: comment.trim(),
          userName: authUser.displayName || authUser.email.split('@')[0],
          userEmail: authUser.email
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setReviews(prev => [result.data, ...prev]);
        setComment("");
        setRating(5);
        alert('Review submitted successfully! ⭐');
      } else {
        alert('Failed to submit review: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

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
              <button onClick={previousImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110" aria-label="Previous image">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110" aria-label="Next image">
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
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {propertyImages.length > 1 && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {propertyImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-purple-700 ring-2 ring-purple-300' : 'border-gray-300 hover:border-purple-400'}`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

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

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-7 h-7 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Reviews & Ratings
              </h4>
              {reviews.length > 0 && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
                  <div className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                </div>
              )}
            </div>

            {authUser ? (
              <form onSubmit={handleSubmitReview} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-200">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h5>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <svg
                          className={`w-10 h-10 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-3 text-lg font-semibold text-gray-700">{rating} / 5</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    required
                    placeholder="Share your experience with this property..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    submittingReview
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-700 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-yellow-800 font-semibold">Please sign in to write a review</p>
              </div>
            )}

            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                  <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 font-semibold text-gray-700">{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p className="text-gray-600 font-semibold">No reviews yet</p>
                  <p className="text-gray-500 text-sm mt-1">Be the first to review this property!</p>
                </div>
              )}
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
