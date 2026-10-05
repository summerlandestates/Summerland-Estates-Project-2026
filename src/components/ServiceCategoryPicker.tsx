import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { serviceTypeCategories } from '../data/serviceTypes';
import { fetchCustomOptions, saveCustomOption } from '../lib/customOptions';
import { getCategoryEmoji, getServiceEmoji } from '../lib/searchIntent';

interface ServiceCategoryPickerProps {
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Show an "add a new category" input that persists custom values */
  allowCustom?: boolean;
}

/**
 * Multi-select picker over the 167-service catalog, grouped by category with
 * emoji headers. Supports filtering, custom categories, and chip display.
 */
export default function ServiceCategoryPicker({
  selected,
  onChange,
  placeholder = 'Select services...',
  allowCustom = true,
}: ServiceCategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomOptions('service_type').then(setCustomOptions);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const allGroups = useMemo(() => {
    const groups: Record<string, string[]> = { ...serviceTypeCategories };
    if (customOptions.length > 0) {
      groups['Custom Categories'] = customOptions.filter(
        (c) => !serviceTypes().includes(c)
      );
      if (groups['Custom Categories'].length === 0) delete groups['Custom Categories'];
    }
    return groups;
  }, [customOptions]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allGroups;
    const result: Record<string, string[]> = {};
    for (const [group, services] of Object.entries(allGroups)) {
      const matches = services.filter((s) => s.toLowerCase().includes(q));
      if (matches.length > 0) result[group] = matches;
    }
    return result;
  }, [allGroups, query]);

  const toggle = (service: string) => {
    onChange(
      selected.includes(service)
        ? selected.filter((s) => s !== service)
        : [...selected, service]
    );
  };

  const addCustom = async () => {
    const value = customValue.trim();
    if (!value) return;
    if (!selected.includes(value)) onChange([...selected, value]);
    if (!customOptions.includes(value)) {
      setCustomOptions((prev) => [...prev, value]);
      await saveCustomOption('service_type', value);
    }
    setCustomValue('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground hover:border-[#A89F91] transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={selected.length === 0 ? 'text-muted-foreground' : ''}>
          {selected.length === 0
            ? placeholder
            : `${selected.length} service${selected.length === 1 ? '' : 's'} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="bg-[#A89F91]/10 text-foreground hover:bg-[#A89F91]/20 gap-1 pr-1"
            >
              <span aria-hidden="true">{getServiceEmoji(s)}</span> {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                aria-label={`Remove ${s}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services..."
                className="pl-8 h-8 text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2" role="listbox" aria-multiselectable="true">
            {Object.entries(filteredGroups).map(([group, services]) => (
              <div key={group} className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                  <span aria-hidden="true" className="mr-1.5">{getCategoryEmoji(group)}</span>
                  {group}
                </p>
                {services.map((service) => (
                  <label
                    key={service}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selected.includes(service)}
                      onCheckedChange={() => toggle(service)}
                    />
                    <span aria-hidden="true">{getServiceEmoji(service)}</span>
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            ))}
            {Object.keys(filteredGroups).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No matching services
              </p>
            )}
          </div>

          {allowCustom && (
            <div className="p-2 border-t border-border flex gap-2">
              <Input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Add a new category..."
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-[#A89F91] text-[#A89F91]"
                onClick={addCustom}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function serviceTypes(): string[] {
  return Object.values(serviceTypeCategories).flat();
}
