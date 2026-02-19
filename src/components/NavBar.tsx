import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, Settings, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed Out', {
      description: 'You have been successfully signed out',
    });
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <nav className="container mx-auto px-12 h-24 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img 
            src="/logo.png" 
            alt="Summerland Estates" 
            className="h-24 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center flex-1 justify-center">
          <NavigationMenu className="mx-auto">
            <NavigationMenuList className="flex gap-8">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className={`text-base font-normal transition-all duration-300 cursor-pointer hover:text-[#A89F91] relative pb-1 ${
                      currentPage === 'home'
                        ? 'text-[#A89F91] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#A89F91] after:rounded-full'
                        : 'text-gray-700'
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
                    className={`text-base font-normal transition-all duration-300 cursor-pointer hover:text-[#A89F91] relative pb-1 ${
                      currentPage === 'add-listing'
                        ? 'text-[#A89F91] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#A89F91] after:rounded-full'
                        : 'text-gray-700'
                    }`}
                  >
                    Apply
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-base font-normal transition-all duration-300 cursor-pointer hover:text-[#A89F91] relative pb-1 ${
                    currentPage === 'jobs'
                      ? 'text-[#A89F91] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#A89F91] after:rounded-full'
                      : 'text-gray-700'
                  }`}
                >
                  Placements
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/post-job"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
                        >
                          <div className="text-sm font-medium leading-none">Service Requests</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Short-term service opportunities
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/open-roles"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
                        >
                          <div className="text-sm font-medium leading-none">View Open Roles and Requests</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse all available positions and service needs
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
                  <ul className="grid w-[400px] gap-2 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/collective"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                  <ul className="grid w-[400px] gap-2 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/contact"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
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

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                      <AvatarFallback className="bg-[#A89F91] text-white font-semibold">
                        {getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.user_metadata?.full_name && (
                        <p className="font-medium">{user.user_metadata.full_name}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem 
                    className="text-foreground cursor-pointer hover:bg-[#A89F91]/10 hover:text-[#A89F91] transition-colors"
                    onClick={() => navigate('/my-profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-foreground cursor-pointer hover:bg-[#A89F91]/10 hover:text-[#A89F91] transition-colors"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-foreground cursor-pointer hover:bg-[#A89F91]/10 hover:text-[#A89F91] transition-colors"
                    onClick={() => navigate('/saved-profiles')}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved Profiles
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer hover:bg-muted"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-[#A89F91] transition-colors duration-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/add-listing')}
                  className="bg-[#A89F91] text-white hover:bg-[#8A8279] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Profile Icon - shown before menu button for logged-in users */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#A89F91] text-white text-sm">
                      {user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/my-profile')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/saved-profiles')} className="cursor-pointer">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved Profiles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
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
              <button
                onClick={() => handleNavigation('/open-roles')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                View Open Roles & Requests
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
