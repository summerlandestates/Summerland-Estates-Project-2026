import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Shield, Users, Award, Lock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      const res = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        toast.success('You\'re subscribed!', { description: 'Thank you for joining our newsletter.' });
        setNewsletterEmail('');
      } else {
        toast.error('Subscription failed', { description: 'Please try again.' });
      }
    } catch {
      toast.error('Subscription failed', { description: 'Please try again.' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Professionals', href: '/providers' },
    { name: 'Post a Job', href: '/post-job' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQs', href: '/faqs' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ];

  const standards = [
    { icon: Shield, text: 'Curated Membership' },
    { icon: Users, text: 'Vetted Professionals' },
    { icon: Award, text: 'Confidential Placements' },
    { icon: Lock, text: 'Discreet Network' },
  ];

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 bg-[#A89F91] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-serif font-bold text-xl">SE</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#A89F91] transition-colors duration-300">
                  Summerland Estates
                </h3>
                <p className="text-xs text-gray-500">Private Staffing Network</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              A private network connecting trusted estate professionals with discerning households. Excellence in domestic staffing since 2018.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#A89F91] hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#A89F91] hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#A89F91] hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#A89F91] rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-[#A89F91] hover:pl-2 transition-all duration-300 text-sm flex items-center gap-1 group"
                  >
                    <span className="w-0 h-px bg-[#A89F91] group-hover:w-3 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards */}
          <div>
            <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#A89F91] rounded-full"></span>
              Our Standards
            </h4>
            <ul className="space-y-3">
              {standards.map((standard, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-3 text-gray-400 text-sm group hover:text-white transition-colors duration-300 cursor-default"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-[#A89F91]/20 transition-all duration-300">
                    <standard.icon className="w-4 h-4 text-[#A89F91]" />
                  </div>
                  <span className="group-hover:text-[#A89F91] transition-colors duration-300">{standard.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#A89F91] rounded-full"></span>
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:summerlandestates@summerlandestates.com"
                  className="flex items-start gap-3 text-gray-400 hover:text-[#A89F91] transition-colors duration-300 group"
                >
                  <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#A89F91]/20 transition-all duration-300">
                    <Mail className="w-4 h-4 text-[#A89F91]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm break-all">summerlandestates@summerlandestates.com</p>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#A89F91]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Office</p>
                  <p className="text-sm">123 Estate Lane<br />Beverly Hills, CA 90210</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-semibold text-lg mb-1">Stay in the Know</h4>
              <p className="text-gray-400 text-sm">Get the latest news, placements, and member updates delivered to your inbox.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#A89F91] text-sm"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Summerland Estates. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <span key={link.name} className="flex items-center gap-6">
                  <Link 
                    to={link.href}
                    className="text-gray-500 hover:text-[#A89F91] text-sm transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-700">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
