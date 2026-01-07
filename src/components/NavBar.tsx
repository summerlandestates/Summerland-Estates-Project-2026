import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavBarProps {
  currentPage: string;
}

export default function NavBar({ currentPage }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50">
      <nav className="container mx-auto px-12 h-24 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-heading font-medium text-primary tracking-tight"
        >
          Estate Directory
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className={`text-base font-normal transition-colors cursor-pointer hover:text-primary ${
                      currentPage === 'home'
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    }`}
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/add-listing"
                    className={`text-base font-normal transition-colors cursor-pointer hover:text-primary ${
                      currentPage === 'add-listing'
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    }`}
                  >
                    Apply
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-base font-normal transition-colors cursor-pointer hover:text-primary ${
                    currentPage === 'jobs'
                      ? 'text-primary font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  Placements
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 bg-popover">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/post-job"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Post a Placement</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Full-time, part-time, or contract appointments
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/service-requests"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Service Requests</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Short-term service opportunities
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-base font-normal transition-colors cursor-pointer hover:text-primary ${
                    ['collective', 'tools', 'messaging', 'news'].includes(currentPage)
                      ? 'text-primary font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  Collective
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 bg-popover">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/collective"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Join Community</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Connect with your local estate community
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/tools"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Estate Management Tools</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Professional templates and resources
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/messaging"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Private Correspondence</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Discreet communication within the network
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/news"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">News</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Estate management insights
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-base font-normal transition-colors cursor-pointer hover:text-primary ${
                    ['contact', 'about', 'faqs', 'privacy', 'terms', 'pricing'].includes(currentPage)
                      ? 'text-primary font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 bg-popover">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/contact"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Contact</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Get in touch
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/about"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Our Philosophy</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Why we exist
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/faqs"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">FAQs</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Common questions
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/privacy"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Privacy & Confidentiality</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            How we protect your data
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/terms"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Standards & Conduct</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Network guidelines
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/pricing"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Participation Levels</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Review participation options
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-muted"
              >
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
              <DropdownMenuItem 
                className="text-foreground cursor-pointer hover:bg-muted"
                onClick={() => navigate('/account')}
              >
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-muted">
                Login
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-muted">
                Apply for Membership
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-foreground cursor-pointer hover:bg-muted"
                onClick={() => navigate('/saved-profiles')}
              >
                Saved Profiles
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-foreground cursor-pointer hover:bg-muted"
                onClick={() => navigate('/notification-settings')}
              >
                Notification Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-8 py-4 space-y-2">
            <button
              onClick={() => handleNavigation('/')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavigation('/add-listing')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'add-listing'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Membership
            </button>

            <div className="border-t border-border pt-2 mt-2">
              <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                Placements
              </div>
              <button
                onClick={() => handleNavigation('/post-job')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Post a Placement
              </button>
              <button
                onClick={() => handleNavigation('/service-requests')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Service Requests
              </button>
            </div>

            <div className="border-t border-border pt-2 mt-2">
              <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                Collective
              </div>
              <button
                onClick={() => handleNavigation('/collective')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Join Community
              </button>
              <button
                onClick={() => handleNavigation('/tools')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Estate Management Tools
              </button>
              <button
                onClick={() => handleNavigation('/messaging')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Private Correspondence
              </button>
              <button
                onClick={() => handleNavigation('/news')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                News
              </button>
            </div>

            <div className="border-t border-border pt-2 mt-2">
              <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                Resources
              </div>
              <button
                onClick={() => handleNavigation('/contact')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => handleNavigation('/about')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Our Philosophy
              </button>
              <button
                onClick={() => handleNavigation('/faqs')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                FAQs
              </button>
              <button
                onClick={() => handleNavigation('/privacy')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Privacy & Confidentiality
              </button>
              <button
                onClick={() => handleNavigation('/terms')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Standards & Conduct
              </button>
              <button
                onClick={() => handleNavigation('/pricing')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Participation Levels
              </button>
            </div>

            <div className="border-t border-border pt-2 mt-2">
              <button
                onClick={() => handleNavigation('/account')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Account Settings
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors">
                Login
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Apply for Membership
              </button>
              <button
                onClick={() => handleNavigation('/saved-profiles')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Saved Profiles
              </button>
              <button
                onClick={() => handleNavigation('/notification-settings')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
