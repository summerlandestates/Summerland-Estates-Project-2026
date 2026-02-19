import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  DollarSign, 
  Users, 
  BookOpen, 
  ClipboardList, 
  AlertTriangle, 
  Phone, 
  Droplet, 
  Flame, 
  Home, 
  Shield, 
  TrendingUp,
  Download,
  Search
} from 'lucide-react';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  downloadUrl?: string;
}

const tools: Tool[] = [
  {
    id: 'budgeting',
    title: 'Estate Budget Template',
    description: 'Comprehensive budgeting spreadsheet for tracking household expenses, staff salaries, maintenance costs, and annual projections.',
    icon: DollarSign,
    category: 'Financial',
    downloadUrl: '/templates/estate-budget-template.xlsx'
  },
  {
    id: 'vendor-comparison',
    title: 'Vendor Comparison Tool',
    description: 'Compare quotes, services, and ratings from multiple vendors. Includes negotiation tips and contract review checklist.',
    icon: TrendingUp,
    category: 'Financial',
    downloadUrl: '/templates/vendor-comparison.xlsx'
  },
  {
    id: 'price-negotiation',
    title: 'Price Negotiation Guide',
    description: 'Step-by-step guide for negotiating with vendors, including scripts, tactics, and best practices for securing favorable terms.',
    icon: FileText,
    category: 'Financial',
    downloadUrl: '/templates/negotiation-guide.pdf'
  },
  {
    id: 'estate-manager-manual',
    title: 'Estate Manager Training Manual',
    description: 'Complete training guide covering responsibilities, protocols, staff management, and best practices for estate management.',
    icon: BookOpen,
    category: 'Training',
    downloadUrl: '/templates/estate-manager-manual.pdf'
  },
  {
    id: 'housekeeper-manual',
    title: 'Housekeeper Training Manual',
    description: 'Detailed cleaning protocols, product usage, room-by-room checklists, and quality standards for housekeeping staff.',
    icon: BookOpen,
    category: 'Training',
    downloadUrl: '/templates/housekeeper-manual.pdf'
  },
  {
    id: 'chef-manual',
    title: 'Private Chef Training Manual',
    description: 'Kitchen management, meal planning, dietary accommodations, food safety, and service standards for private chefs.',
    icon: BookOpen,
    category: 'Training',
    downloadUrl: '/templates/chef-manual.pdf'
  },
  {
    id: 'security-manual',
    title: 'Security Staff Training Manual',
    description: 'Security protocols, emergency procedures, access control, surveillance systems, and incident reporting guidelines.',
    icon: Shield,
    category: 'Training',
    downloadUrl: '/templates/security-manual.pdf'
  },
  {
    id: 'house-protocols',
    title: 'House Management Protocols',
    description: 'Standard operating procedures for daily operations, guest services, event management, and household routines.',
    icon: ClipboardList,
    category: 'Operations',
    downloadUrl: '/templates/house-protocols.pdf'
  },
  {
    id: 'inventory-list',
    title: 'Estate Inventory Template',
    description: 'Track furniture, artwork, electronics, linens, and all household items. Includes valuation and insurance documentation.',
    icon: ClipboardList,
    category: 'Operations',
    downloadUrl: '/templates/inventory-template.xlsx'
  },
  {
    id: 'emergency-procedures',
    title: 'Emergency Procedures Manual',
    description: 'Comprehensive emergency response plans for fire, medical emergencies, natural disasters, security breaches, and evacuations.',
    icon: AlertTriangle,
    category: 'Safety',
    downloadUrl: '/templates/emergency-procedures.pdf'
  },
  {
    id: 'emergency-contacts',
    title: 'Emergency Contact List',
    description: 'Essential phone numbers including police, fire, medical, utilities, contractors, and key personnel. Print and post throughout property.',
    icon: Phone,
    category: 'Safety',
    downloadUrl: '/templates/emergency-contacts.pdf'
  },
  {
    id: 'utility-shutoff',
    title: 'Utility Shut-Off Guide',
    description: 'Step-by-step instructions with photos for shutting off gas, water, and electricity in emergencies. Includes valve locations.',
    icon: Droplet,
    category: 'Safety',
    downloadUrl: '/templates/utility-shutoff-guide.pdf'
  },
  {
    id: 'gas-shutoff',
    title: 'Gas Shut-Off Procedures',
    description: 'Detailed guide for safely shutting off gas lines, identifying gas leaks, and when to call professionals.',
    icon: Flame,
    category: 'Safety',
    downloadUrl: '/templates/gas-shutoff.pdf'
  },
  {
    id: 'home-systems',
    title: 'Home Systems Manual',
    description: 'Operating instructions for HVAC, security, automation, pool systems, and all smart home technology.',
    icon: Home,
    category: 'Operations',
    downloadUrl: '/templates/home-systems-manual.pdf'
  },
  {
    id: 'warranty-registration',
    title: 'Appliance Warranty Guide',
    description: 'Instructions for registering appliances, tracking warranties, scheduling maintenance, and filing claims.',
    icon: FileText,
    category: 'Operations',
    downloadUrl: '/templates/warranty-guide.pdf'
  },
  {
    id: 'staff-handbook',
    title: 'Staff Handbook Template',
    description: 'Customizable employee handbook covering policies, expectations, benefits, and workplace guidelines.',
    icon: Users,
    category: 'HR',
    downloadUrl: '/templates/staff-handbook.pdf'
  }
];

const categories = ['All', 'Financial', 'Training', 'Operations', 'Safety', 'HR'];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredTools, setFilteredTools] = useState(tools);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let filtered = tools;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTools(filtered);
  }, [searchQuery, selectedCategory]);

  const handleDownload = (tool: Tool) => {
    // In a real app, this would trigger an actual download
    console.log('Downloading:', tool.title);
    alert(`Downloading ${tool.title}...`);
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="tools" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Estate Management Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Professional templates and guides to help you manage your estate efficiently. Download customizable resources for budgeting, training, operations, and safety.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background text-foreground border-border"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:bg-muted'
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No tools found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    className="p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                          {tool.title}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {tool.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-6 leading-relaxed">
                      {tool.description}
                    </p>

                    <Button
                      onClick={() => handleDownload(tool)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <Card className="mt-16 p-8 bg-gradient-1 text-primary-foreground">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-heading font-bold mb-4">
                Need Custom Templates?
              </h2>
              <p className="text-lg mb-6 text-primary-foreground/90">
                We can create customized templates and training materials specific to your estate's needs. Contact us to discuss your requirements.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
              >
                Request Custom Templates
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
