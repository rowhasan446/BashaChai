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

export default function ForSalePage() {
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
    document.title = "Properties For Sale | BashaChai";
    
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

  // Fetch sale properties
  useEffect(() => {
    async function fetchSaleProperties() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties?type=sale');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
          setProperties(result.data);
          console.log('✅ Loaded sale properties:', result.data.length);
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

    fetchSaleProperties();
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
    

      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-700">Home</Link>
            <span>›</span>
            <span className="text-black font-semibold">For Sale</span>
          </div>
        </div>
      </section>

      {/* Header Section - Green theme */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Properties For Sale</h1>
          <p className="text-lg mb-8">Find your dream property to buy in Bangladesh</p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center">
            <input
              type="text"
              placeholder="Search by location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 rounded-lg text-black w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">All Categories</option>
              <option value="Flat/Apartment">Flat/Apartment</option>
              <option value="House">House</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial Property</option>
            </select>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-gray-100 font-semibold"
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
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-700"></div>
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
              className="mt-4 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600"
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
              className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

     

      {/* Modal */}
      {isModalOpen && selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={closeModal} />
      )}
    </main>
  );
}

// Property Card Component - Green theme
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
      <p className="text-xl font-bold text-green-700 mt-2">{price}</p>
      <button
        onClick={onViewDetails}
        className="mt-4 px-4 py-2 rounded-md bg-green-700 text-white hover:bg-green-600 transition w-full"
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
            <p className="text-3xl font-bold text-green-700">{property.price}</p>
            <p className="text-gray-500 text-sm mt-1">For Sale</p>
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
            <button className="flex-1 bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold">
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
