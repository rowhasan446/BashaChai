"use client";

import { useState } from "react";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "Complete Guide to Buying Property in Dhaka 2025",
    excerpt: "Everything you need to know about purchasing your dream apartment in Dhaka - from budgeting to legal documentation and RAJUK approval process.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    category: "Buying Guide",
    author: "Rahul Ahmed",
    date: "November 28, 2025",
    readTime: "8 min read",
    tags: ["Property", "Dhaka", "Guide"]
  },
  {
    id: 2,
    title: "Top 10 Residential Areas in Dhaka for 2025",
    excerpt: "Explore the best neighborhoods in Dhaka including Gulshan, Banani, Dhanmondi, and emerging areas like Bashundhara and Purbachal.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    category: "Market Trends",
    author: "Nadia Khan",
    date: "November 25, 2025",
    readTime: "6 min read",
    tags: ["Residential", "Dhaka", "Location"]
  },
  {
    id: 3,
    title: "Real Estate Investment Opportunities in Bangladesh",
    excerpt: "Discover lucrative investment opportunities in Dhaka, Chittagong, and Sylhet. Learn about ROI, market trends, and growth projections.",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=800&q=80",
    category: "Investment",
    author: "Imran Hossain",
    date: "November 22, 2025",
    readTime: "10 min read",
    tags: ["Investment", "ROI", "Market"]
  },
  {
    id: 4,
    title: "Understanding RAJUK Approval Process",
    excerpt: "A step-by-step guide to navigating RAJUK approval, building codes, and legal requirements for property development in Dhaka.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    category: "Legal",
    author: "Tasnim Rahman",
    date: "November 20, 2025",
    readTime: "7 min read",
    tags: ["Legal", "RAJUK", "Compliance"]
  },
  {
    id: 5,
    title: "Padma Bridge Impact on Real Estate Market",
    excerpt: "How the Padma Bridge is transforming property values in southern Bangladesh and creating new investment hotspots.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    category: "Infrastructure",
    author: "Fahim Kabir",
    date: "November 18, 2025",
    readTime: "5 min read",
    tags: ["Infrastructure", "Development", "Investment"]
  },
  {
    id: 6,
    title: "Affordable Housing Solutions in Bangladesh",
    excerpt: "Exploring government initiatives, bank loans, and affordable housing projects making homeownership accessible for middle-class families.",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
    category: "Affordable Housing",
    author: "Sadia Akter",
    date: "November 15, 2025",
    readTime: "6 min read",
    tags: ["Affordable", "Housing", "Finance"]
  },
  {
    id: 7,
    title: "Metro Rail Effect on Dhaka Property Prices",
    excerpt: "Analyzing how Dhaka Metro Rail is boosting property values in Uttara, Mirpur, and surrounding areas along the MRT Line.",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80",
    category: "Market Trends",
    author: "Kamal Uddin",
    date: "November 12, 2025",
    readTime: "8 min read",
    tags: ["Metro", "Property Value", "Development"]
  },
  {
    id: 8,
    title: "Green Building Practices in Bangladesh",
    excerpt: "Sustainable architecture and eco-friendly construction trends reshaping Bangladesh's real estate industry for a greener future.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
    category: "Sustainability",
    author: "Dr. Nusrat Jahan",
    date: "November 10, 2025",
    readTime: "9 min read",
    tags: ["Green Building", "Sustainability", "Environment"]
  },
  {
    id: 9,
    title: "Commercial Real Estate Boom in Chittagong",
    excerpt: "The port city is experiencing unprecedented commercial real estate growth with multinational companies and tech startups.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    category: "Commercial",
    author: "Mehedi Hassan",
    date: "November 8, 2025",
    readTime: "7 min read",
    tags: ["Commercial", "Chittagong", "Business"]
  }
];

const categories = ["All", "Buying Guide", "Market Trends", "Investment", "Legal", "Infrastructure", "Affordable Housing", "Sustainability", "Commercial"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Real Estate <span className="text-purple-300">Insights</span>
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Expert guides, market trends, and industry news about Bangladesh's real estate sector
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
              />
              <button className="absolute right-2 top-2 bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-purple-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              <div className="max-w-6xl mx-auto mb-16">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 hover:shadow-3xl transition">
                  <div className="relative h-80 md:h-auto">
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-purple-700 font-semibold text-sm mb-2">{filteredPosts[0].category}</span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-purple-700 transition cursor-pointer">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {filteredPosts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
                          {filteredPosts[0].author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{filteredPosts[0].author}</p>
                          <p className="text-xs text-gray-500">{filteredPosts[0].date}</p>
                        </div>
                      </div>
                      <Link href={`/blog/${filteredPosts[0].id}`}>
                        <button className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition font-semibold">
                          Read More
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {filteredPosts.slice(1).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Stay Updated with Latest <span className="text-purple-300">Insights</span>
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for weekly updates on Bangladesh's real estate market, 
            investment tips, and exclusive property listings.
          </p>
          <div className="max-w-xl mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-300"
            />
            <button className="px-8 py-4 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition shadow-lg">
              Subscribe
            </button>
          </div>
          <p className="text-purple-200 text-sm mt-4">
            Join 10,000+ subscribers. No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      
    </div>
  );
}

function BlogCard({ post }) {
  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition duration-300">
      <Link href={`/blog/${post.id}`}>
        <div className="relative h-48 overflow-hidden cursor-pointer">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-110 transition duration-500"
          />
          <span className="absolute top-3 right-3 bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {post.category}
          </span>
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <Link href={`/blog/${post.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-700 transition cursor-pointer line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-xs">{post.author}</p>
              <p className="text-xs text-gray-500">{post.readTime}</p>
            </div>
          </div>
          <Link href={`/blog/${post.id}`}>
            <button className="text-purple-700 hover:text-purple-900 font-semibold text-sm flex items-center">
              Read
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
