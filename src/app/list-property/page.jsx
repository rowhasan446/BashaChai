"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../../../Provider/AuthProvider";
import Swal from "sweetalert2";

export default function ListProperty() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // ✅ CHANGED: Arrays for multiple images
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "Flat to Rent",
    purpose: "rent",
    location: "",
    price: "",
    size: "",
    beds: "",
    baths: "",
    description: ""
  });

  // Check authentication status
  useEffect(() => {
    const authCheckTimeout = setTimeout(() => {
      if (user === null || user === undefined) {
        console.log("❌ Auth timeout - redirecting to login...");
        setAuthLoading(false);
        router.push("/Login");
      }
    }, 2000);

    if (user === null || user === undefined) {
      setAuthLoading(true);
    } else if (!user || user === false) {
      console.log("❌ User not authenticated, redirecting to login...");
      setAuthLoading(false);
      clearTimeout(authCheckTimeout);
      router.push("/Login");
    } else {
      console.log("✅ User authenticated:", user.email);
      setAuthLoading(false);
      clearTimeout(authCheckTimeout);
    }

    return () => clearTimeout(authCheckTimeout);
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ UPDATED: Handle multiple image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file size and type
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of files) {
      if (file.size > maxSize) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: `${file.name} exceeds 10MB`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        continue;
      }

      if (!file.type.startsWith('image/')) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: `${file.name} is not an image file`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = null;
      return;
    }

    // ✅ Add new files to existing ones
    setImageFiles(prev => [...prev, ...validFiles]);

    // ✅ Create previews for all new files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = null; // Reset input to allow re-selecting same files
  };

  // ✅ UPDATED: Remove individual image by index
  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "You must be logged in to list a property",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      router.push("/Login");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        const idToken = await user.getIdToken();
        localStorage.setItem('auth-token', idToken);
      }

      const authToken = token || await user.getIdToken();

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('beds', formData.beds || '0');
      formDataToSend.append('baths', formData.baths || '0');
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.type);
      formDataToSend.append('type', formData.purpose);
      formDataToSend.append('size', formData.size || '');
      
      // ✅ UPDATED: Append all images
      imageFiles.forEach((file, index) => {
        formDataToSend.append('images', file); // Use 'images' (plural) or 'image' multiple times
      });

      console.log("🔍 Submitting property with", imageFiles.length, "images...");

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
        body: formDataToSend
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Success result:", result);

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Property listed successfully! 🎉",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        
        // Reset form
        setFormData({
          title: "",
          type: "Flat to Rent",
          purpose: "rent",
          location: "",
          price: "",
          size: "",
          beds: "",
          baths: "",
          description: ""
        });
        setImageFiles([]);
        setImagePreviews([]);
        
        router.push("/");
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: result.message || "Failed to list property",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: `Error: ${error.message}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto flex items-center px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-black">
            BashaChai.com
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              Welcome, <span className="font-semibold">{user.email}</span>
            </span>
            <Link href="/">
              <button className="px-4 py-2 rounded-md border border-gray-300 hover:shadow-md hover:bg-gray-100 transition">
                Back to Home
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
            List Your <span className="text-purple-700">Property</span>
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Fill in your property details to publish your listing.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Property Title *</label>
              <input
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Beautiful 2BHK Apartment"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Property Type *</label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-700 focus:outline-none"
              >
                <option value="Flat to Rent">Flat to Rent</option>
                <option value="Single Room to Rent">Single Room to Rent</option>
                <option value="Sublet Room to Rent">Sublet Room to Rent</option>
                <option value="Office Space to Rent">Office Space to Rent</option>
                <option value="Girls Hostel to Rent">Girls Hostel to Rent</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Listing Purpose *</label>
              <select
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-700 focus:outline-none"
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Location *</label>
              <input
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Bashundhara R/A, Dhaka"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Price (BDT/month) *</label>
              <input
                name="price"
                type="text"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="15,000"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Property Size (sqft)</label>
              <input
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
                placeholder="1200"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Bedrooms</label>
              <input
                name="beds"
                type="number"
                value={formData.beds}
                onChange={handleChange}
                placeholder="2"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Bathrooms</label>
              <input
                name="baths"
                type="number"
                value={formData.baths}
                onChange={handleChange}
                placeholder="2"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Description *</label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property in detail..."
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              ></textarea>
            </div>

            {/* ✅ UPDATED: Multiple image upload */}
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Property Images ({imageFiles.length} selected)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload multiple property images (Max 10MB each, JPG/PNG/WEBP)
              </p>
              
              {/* ✅ UPDATED: Display multiple image previews in grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Image Previews ({imagePreviews.length}):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Property Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg opacity-0 group-hover:opacity-100"
                          title="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-full font-semibold transition flex items-center justify-center ${
                  loading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-700 text-white hover:bg-purple-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="bg-purple-900 text-white py-12 mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="font-bold text-xl mb-2">BashaChai.com</div>
          <div>Find your dream home</div>
        </div>
      </footer>
    </div>
  );
}
