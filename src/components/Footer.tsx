import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 border-t border-primary-foreground/10">
      <div className="container mx-auto px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">
              Estate Directory
            </h3>
            <p className="text-primary-foreground/80 text-sm">
              A private network for trusted estate professionals and discreet households.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Network</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/collective"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Collective
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/post-job"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Placements
                </Link>
              </li>
              <li>
                <Link
                  to="/messaging"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Private Correspondence
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-profiles"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Saved Profiles
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/add-listing"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Membership
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Standards</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/80">Curated Membership</li>
              <li className="text-primary-foreground/80">Vetted Professionals</li>
              <li className="text-primary-foreground/80">Confidential Placements</li>
              <li className="text-primary-foreground/80">Discreet Network</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start text-primary-foreground/80">
                <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                info@estatedirectory.com
              </li>
              <li className="flex items-start text-primary-foreground/80">
                <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                (555) 123-4567
              </li>
              <li className="flex items-start text-primary-foreground/80">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                123 Estate Lane, Beverly Hills, CA 90210
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>&copy; 2024 Estate Directory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
