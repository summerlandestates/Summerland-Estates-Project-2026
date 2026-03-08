import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  downloadUrl?: string;
  price: string;
  includedInPlan?: string[];
}

const tools: Tool[] = [
  {
    id: 'budgeting',
    title: 'Estate Budget Template',
    description: 'Comprehensive budgeting spreadsheet for tracking household expenses, staff salaries, maintenance costs, and annual projections.',
    icon: DollarSign,
    category: 'Financial',
    downloadUrl: '/templates/estate-budget-template.xlsx',
    price: '$4.99',
    includedInPlan: ['estates-pro', 'agency-pro']
  },
  {
    id: 'vendor-comparison',
    title: 'Vendor Comparison Tool',
    description: 'Compare quotes, services, and ratings from multiple vendors. Includes negotiation tips and contract review checklist.',
    icon: TrendingUp,
    category: 'Financial',
    downloadUrl: '/templates/vendor-comparison.xlsx',
    price: '$3.99',
    includedInPlan: ['estates-hiring', 'estates-pro', 'agency-hiring', 'agency-pro']
  },
  {
    id: 'price-negotiation',
    title: 'Price Negotiation Guide',
    description: 'Step-by-step guide for negotiating with vendors, including scripts, tactics, and best practices for securing favorable terms.',
    icon: FileText,
    category: 'Financial',
    downloadUrl: '/templates/negotiation-guide.pdf',
    price: '$2.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'estate-manager-manual',
    title: 'Estate Manager Training Manual',
    description: 'Complete training guide covering responsibilities, protocols, staff management, and best practices for estate management.',
    icon: BookOpen,
    category: 'Training',
    downloadUrl: '/templates/estate-manager-manual.pdf',
    price: '$9.99',
    includedInPlan: ['estates-pro']
  },
  {
    id: 'housekeeper-manual',
    title: 'Housekeeper Training Manual',
    description: 'Detailed cleaning protocols, product usage, room-by-room checklists, and quality standards for housekeeping staff.',
    icon: BookOpen,
    category: 'Training',
    downloadUrl: '/templates/housekeeper-manual.pdf',
    price: '$7.99',
    includedInPlan: ['estates-hiring', 'estates-pro']
  },
  {
    id: 'chef-manual',
    title: 'Private Chef Training Manual',
    description: 'Kitchen management, meal planning, dietary accommodations, food safety, and service standards for private chefs.',
    icon: BookOpen,
    category: 'Training',
    downloadUrl: '/templates/chef-manual.pdf',
    price: '$7.99',
    includedInPlan: ['estates-hiring', 'estates-pro']
  },
  {
    id: 'security-manual',
    title: 'Security Staff Training Manual',
    description: 'Security protocols, emergency procedures, access control, surveillance systems, and incident reporting guidelines.',
    icon: Shield,
    category: 'Training',
    downloadUrl: '/templates/security-manual.pdf',
    price: '$7.99',
    includedInPlan: ['estates-pro']
  },
  {
    id: 'house-protocols',
    title: 'House Management Protocols',
    description: 'Standard operating procedures for daily operations, guest services, event management, and household routines.',
    icon: ClipboardList,
    category: 'Operations',
    downloadUrl: '/templates/house-protocols.pdf',
    price: '$5.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'inventory-list',
    title: 'Estate Inventory Template',
    description: 'Track furniture, artwork, electronics, linens, and all household items. Includes valuation and insurance documentation.',
    icon: ClipboardList,
    category: 'Operations',
    downloadUrl: '/templates/inventory-template.xlsx',
    price: '$3.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'emergency-procedures',
    title: 'Emergency Procedures Manual',
    description: 'Comprehensive emergency response plans for fire, medical emergencies, natural disasters, security breaches, and evacuations.',
    icon: AlertTriangle,
    category: 'Safety',
    downloadUrl: '/templates/emergency-procedures.pdf',
    price: '$4.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'emergency-contacts',
    title: 'Emergency Contact List',
    description: 'Essential phone numbers including police, fire, medical, utilities, contractors, and key personnel. Print and post throughout property.',
    icon: Phone,
    category: 'Safety',
    downloadUrl: '/templates/emergency-contacts.pdf',
    price: 'Free',
    includedInPlan: ['estates-free', 'estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'utility-shutoff',
    title: 'Utility Shut-Off Guide',
    description: 'Step-by-step instructions with photos for shutting off gas, water, and electricity in emergencies. Includes valve locations.',
    icon: Droplet,
    category: 'Safety',
    downloadUrl: '/templates/utility-shutoff-guide.pdf',
    price: '$1.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'gas-shutoff',
    title: 'Gas Shut-Off Procedures',
    description: 'Detailed guide for safely shutting off gas lines, identifying gas leaks, and when to call professionals.',
    icon: Flame,
    category: 'Safety',
    downloadUrl: '/templates/gas-shutoff.pdf',
    price: '$1.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'home-systems',
    title: 'Home Systems Manual',
    description: 'Operating instructions for HVAC, security, automation, pool systems, and all smart home technology.',
    icon: Home,
    category: 'Operations',
    downloadUrl: '/templates/home-systems-manual.pdf',
    price: '$6.99',
    includedInPlan: ['estates-hiring', 'estates-pro']
  },
  {
    id: 'warranty-registration',
    title: 'Appliance Warranty Guide',
    description: 'Instructions for registering appliances, tracking warranties, scheduling maintenance, and filing claims.',
    icon: FileText,
    category: 'Operations',
    downloadUrl: '/templates/warranty-guide.pdf',
    price: '$2.99',
    includedInPlan: ['estates-basic', 'estates-hiring', 'estates-pro']
  },
  {
    id: 'staff-handbook',
    title: 'Staff Handbook Template',
    description: 'Customizable employee handbook covering policies, expectations, benefits, and workplace guidelines.',
    icon: Users,
    category: 'HR',
    downloadUrl: '/templates/staff-handbook.pdf',
    price: '$8.99',
    includedInPlan: ['estates-hiring', 'estates-pro']
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

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const navigate = useNavigate();

  const handleDownload = (tool: Tool) => {
    if (tool.price === 'Free') {
      // Free download
      console.log('Downloading:', tool.title);
      toast.success('Download Started!', {
        description: `${tool.title} is being downloaded.`,
      });
    } else {
      // Show pricing modal for paid templates
      setSelectedTool(tool);
      setShowPricingModal(true);
    }
  };

  const handlePurchase = () => {
    if (selectedTool) {
      toast.success('Redirecting to checkout...', {
        description: `Purchasing ${selectedTool.title} for ${selectedTool.price}`,
      });
      setShowPricingModal(false);
      // In real app, would redirect to Stripe checkout
    }
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
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-heading font-semibold text-foreground">
                            {tool.title}
                          </h3>
                          <span className={`text-sm font-semibold ${tool.price === 'Free' ? 'text-green-600' : 'text-primary'}`}>
                            {tool.price}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {tool.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-4 leading-relaxed">
                      {tool.description}
                    </p>

                    {tool.includedInPlan && tool.includedInPlan.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Included in: {tool.includedInPlan.map(p => p.replace('estates-', '').replace('agency-', '')).join(', ')} plans
                      </p>
                    )}

                    <Button
                      onClick={() => handleDownload(tool)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {tool.price === 'Free' ? 'Download Free' : `Purchase ${tool.price}`}
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
                  >
                    Request Custom Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-heading">Request Custom Template</DialogTitle>
                    <DialogDescription>
                      Fill out the form below and we'll create a customized template for your estate's needs.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success('Request Submitted!', {
                        description: 'We will review your request and get back to you within 2-3 business days.',
                      });
                    }}
                    className="space-y-4 mt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="request_name">Your Name</Label>
                      <Input
                        id="request_name"
                        placeholder="Full name"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="request_email">Email Address</Label>
                      <Input
                        id="request_email"
                        type="email"
                        placeholder="email@example.com"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template_name">Template Name</Label>
                      <Input
                        id="template_name"
                        placeholder="e.g. Wine Cellar Inventory Tracker"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template_description">Description</Label>
                      <Textarea
                        id="template_description"
                        placeholder="Describe what you need the template to do, what fields it should include, and any specific requirements..."
                        rows={4}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1 bg-[#A89F91] hover:bg-[#8A8279]">
                        Submit Request
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Pricing Modal for Paid Templates */}
      {showPricingModal && selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-card">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2 text-center">
              Download Template
            </h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              {selectedTool.title}
            </p>
            
            <div className="space-y-4">
              {/* Purchase Option */}
              <div 
                className="border-2 border-[#A89F91] rounded-lg p-4 cursor-pointer hover:bg-[#A89F91]/5 transition-colors"
                onClick={handlePurchase}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">One-Time Purchase</span>
                  <span className="text-xl font-bold text-[#A89F91]">{selectedTool.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Download this template immediately
                </p>
              </div>

              {/* Join Now Option */}
              <div 
                className="border-2 border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  setShowPricingModal(false);
                  navigate('/add-listing');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">Join Now</span>
                  <span className="text-sm font-medium text-green-600">Included in Pro Plans</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get unlimited access to all templates with a membership
                </p>
              </div>
            </div>

            {selectedTool.includedInPlan && selectedTool.includedInPlan.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                This template is included in: {selectedTool.includedInPlan.map(p => p.replace('estates-', 'Estates ').replace('agency-', 'Agency ')).join(', ')} plans
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPricingModal(false);
                  setSelectedTool(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#A89F91] hover:bg-[#8A8279] text-white"
                onClick={handlePurchase}
              >
                Purchase {selectedTool.price}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
