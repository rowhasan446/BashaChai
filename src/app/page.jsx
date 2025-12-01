"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [slideIndex, setSlideIndex] = useState(0);

  function prevSlide() {
    setSlideIndex((slideIndex - 1 + sliderImages.length) % sliderImages.length);
  }

  function nextSlide() {
    setSlideIndex((slideIndex + 1) % sliderImages.length);
  }

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
          <div className="ml-8 flex space-x-4">
            <Link href="/Login">
              <button className="px-4 py-2 rounded-md border border-gray-300 hover:shadow-md hover:bg-gray-100 transition">
                Login
              </button>
            </Link>
            <Link href="/list-property">
              <button className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                List Your Property
              </button>
            </Link>
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
        {/* Arrows */}
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
        {/* Dots */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ListingCard
              title="3 Bedroom Flat for rent in Khilgaon"
              location="Khilgaon, Dhaka"
              price="27,000/package"
              beds={3}
              baths={2}
              img={featuredImages[0]}
            />
            <ListingCard
              title="3 Bedroom Flat for rent in Farmgate"
              location="Farmgate, Dhaka"
              price="Call for Price"
              beds={2}
              baths={2}
              img={featuredImages[1]}
            />
            <ListingCard
              title="Office Space for rent in Motijheel"
              location="Motijheel, Dhaka"
              price="50,000/package"
              beds={0}
              baths={1}
              img={featuredImages[3]}
            />
            <ListingCard
              title="Girls Hostel Room to rent in Dhanmondi"
              location="Dhanmondi, Dhaka"
              price="Call for Price"
              beds={1}
              baths={1}
              img={featuredImages[4]}
            />
          </div>
          <div className="mt-10">
            <Link href="/listings">
              <button className="px-6 py-3 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition">
                See all
              </button>
            </Link>
          </div>
        </div>
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
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/post-ad" className="hover:underline">
                  How to Post Ad
                </Link>
              </li>
              <li>
                <Link href="/boost-ad" className="hover:underline">
                  How to Boost Ad
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal and Policy</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:underline">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/listing-policy" className="hover:underline">
                  Listing Policy
                </Link>
              </li>
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

function ListingCard({ title, location, price, beds, baths, img }) {
  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition duration-300 cursor-pointer p-4 flex flex-col">
      <img src={img} alt={title} className="w-full h-32 object-cover rounded-xl mb-3" />
      <div className="text-black font-semibold text-lg">{title}</div>
      <div className="text-black text-sm mt-1">{location}</div>
      <div className="text-black text-sm mt-1">
        {beds > 0 && `${beds} Beds`} {beds > 0 && baths > 0 && " • "} {baths > 0 && `${baths} Baths`}
      </div>
      <div className="text-black font-bold mt-2">{price}</div>
      <Link href="/listing-details" className="mt-auto">
        <button className="mt-4 px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-600 shadow hover:shadow-lg transition w-full">
          View Details
        </button>
      </Link>
    </div>
  );
}
