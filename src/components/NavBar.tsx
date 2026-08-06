import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, Settings, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileFullName, setProfileFullName] = useState<string | null>(null);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdminUser(false);
        setProfileAvatarUrl(null);
        setProfileFullName(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, avatar_url, full_name')
        .eq('id', user.id)
        .maybeSingle();

      setIsAdminUser(profile?.role === 'admin');
      setProfileAvatarUrl(profile?.avatar_url ?? null);
      setProfileFullName(profile?.full_name ?? null);
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    return () => {
      if (resourcesCloseTimer.current) {
        clearTimeout(resourcesCloseTimer.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed Out', {
      description: 'You have been successfully signed out',
    });
    navigate('/login');
  };

  const getInitials = (email: string, name?: string | null) => {
    if (name?.trim()) {
      return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }

    return email.substring(0, 2).toUpperCase();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const openResourcesMenu = () => {
    if (resourcesCloseTimer.current) {
      clearTimeout(resourcesCloseTimer.current);
    }
    setResourcesOpen(true);
  };

  const closeResourcesMenu = () => {
    if (resourcesCloseTimer.current) {
      clearTimeout(resourcesCloseTimer.current);
    }

    resourcesCloseTimer.current = setTimeout(() => {
      setResourcesOpen(false);
    }, 140);
  };

  const dashboardPath = isAdminUser ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4 md:h-24 md:px-12">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img 
            src="/images/logo.png" 
            alt="Summerland Estates" 
            className="h-10 w-auto md:h-16"
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
                    to="/search"
                    className={`text-base font-normal transition-all duration-300 cursor-pointer hover:text-[#A89F91] relative pb-1 ${
                      currentPage === 'search'
                        ? 'text-[#A89F91] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#A89F91] after:rounded-full'
                        : 'text-gray-700'
                    }`}
                  >
                    Search Professionals
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
                  <ul className="grid w-[400px] gap-2 p-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
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
                    ['collective', 'news'].includes(currentPage)
                      ? 'text-primary font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  Collective
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/collective"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
                        >
                          <div className="text-sm font-medium leading-none">Join Your Community</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Connect with your local estate community
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
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/recognition"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
                        >
                          <div className="text-sm font-medium leading-none">Estate Services Recognition</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Celebrating excellence in the industry
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/events"
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91] focus:bg-[#A89F91]/10 focus:text-[#A89F91]"
                        >
                          <div className="text-sm font-medium leading-none">Events</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Industry events and networking opportunities
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <div
                  className="relative"
                  onMouseEnter={openResourcesMenu}
                  onMouseLeave={closeResourcesMenu}
                >
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-base font-normal transition-colors cursor-pointer hover:text-primary ${
                      ['contact', 'about', 'faqs', 'privacy', 'terms', 'pricing', 'advertisements'].includes(currentPage)
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    }`}
                  >
                    Resources
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    onMouseEnter={openResourcesMenu}
                    onMouseLeave={closeResourcesMenu}
                    className={`absolute right-0 top-full z-50 mt-2 w-[380px] rounded-xl border border-gray-100 bg-background/95 backdrop-blur-sm p-4 shadow-lg transition-all duration-200 ${
                      resourcesOpen
                        ? 'pointer-events-auto visible translate-y-0 opacity-100'
                        : 'pointer-events-none invisible translate-y-2 opacity-0'
                    }`}
                  >
                    <div className="grid gap-2">
                      <Link
                        to="/contact"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">Contact</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">Get in touch</p>
                      </Link>
                      <Link
                        to="/about"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">Our Philosophy</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">Why we exist</p>
                      </Link>
                      <Link
                        to="/faqs"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">FAQs</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">Common questions</p>
                      </Link>
                      <Link
                        to="/privacy"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">Privacy & Confidentiality</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">How we protect your data</p>
                      </Link>
                      <Link
                        to="/terms"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">Standards & Conduct</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">Network guidelines</p>
                      </Link>
                      <Link
                        to="/pricing"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">Participation Levels</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">Review participation options</p>
                      </Link>
                      <Link
                        to="/advertisements"
                        className="block rounded-lg p-3 transition-all duration-300 hover:bg-[#A89F91]/10 hover:text-[#A89F91]"
                      >
                        <div className="text-sm font-medium leading-none">Advertisements</div>
                        <p className="mt-1 text-sm leading-snug text-muted-foreground">Promote your services</p>
                      </Link>
                    </div>
                  </div>
                </div>
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
                      <AvatarImage src={profileAvatarUrl || user.user_metadata?.avatar_url} alt={user.email || ''} />
                      <AvatarFallback className="bg-[#A89F91] text-white font-semibold">
                        {getInitials(user.email || 'U', profileFullName || user.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {(profileFullName || user.user_metadata?.full_name) && (
                        <p className="font-medium">{profileFullName || user.user_metadata?.full_name}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem 
                    className="text-foreground cursor-pointer hover:bg-[#A89F91]/10 hover:text-[#A89F91] transition-colors"
                    onClick={() => navigate(dashboardPath)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
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
                    <AvatarImage src={profileAvatarUrl || user.user_metadata?.avatar_url} alt={user.email || ''} />
                    <AvatarFallback className="bg-[#A89F91] text-white text-sm">
                      {getInitials(user.email || 'U', profileFullName || user.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-gray-100">
                  {(profileFullName || user.user_metadata?.full_name) && (
                    <p className="text-sm font-medium text-foreground truncate">
                      {profileFullName || user.user_metadata?.full_name}
                    </p>
                  )}
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate(dashboardPath)} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
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
        <div className="md:hidden bg-card border-t border-border max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <button
              onClick={() => handleNavigation('/')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-[#A89F91] text-white font-semibold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavigation('/search')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'search'
                  ? 'bg-[#A89F91] text-white font-semibold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Search Professionals
            </button>

            <button
              onClick={() => handleNavigation('/add-listing')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'add-listing'
                  ? 'bg-[#A89F91] text-white font-semibold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Apply / Membership
            </button>

            <div className="border-t border-border pt-2 mt-2">
              <div className="px-4 py-2 text-sm font-semibold text-[#A89F91] !bg-transparent">
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
              <div className="px-4 py-2 text-sm font-semibold text-[#A89F91]">
                Collective
              </div>
              <button
                onClick={() => handleNavigation('/collective')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Join Your Community
              </button>
              <button
                onClick={() => handleNavigation('/news')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                News
              </button>
            </div>

            <div className="border-t border-border pt-2 mt-2">
              <div className="px-4 py-2 text-sm font-semibold text-[#A89F91]">
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
              <button
                onClick={() => handleNavigation('/advertisements')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Advertisements
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
                Participation Levels
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
