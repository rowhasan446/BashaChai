"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../Provider/AuthProvider";
import Swal from "sweetalert2";

export default function YourProperties() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Fetch user's properties
  useEffect(() => {
    if (!user) {
      router.push('/Login');
      return;
    }

    fetchUserProperties();
  }, [user, router]);

  const fetchUserProperties = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      // Get user ID from token or database
      const response = await fetch(`/api/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Filter properties by current user's email
        const userProperties = result.data.filter(
          prop => prop.createdByEmail === user.email
        );
        setProperties(userProperties);
      } else {
        setError(result.message || 'Failed to load properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId, propertyTitle) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${propertyTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setDeleting(propertyId);
        const token = await user.getIdToken();

        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Property deleted successfully!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });

          // Remove from state
          setProperties(properties.filter(p => p._id !== propertyId));
        } else {
          throw new Error(data.message || 'Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: error.message || 'Failed to delete property',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto flex items-center px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-black">
            BashaChai.com
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/">
              <button className="px-4 py-2 rounded-md border border-gray-300 hover:shadow-md hover:bg-gray-100 transition">
                Back to Home
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Your <span className="text-purple-700">Properties</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all your listed properties
              </p>
            </div>
            <Link href="/list-property">
              <button className="px-6 py-3 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                + Add New Property
              </button>
            </Link>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No Properties Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't listed any properties. Start by adding your first property!
              </p>
              <Link href="/list-property">
                <button className="px-6 py-3 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                  List Your First Property
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onDelete={handleDelete}
                  isDeleting={deleting === property._id}
                />
              ))}
            </div>
          )}

          {/* Statistics */}
          {properties.length > 0 && (
            <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-purple-700">{properties.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">For Rent</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {properties.filter(p => p.type === 'rent').length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">For Sale</p>
                  <p className="text-3xl font-bold text-green-700">
                    {properties.filter(p => p.type === 'sale').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyCard({ property, onDelete, isDeleting }) {
  const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <div className="relative">
        <img
          src={property.image || fallbackImage}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
          property.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        }`}>
          For {property.type === 'rent' ? 'Rent' : 'Sale'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {property.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-purple-700">{property.price}</span>
          <div className="text-sm text-gray-600">
            {property.beds > 0 && `${property.beds} Beds`}
            {property.beds > 0 && property.baths > 0 && ' • '}
            {property.baths > 0 && `${property.baths} Baths`}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Posted: {new Date(property.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>

        <div className="flex gap-2">
          <Link href={`/edit-property/${property._id}`} className="flex-1">
            <button className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </Link>
          <button
            onClick={() => onDelete(property._id, property.title)}
            disabled={isDeleting}
            className={`flex-1 px-4 py-2 rounded-md text-white transition flex items-center justify-center ${
              isDeleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
