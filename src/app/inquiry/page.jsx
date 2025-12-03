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

     
    </main>
  );
}