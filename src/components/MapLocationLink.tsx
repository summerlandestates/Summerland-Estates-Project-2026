import { MapPin } from 'lucide-react';

interface MapLocationLinkProps {
  location: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Renders a location as a Google Maps link. Locations that aren't mappable
 * (e.g. "Remote", "Online") render as plain text.
 */
export default function MapLocationLink({
  location,
  className = '',
  iconClassName = 'w-3 h-3 mr-1 flex-shrink-0',
}: MapLocationLinkProps) {
  const trimmed = (location || '').trim();
  const unmappable = /^(remote|online|virtual|n\/a|tbd)$/i.test(trimmed);

  if (!trimmed || unmappable) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <MapPin className={iconClassName} />
        {trimmed || 'Location TBD'}
      </span>
    );
  }

  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center hover:text-[#A89F91] hover:underline ${className}`}
      title={`View ${trimmed} on Google Maps`}
    >
      <MapPin className={iconClassName} />
      {trimmed}
    </a>
  );
}
