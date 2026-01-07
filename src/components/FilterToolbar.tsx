import { useState } from 'react';
import { Search, Grid3x3, List, ChevronDown } from 'lucide-react';
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

interface FilterToolbarProps {
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function FilterToolbar({
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: FilterToolbarProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    location: '',
    availableNow: false,
    verifiedOnly: false,
    profileStatus: 'all',
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleFilterUpdate = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      searchQuery: '',
      category: 'all',
      location: '',
      availableNow: false,
      verifiedOnly: false,
      profileStatus: 'all',
    };
    setFilters(resetFilters);
    onResetFilters();
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, role, or keywords..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterUpdate('searchQuery', e.target.value)}
          className="pl-10 bg-background text-foreground border-border"
        />
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
              <SelectItem value="staff" className="text-foreground cursor-pointer">Staff</SelectItem>
              <SelectItem value="vendor" className="text-foreground cursor-pointer">Vendors</SelectItem>
              <SelectItem value="business" className="text-foreground cursor-pointer">Businesses</SelectItem>
              <SelectItem value="agency" className="text-foreground cursor-pointer">Agencies</SelectItem>
              <SelectItem value="estates" className="text-foreground cursor-pointer">Estates</SelectItem>
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
          <Input
            id="location"
            placeholder="Enter city or state..."
            value={filters.location}
            onChange={(e) => handleFilterUpdate('location', e.target.value)}
            className="bg-background text-foreground border-border"
          />
        </div>
      </div>

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
      </div>

      <Button
        variant="ghost"
        onClick={handleReset}
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
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
              Filter & Search
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
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <Grid3x3 className="w-5 h-5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <List className="w-5 h-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <FilterContent />
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
              <FilterContent />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
