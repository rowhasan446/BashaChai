"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ListProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Flat to Rent",
    purpose: "rent",
    location: "",
    price: "",
    size: "",
    beds: "",
    baths: "",
    description: "",
    image: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        title: formData.title,
        location: formData.location,
        price: formData.price,
        beds: parseInt(formData.beds) || 0,
        baths: parseInt(formData.baths) || 0,
        description: formData.description,
        category: formData.type,
        type: formData.purpose,
        image: formData.image,
        size: formData.size
      };

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      // Check if response is ok before parsing
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }

      const result = await response.json();

      if (result.success) {
        alert("Property listed successfully!");
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
          description: "",
          image: ""
        });
        router.push("/");
      } else {
        alert(result.message || "Failed to list property");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error submitting property: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Matching your homepage */}
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto flex items-center px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-black">
            BashaChai.com
          </Link>
          <div className="ml-auto">
            <Link href="/">
              <button className="px-4 py-2 rounded-md border border-gray-300 hover:shadow-md hover:bg-gray-100 transition">
                Back to Home
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Form Section */}
      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
            List Your <span className="text-purple-700">Property</span>
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Fill in your property details to publish your listing.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Property Title */}
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Property Title</label>
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

            {/* Property Type */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Property Type</label>
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

            {/* Listing Purpose */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Listing Purpose</label>
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

            {/* Location */}
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Location</label>
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

            {/* Price */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Price (BDT/month)</label>
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

            {/* Property Size */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Property Size (sqft)</label>
              <input
                name="size"
                type="number"
                required
                value={formData.size}
                onChange={handleChange}
                placeholder="1200"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            {/* Bedrooms */}
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

            {/* Bathrooms */}
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

            {/* Description */}
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
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

            {/* Image URL */}
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700">Property Image URL</label>
              <input
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/property-image.jpg"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste an image URL from Unsplash or any image hosting service
              </p>
            </div>

            {/* Submit Button */}
            <div className="col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`bg-purple-700 text-white px-10 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-purple-600 transition ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Property'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer - Matching your homepage */}
      <footer className="bg-purple-900 text-white py-12 mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="font-bold text-xl mb-2">BashaChai.com</div>
          <div>Find your dream home</div>
        </div>
      </footer>
    </div>
  );
}