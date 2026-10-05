import { useEffect, useState } from 'react';
import { Search, Grid3x3, List, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { languages, workAvailability, cookingExperience } from '../data/profileOptions';
import ServiceCategoryPicker from './ServiceCategoryPicker';
import LocationAutocomplete from './LocationAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { FilterState } from '../types';

const SEARCH_PLACEHOLDER_EXAMPLES = [
  'What do you need help with?',
  'Find a math tutor for my 10-year-old',
  'Someone to pick my kids up from school',
  'Move a couch upstairs',
  'I need a birthday party planner',
  'Find a personal trainer',
  'Dog walker this weekend',
  'Someone to clean my house',
];

interface FilterToolbarProps {
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  category: 'all',
  location: '',
  availableNow: false,
  verifiedOnly: false,
  profileStatus: 'all',
  titles: [],
};

export default function FilterToolbar({
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: FilterToolbarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Rotate natural-language search placeholder examples
  useEffect(() => {
    const id = setInterval(
      () => setPlaceholderIndex((i) => (i + 1) % SEARCH_PLACEHOLDER_EXAMPLES.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  const handleFilterUpdate = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value === 'all' ? '' : value };
    if (key === 'category') newFilters.titles = [];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onResetFilters();
  };

  // Agency profiles are browsed as-is — service categories don't apply.
  const showServicePicker = filters.category !== 'agency';

  const filterContent = (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={SEARCH_PLACEHOLDER_EXAMPLES[placeholderIndex]}
          value={filters.searchQuery}
          onChange={(e) => handleFilterUpdate('searchQuery', e.target.value)}
          className="pl-10 bg-background text-foreground border-border"
        />
        <p className="text-xs text-muted-foreground mt-1.5 pl-1">
          Try "tutor", "babysitter", "personal driver", "move furniture", "party planner"...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-foreground">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterUpdate('category', value)}
          >
            <SelectTrigger id="category" className="bg-background text-foreground border-border">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              <SelectItem value="all" className="text-foreground cursor-pointer">All Categories</SelectItem>
              <SelectItem value="staff" className="text-foreground cursor-pointer">Professionals</SelectItem>
              <SelectItem value="business" className="text-foreground cursor-pointer">Service Providers</SelectItem>
              <SelectItem value="agency" className="text-foreground cursor-pointer">Agencies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileStatus" className="text-foreground">Profile Status</Label>
          <Select
            value={filters.profileStatus}
            onValueChange={(value) => handleFilterUpdate('profileStatus', value)}
          >
            <SelectTrigger id="profileStatus" className="bg-background text-foreground border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              <SelectItem value="all" className="text-foreground cursor-pointer">All Statuses</SelectItem>
              <SelectItem value="available-for-hire" className="text-foreground cursor-pointer">Available for Hire</SelectItem>
              <SelectItem value="actively-hiring" className="text-foreground cursor-pointer">Actively Hiring</SelectItem>
              <SelectItem value="community-only" className="text-foreground cursor-pointer">Just here for the Community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-foreground">Location</Label>
          <LocationAutocomplete
            placeholder="City, state, or ZIP..."
            onLocationSelect={(loc) =>
              handleFilterUpdate('location', [loc.city, loc.state].filter(Boolean).join(', ') || loc.formattedAddress)
            }
            onTextChange={(text) => handleFilterUpdate('location', text)}
          />
        </div>
      </div>

      {showServicePicker && (
        <div className="space-y-2">
          <Label className="text-foreground">Services</Label>
          <ServiceCategoryPicker
            selected={filters.titles || []}
            onChange={(values) => handleFilterUpdate('titles', values)}
            placeholder="All services — select one or more"
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="availableNow"
            checked={filters.availableNow}
            onCheckedChange={(checked) =>
              handleFilterUpdate('availableNow', checked)
            }
          />
          <Label
            htmlFor="availableNow"
            className="text-foreground cursor-pointer"
          >
            Available Now
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="verifiedOnly"
            checked={filters.verifiedOnly}
            onCheckedChange={(checked) =>
              handleFilterUpdate('verifiedOnly', checked)
            }
          />
          <Label
            htmlFor="verifiedOnly"
            className="text-foreground cursor-pointer"
          >
            Verified Only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasCar"
            checked={filters.hasCar || false}
            onCheckedChange={(checked) =>
              handleFilterUpdate('hasCar', checked)
            }
          />
          <Label
            htmlFor="hasCar"
            className="text-foreground cursor-pointer"
          >
            Has Car
          </Label>
        </div>
      </div>

      {/* Advanced Filters */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced" className="border-border">
          <AccordionTrigger className="text-foreground hover:no-underline py-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Advanced Filters</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-foreground">Language</Label>
                <Select
                  value={filters.language || 'all'}
                  onValueChange={(value) => handleFilterUpdate('language', value)}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Any Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground max-h-[200px]">
                    <SelectItem value="all" className="text-foreground cursor-pointer">Any Language</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang.toLowerCase()} className="text-foreground cursor-pointer">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workAvailability" className="text-foreground">Work Availability</Label>
                <Select
                  value={filters.workAvailability || 'all'}
                  onValueChange={(value) => handleFilterUpdate('workAvailability', value)}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Any Availability" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="all" className="text-foreground cursor-pointer">Any Availability</SelectItem>
                    {workAvailability.map((avail) => (
                      <SelectItem key={avail} value={avail.toLowerCase()} className="text-foreground cursor-pointer">
                        {avail}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience" className="text-foreground">Years Experience</Label>
                <Select
                  value={filters.yearsExperience || 'all'}
                  onValueChange={(value) => handleFilterUpdate('yearsExperience', value)}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="all" className="text-foreground cursor-pointer">Any Experience</SelectItem>
                    <SelectItem value="0-2" className="text-foreground cursor-pointer">0-2 years</SelectItem>
                    <SelectItem value="3-5" className="text-foreground cursor-pointer">3-5 years</SelectItem>
                    <SelectItem value="6-10" className="text-foreground cursor-pointer">6-10 years</SelectItem>
                    <SelectItem value="10+" className="text-foreground cursor-pointer">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookingLevel" className="text-foreground">Cooking Experience</Label>
                <Select
                  value={filters.cookingLevel || 'all'}
                  onValueChange={(value) => handleFilterUpdate('cookingLevel', value)}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Any Level" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="all" className="text-foreground cursor-pointer">Any Level</SelectItem>
                    {cookingExperience.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()} className="text-foreground cursor-pointer">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalityType" className="text-foreground">Personality Type</Label>
                <Select
                  value={filters.personalityType || 'all'}
                  onValueChange={(value) => handleFilterUpdate('personalityType', value)}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="all" className="text-foreground cursor-pointer">Any Type</SelectItem>
                    <SelectItem value="introvert" className="text-foreground cursor-pointer">Introvert</SelectItem>
                    <SelectItem value="extrovert" className="text-foreground cursor-pointer">Extrovert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="ghost"
        onClick={handleReset}
        className="text-gray-600 hover:text-[#A89F91] hover:bg-[#A89F91]/10"
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="filter-toolbar mb-12">
      <div className="hidden md:block">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              What can we help you with?
            </h2>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value) onViewModeChange(value as 'grid' | 'list');
              }}
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="data-[state=on]:bg-[#A89F91] data-[state=on]:text-white border-[#A89F91]/30 hover:bg-[#A89F91]/10"
              >
                <Grid3x3 className="w-5 h-5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="data-[state=on]:bg-[#A89F91] data-[state=on]:text-white border-[#A89F91]/30 hover:bg-[#A89F91]/10"
              >
                <List className="w-5 h-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {filterContent}
        </div>
      </div>

      <div className="md:hidden">
        <Accordion
          type="single"
          collapsible
          value={mobileFiltersOpen ? 'filters' : ''}
          onValueChange={(value) => setMobileFiltersOpen(value === 'filters')}
        >
          <AccordionItem value="filters" className="border border-border rounded-lg bg-card">
            <AccordionTrigger className="px-6 py-4 hover:no-underline text-foreground">
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-heading font-semibold">
                  Filters
                </span>
                <ChevronDown className="w-5 h-5 transition-transform" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {filterContent}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
