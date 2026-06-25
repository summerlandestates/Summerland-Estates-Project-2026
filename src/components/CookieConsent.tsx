import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { contentManager, CookieConsentConfig } from '@/lib/contentManagement';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [config, setConfig] = useState<CookieConsentConfig>({
    enabled: false,
    title: '',
    message: '',
    acceptButtonText: '',
    declineButtonText: '',
    privacyLinkText: '',
    position: 'bottom',
    theme: 'light'
  });
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Load config from content manager
    const cookieConfig = contentManager.getCookieConfig();
    setConfig(cookieConfig);

    // Check if user has already given consent
    const hasConsent = localStorage.getItem('cookie-consent');
    if (hasConsent) {
      setConsentGiven(true);
    } else if (cookieConfig.enabled) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsentGiven(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setConsentGiven(true);
    setShowBanner(false);
  };

  if (!config.enabled || consentGiven || !showBanner) {
    return null;
  }

  const getPositionClasses = () => {
    switch (config.position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'bottom-left':
        return 'bottom-4 left-4 max-w-md';
      case 'bottom-right':
        return 'bottom-4 right-4 max-w-md';
      case 'bottom':
      default:
        return 'bottom-0 left-0 right-0';
    }
  };

  const getThemeClasses = () => {
    return config.theme === 'dark'
      ? 'bg-gray-900 text-white border-gray-700'
      : 'bg-white text-gray-900 border-gray-200';
  };

  const isFloating = config.position === 'bottom-left' || config.position === 'bottom-right';

  return (
    <div
      className={`fixed ${getPositionClasses()} z-50 ${isFloating ? '' : 'w-full'} animate-in slide-in-from-bottom duration-300`}
    >
      <div
        className={`${isFloating ? 'rounded-lg shadow-xl' : ''} border p-4 md:p-6 ${getThemeClasses()}`}
      >
        <div className={`${isFloating ? '' : 'container mx-auto max-w-6xl'} flex flex-col md:flex-row items-start md:items-center gap-4`}>
          <div className="flex-1">
            {config.title && (
              <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
            )}
            <p className={`text-sm ${config.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {config.message}{' '}
              <Link 
                to="/privacy" 
                className="underline hover:text-[#A89F91] transition-colors"
              >
                {config.privacyLinkText}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {config.declineButtonText && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className={config.theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : ''}
              >
                {config.declineButtonText}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-[#A89F91] hover:bg-[#948979] text-white"
            >
              {config.acceptButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
