'use client'

import Link from "next/link"




export default function Footer() {
  return (
      <footer className="bg-purple-900 text-white py-12">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <div className="font-bold text-xl mb-2">BashaChai.com</div>
          <div>Find your dream home</div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-24 mb-8">
          <div>
            <h4 className="font-semibold mb-3">Information</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/post-ad" className="hover:underline">How to Post Ad</Link></li>
              <li><Link href="/boost-ad" className="hover:underline">How to Boost Ad</Link></li>
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal and Policy</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Use</Link></li>
              <li><Link href="/cookies" className="hover:underline">Cookie Policy</Link></li>
              <li><Link href="/listing-policy" className="hover:underline">Listing Policy</Link></li>
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

  )
}