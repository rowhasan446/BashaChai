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

const bangladeshLocations = [
  // Dhaka Division
  "Dhaka - Dhanmondi",
  "Dhaka - Gulshan",
  "Dhaka - Banani",
  "Dhaka - Uttara",
  "Dhaka - Mirpur",
  "Dhaka - Mohammadpur",
  "Dhaka - Bashundhara",
  "Dhaka - Badda",
  "Dhaka - Rampura",
  "Dhaka - Khilgaon",
  "Dhaka - Malibagh",
  "Dhaka - Motijheel",
  "Dhaka - New Market",
  "Dhaka - Old Dhaka",
  "Dhaka - Tejgaon",
  "Dhaka - Farmgate",
  "Dhaka - Shyamoli",
  "Dhaka - Adabor",
  "Dhaka - Mohakhali",
  "Dhaka - Baridhara",
  "Dhaka - Nikunja",
  "Dhaka - Khilkhet",
  "Dhaka - Pallabi",
  "Dhaka - Kazipara",
  "Dhaka - Shewrapara",
  "Dhaka - Agargaon",
  "Dhaka - Sher-e-Bangla Nagar",
  "Gazipur",
  "Narayanganj",
  "Savar",
  "Tongi",
  "Manikganj",
  "Munshiganj",
  "Narsingdi",
  "Tangail",
  "Faridpur",
  "Gopalganj",
  "Madaripur",
  "Rajbari",
  "Shariatpur",
  "Kishoreganj",
  "Netrokona",
  
  // Chittagong Division
  "Chittagong - Agrabad",
  "Chittagong - Nasirabad",
  "Chittagong - Khulshi",
  "Chittagong - Panchlaish",
  "Chittagong - GEC Circle",
  "Chittagong - Halishahar",
  "Chittagong - Bayazid",
  "Chittagong - Chandgaon",
  "Cox's Bazar",
  "Comilla",
  "Feni",
  "Brahmanbaria",
  "Rangamati",
  "Noakhali",
  "Chandpur",
  "Lakshmipur",
  "Khagrachhari",
  "Bandarban",
  
  // Rajshahi Division
  "Rajshahi",
  "Bogra",
  "Pabna",
  "Sirajganj",
  "Natore",
  "Naogaon",
  "Chapainawabganj",
  "Joypurhat",
  
  // Khulna Division
  "Khulna",
  "Jessore",
  "Satkhira",
  "Bagerhat",
  "Chuadanga",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Jhenaidah",
  
  // Sylhet Division
  "Sylhet",
  "Moulvibazar",
  "Habiganj",
  "Sunamganj",
  
  // Barisal Division
  "Barisal",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",
  "Barguna",
  
  // Rangpur Division
  "Rangpur",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",
  
  // Mymensingh Division
  "Mymensingh",
  "Jamalpur",
  "Sherpur",
];

export default function InquiryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    type: "",
    location: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Inquiry | BashaChai";
  }, []);

  const inquiryTypes = [
    "I want to sell a property",
    "I want to rent out my property",
    "I'm looking to rent a property",
    "I'm looking to buy a property",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobile.replace(/\s/g, ""))) {
      newErrors.mobile = "Please enter a valid Bangladeshi mobile number";
    }

    if (!formData.type) {
      newErrors.type = "Please select an inquiry type";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Form submitted:", formData);
      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          fullName: "",
          mobile: "",
          email: "",
          type: "",
          location: "",
          message: "",
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                    link.name === "Inquiry" ? "bg-purple-100 font-semibold" : ""
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-8 flex space-x-2">
            <Link href="/Login">
              <button className="text-[15px] tracking-widest bg-purple-400 px-6 py-2 text-black hover:bg-purple-500 transition-colors duration-200 cursor-pointer">
                Login
              </button>
            </Link>
            <Link href="/list-property">
              <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition cursor-pointer">
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
            <Link href="/" className="hover:text-purple-700 cursor-pointer">
              Home
            </Link>
            <span>›</span>
            <span className="text-black font-semibold">Inquiry</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-3">
              Can't find what you're looking for?
            </h1>
            <p className="text-gray-600">
              Send a message to agents and developers matching your search for properties to buy, sell, rent, or invest in.
            </p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-semibold">
                  Your inquiry has been submitted successfully! We'll get back to you soon.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                  className={`w-full px-4 py-3 border ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Mobile number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter Mobile number"
                  className={`w-full px-4 py-3 border ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black`}
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black appearance-none cursor-pointer bg-white`}
                  >
                    <option value="">I want to sell a property.</option>
                    {inquiryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Location
              </label>
              <div className="relative">
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black appearance-none cursor-pointer bg-white"
                >
                  <option value="">Select Location...</option>
                  {bangladeshLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="Example: I am searching for a property to buy in Adabor. Please let me know if you have any suitable listings."
                className={`w-full px-4 py-3 border ${
                  errors.message ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black resize-none`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Privacy Policy Notice */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                By submitting this form, your inquiry will be shared with the selected agents and developers, who will contact you directly. For more details, please review our{" "}
                <Link href="/privacy-policy" className="text-purple-700 hover:underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition cursor-pointer ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-700 hover:bg-purple-600"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xl">BashaChai.com</div>
                  <div className="text-sm text-gray-300">Find your dream home</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                BashaChai.com - Your Trusted Property Classifieds Website in Bangladesh. Discover the Best Opportunities to Buy, Sell, or Rent Real Estate, Apartments, and Commercial Properties with Ease and Confidence.
              </p>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-semibold text-lg mb-4">INFORMATION</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition cursor-pointer">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/post-ad" className="text-gray-300 hover:text-white transition cursor-pointer">
                    How to Post Ad
                  </Link>
                </li>
                <li>
                  <Link href="/boost-ad" className="text-gray-300 hover:text-white transition cursor-pointer">
                    How to Boost Ad
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white transition cursor-pointer">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white transition cursor-pointer">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal and Policy */}
            <div>
              <h4 className="font-semibold text-lg mb-4">LEGAL AND POLICY</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition cursor-pointer">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white transition cursor-pointer">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-300 hover:text-white transition cursor-pointer">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/listing-policy" className="text-gray-300 hover:text-white transition cursor-pointer">
                    Listing Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-semibold text-lg mb-4">CONTACT US</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+8801775549500" className="text-gray-300 hover:text-white transition">
                    +880 17 7554 9500
                  </a>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@bashachai.com" className="text-gray-300 hover:text-white transition">
                    support@bashachai.com
                  </a>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300">
                    Flat # 1A, House # 1106/A, Road #1/A (Behind Adabor Thana), Adabor, Dhaka 1207., Dhaka, Bangladesh
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-t border-purple-800 pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div className="leading-relaxed">
                <p className="text-justify">
                  BashaChai.com – The #1 Property Classifieds Website in Bangladesh for Residential and Commercial Real Estate. Find Your Dream Property in Dhaka or Any Other City Across Bangladesh. Whether You're Looking to Buy, Rent, or Sell, We Have a Wide Range of Properties, Including Flats, Apartments, Duplexes, and Homes of All Sizes, from 1-Bedroom to 6-Bedroom Options. Explore Commercial Buildings, Office Spaces, and Retail Properties, as Well as Land for Sale or Rent for Your Next Investment. Discover Land Share Opportunities, Co-Living Spaces, and Community Housing Projects. Whether You Want to Buy, Rent, or Sell Residential Properties, Land, or Commercial Spaces, BashaChai.com Offers the Best Solutions for All Your Real Estate Needs. From Affordable Flats to Luxury Apartments and Commercial Buildings, We Have Listings for Every Type of Buyer, Seller, or Renter. Start Your Property Search Today With Confidence, Knowing You're on the Best Platform for Real Estate in Bangladesh.
                </p>
              </div>
              <div className="leading-relaxed">
                <p className="text-justify">
                  At BashaChai.com, find the perfect property across all prime locations in Dhaka. Whether you're looking to buy, sell, or rent in areas like Dhanmondi, Banani, Baridhara, Bashundhara, Dhanmondi, Uttara, or Mirpur, we have listings for every need. Explore apartments and homes in Mohakhali, Tejgaon, Badda, or find commercial spaces in Motijheel, Karwan Bazar, and Paltan. For those seeking serene residential neighborhoods, check out listings in Shantinagar, Malibagh, Lalmatta, or Nikeran. We also have properties in up-and-coming areas like Jatrabari, Wari, and Agargaon. Whether it's for buying, renting, or selling property in Dhaka's bustling city center or quiet suburban areas, BashaChai.com has you covered with the best property deals in town.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-purple-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              Copyright © 2025 All rights reserved
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded flex items-center justify-center transition cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded flex items-center justify-center transition cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded flex items-center justify-center transition cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded flex items-center justify-center transition cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded flex items-center justify-center transition cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded flex items-center justify-center transition cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}