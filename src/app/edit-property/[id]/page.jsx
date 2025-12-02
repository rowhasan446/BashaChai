"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../../../../Provider/AuthProvider";
import Swal from "sweetalert2";

export default function EditProperty() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  
  const propertyId = params?.id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  
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

  // Check authentication
  useEffect(() => {
    const authCheckTimeout = setTimeout(() => {
      if (user === null || user === undefined) {
        setAuthLoading(false);
        router.push("/Login");
      }
    }, 2000);

    if (user === null || user === undefined) {
      setAuthLoading(true);
    } else if (!user || user === false) {
      setAuthLoading(false);
      clearTimeout(authCheckTimeout);
      router.push("/Login");
    } else {
      setAuthLoading(false);
      clearTimeout(authCheckTimeout);
    }

    return () => clearTimeout(authCheckTimeout);
  }, [user, router]);

  // Fetch property data
  useEffect(() => {
    if (!user || !propertyId) {
      return;
    }
    
    fetchPropertyData();
  }, [user, propertyId]);

  const fetchPropertyData = async () => {
    try {
      setFetchLoading(true);
      
      if (!propertyId) {
        throw new Error("Property ID is missing");
      }

      const response = await fetch(`/api/properties/${propertyId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch property");
      }

      if (result.success) {
        const property = result.data;
        
        // Check ownership
        if (property.createdByEmail !== user.email) {
          Swal.fire({
            icon: "error",
            title: "Unauthorized",
            text: "You can only edit your own properties",
            confirmButtonColor: '#7c3aed',
          });
          router.push("/your-properties");
          return;
        }

        // Set form data
        setFormData({
          title: property.title || "",
          type: property.category || "Flat to Rent",
          purpose: property.type || "rent",
          location: property.location || "",
          price: property.price || "",
          size: property.size || "",
          beds: property.beds || "",
          baths: property.baths || "",
          description: property.description || ""
        });

        // Set existing images
        const images = property.images || (property.image ? [property.image] : []);
        setExistingImages(images);
      }
    } catch (error) {
      console.error("❌ Error fetching property:", error);
      Swal.fire({
        icon: "error",
        title: "Error Loading Property",
        text: error.message || "Failed to load property",
        confirmButtonColor: '#7c3aed',
      }).then(() => {
        router.push("/your-properties");
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const totalImages = existingImages.length + newImageFiles.length + files.length - imagesToDelete.length;
    if (totalImages > 10) {
      Swal.fire({
        icon: "warning",
        title: "Too Many Images",
        text: `Maximum 10 images allowed.`,
        confirmButtonColor: '#7c3aed',
      });
      e.target.value = null;
      return;
    }

    const validFiles = [];
    const maxSize = 10 * 1024 * 1024;
    
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
          title: `${file.name} is not an image`,
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

    setNewImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = null;
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "You must be logged in to edit a property",
        confirmButtonColor: '#7c3aed',
      });
      router.push("/Login");
      return;
    }

    if (!propertyId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Property ID is missing",
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    if (!formData.title.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Property title is required",
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    if (!formData.location.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Location is required",
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    if (!formData.price) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Price is required",
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Description is required",
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    const remainingImages = existingImages.filter(url => !imagesToDelete.includes(url));
    const totalImages = remainingImages.length + newImageFiles.length;

    if (totalImages === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Images",
        text: "Please keep at least one image for your property",
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    setLoading(true);

    try {
      const authToken = await user.getIdToken(true);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('beds', formData.beds || '0');
      formDataToSend.append('baths', formData.baths || '0');
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.type);
      formDataToSend.append('type', formData.purpose);
      formDataToSend.append('size', formData.size || '');
      formDataToSend.append('existingImages', JSON.stringify(remainingImages));
      formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      
      newImageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Property updated successfully! 🎉",
          confirmButtonColor: '#7c3aed',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          router.push("/your-properties");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to update property");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "An error occurred while updating your property",
        confirmButtonColor: '#7c3aed',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">
            {authLoading ? "Verifying authentication..." : "Loading property data..."}
          </p>
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

  const remainingImages = existingImages.filter(url => !imagesToDelete.includes(url));
  const totalImages = remainingImages.length + newImageFiles.length;

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
            <Link href="/your-properties">
              <button className="px-4 py-2 rounded-md border border-gray-300 hover:shadow-md hover:bg-gray-100 transition">
                Back to Your Properties
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
            Edit Your <span className="text-purple-700">Property</span>
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Update your property details and manage images.
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
                min="0"
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
                min="0"
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
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none resize-none"
              ></textarea>
            </div>

            {existingImages.length > 0 && (
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Existing Images ({remainingImages.length})
                </label>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((imageUrl, index) => {
                    const isMarkedForDeletion = imagesToDelete.includes(imageUrl);
                    
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className={`w-full h-40 object-cover rounded-lg border-2 shadow-md transition ${
                            isMarkedForDeletion 
                              ? 'border-red-500 opacity-40' 
                              : 'border-gray-300'
                          }`}
                        />
                        {isMarkedForDeletion ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 rounded-lg">
                            <span className="text-white font-bold text-sm">WILL BE DELETED</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(imageUrl)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg opacity-0 group-hover:opacity-100"
                            title="Mark for deletion"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          Existing #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Add New Images ({totalImages}/10 total)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImageChange}
                disabled={totalImages >= 10}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                {totalImages >= 10 
                  ? "Maximum 10 images reached. Delete existing images to add new ones."
                  : `Upload up to ${10 - totalImages} more images (Max 10MB each, JPG/PNG/WEBP)`
                }
              </p>
              
              {newImagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    New Images to Upload ({newImagePreviews.length}):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border-2 border-green-400 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg opacity-0 group-hover:opacity-100"
                          title="Remove new image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-green-600 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          NEW #{index + 1}
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
                className={`w-full py-4 rounded-lg font-semibold text-lg transition shadow-lg ${
                  loading
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-purple-700 text-white hover:bg-purple-600 hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Updating Property...
                  </div>
                ) : (
                  '✓ Update Property'
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
