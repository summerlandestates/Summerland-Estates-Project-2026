import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo.png"
                alt="Summerland Estates"
                className="h-24 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A private network for trusted estate professionals and discreet households.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Network</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/collective"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Collective
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/post-job"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Placements
                </Link>
              </li>
              <li>
                <Link
                  to="/messaging"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Private Correspondence
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-profiles"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Saved Profiles
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/add-listing"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Membership
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-[#A89F91] transition-all duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Standards</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Curated Membership</li>
              <li className="text-gray-400">Vetted Professionals</li>
              <li className="text-gray-400">Confidential Placements</li>
              <li className="text-gray-400">Discreet Network</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start text-gray-400">
                <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-[#A89F91]" />
                info@estatedirectory.com
              </li>
              <li className="flex items-start text-gray-400">
                <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-[#A89F91]" />
                (555) 123-4567
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-[#A89F91]" />
                123 Estate Lane, Beverly Hills, CA 90210
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2024 Summerland Estates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
