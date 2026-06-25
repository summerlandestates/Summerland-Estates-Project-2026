import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Save, Plus, Edit, Trash2, Download, Upload, RefreshCcw, HelpCircle, Cookie } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { contentManager, ContentPage, FAQItem, CookieConsentConfig, defaultContent } from '@/lib/contentManagement';

// Import React Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image'
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('pages');
  
  // Pages state
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageMetaDesc, setPageMetaDesc] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  
  // FAQs state
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqCategories, setFaqCategories] = useState<string[]>([]);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('');
  const [faqNewCategory, setFaqNewCategory] = useState('');
  const [faqPublished, setFaqPublished] = useState(true);
  const [isFAQDialogOpen, setIsFAQDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  
  // Cookie consent state
  const [cookieConfig, setCookieConfig] = useState<CookieConsentConfig>(defaultContent.cookieConfig);
  
  // Import/Export state
  const [importData, setImportData] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    const content = contentManager.getContent();
    setPages(content.pages);
    setFaqs(content.faqs.filter((f: FAQItem) => f.isPublished).sort((a: FAQItem, b: FAQItem) => a.order - b.order));
    setFaqCategories(contentManager.getFAQCategories());
    setCookieConfig(content.cookieConfig);
  };

  // Page handlers
  const openPageDialog = (page?: ContentPage) => {
    if (page) {
      setSelectedPage(page);
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setPageContent(page.content);
      setPageMetaDesc(page.metaDescription);
      setPagePublished(page.isPublished);
    } else {
      setSelectedPage(null);
      setPageTitle('');
      setPageSlug('');
      setPageContent('');
      setPageMetaDesc('');
      setPagePublished(true);
    }
    setIsPageDialogOpen(true);
  };

  const savePage = () => {
    if (!pageTitle || !pageSlug) {
      toast.error('Title and slug are required');
      return;
    }

    const page: ContentPage = {
      id: selectedPage?.id || pageSlug,
      title: pageTitle,
      slug: pageSlug,
      content: pageContent,
      metaDescription: pageMetaDesc,
      isPublished: pagePublished,
      lastUpdated: new Date().toISOString()
    };

    contentManager.updatePage(page);
    loadContent();
    setIsPageDialogOpen(false);
    toast.success(selectedPage ? 'Page updated successfully' : 'Page created successfully');
  };

  const deletePage = (id: string) => {
    contentManager.deletePage(id);
    loadContent();
    setPageToDelete(null);
    toast.success('Page deleted successfully');
  };

  // FAQ handlers
  const openFAQDialog = (faq?: FAQItem) => {
    if (faq) {
      setSelectedFAQ(faq);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
      setFaqCategory(faq.category);
      setFaqPublished(faq.isPublished);
    } else {
      setSelectedFAQ(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqCategory('');
      setFaqPublished(true);
    }
    setFaqNewCategory('');
    setIsFAQDialogOpen(true);
  };

  const saveFAQ = () => {
    if (!faqQuestion || !faqAnswer) {
      toast.error('Question and answer are required');
      return;
    }

    const category = faqNewCategory || faqCategory;
    if (!category) {
      toast.error('Category is required');
      return;
    }

    const maxOrder = Math.max(...faqs.map(f => f.order), 0);

    const faq: FAQItem = {
      id: selectedFAQ?.id || Date.now().toString(),
      question: faqQuestion,
      answer: faqAnswer,
      category,
      order: selectedFAQ?.order || maxOrder + 1,
      isPublished: faqPublished
    };

    contentManager.updateFAQ(faq);
    loadContent();
    setIsFAQDialogOpen(false);
    toast.success(selectedFAQ ? 'FAQ updated successfully' : 'FAQ created successfully');
  };

  const deleteFAQ = (id: string) => {
    contentManager.deleteFAQ(id);
    loadContent();
    setFaqToDelete(null);
    toast.success('FAQ deleted successfully');
  };

  // Cookie handlers
  const saveCookieConfig = () => {
    contentManager.updateCookieConfig(cookieConfig);
    toast.success('Cookie consent settings saved');
  };

  // Import/Export
  const exportData = () => {
    const data = contentManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summerland-content-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Content exported successfully');
  };

  const importContent = () => {
    try {
      const success = contentManager.importData(importData);
      if (success) {
        loadContent();
        setIsImportDialogOpen(false);
        setImportData('');
        toast.success('Content imported successfully');
      } else {
        toast.error('Invalid data format');
      }
    } catch {
      toast.error('Failed to import data');
    }
  };

  const resetToDefault = () => {
    contentManager.resetToDefault();
    loadContent();
    setIsResetDialogOpen(false);
    toast.success('Content reset to default');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold">Content Management</h1>
              <p className="text-muted-foreground">Manage pages, FAQs, and cookie consent settings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="pages">
                <FileText className="w-4 h-4 mr-2" />
                Pages
              </TabsTrigger>
              <TabsTrigger value="faqs">
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="cookies">
                <Cookie className="w-4 h-4 mr-2" />
                Cookie Consent
              </TabsTrigger>
            </TabsList>

            {/* Pages Tab */}
            <TabsContent value="pages">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Content Pages</CardTitle>
                    <CardDescription>Manage Privacy Policy, Terms & Conditions, and custom pages</CardDescription>
                  </div>
                  <Button onClick={() => openPageDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Page
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{page.title}</h3>
                            {page.isPublished ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Published</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Draft</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">/{page.slug}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openPageDialog(page)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setPageToDelete(page.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQs Tab */}
            <TabsContent value="faqs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>FAQs</CardTitle>
                    <CardDescription>Manage frequently asked questions by category</CardDescription>
                  </div>
                  <Button onClick={() => openFAQDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </CardHeader>
                <CardContent>
                  {faqCategories.map((category) => (
                    <div key={category} className="mb-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                        {category}
                      </h3>
                      <div className="space-y-2 pl-7">
                        {faqs.filter(f => f.category === category).map((faq) => (
                          <div key={faq.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium">{faq.question}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button variant="ghost" size="sm" onClick={() => openFAQDialog(faq)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setFaqToDelete(faq.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cookie Consent Tab */}
            <TabsContent value="cookies">
              <Card>
                <CardHeader>
                  <CardTitle>Cookie Consent Banner</CardTitle>
                  <CardDescription>Configure the cookie consent banner that appears to users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-semibold">Enable Cookie Banner</Label>
                      <p className="text-sm text-muted-foreground">Show the cookie consent banner to users</p>
                    </div>
                    <Switch 
                      checked={cookieConfig.enabled} 
                      onCheckedChange={(checked) => setCookieConfig({...cookieConfig, enabled: checked})}
                    />
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={cookieConfig.title} 
                      onChange={(e) => setCookieConfig({...cookieConfig, title: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Message</Label>
                    <Textarea 
                      value={cookieConfig.message} 
                      onChange={(e) => setCookieConfig({...cookieConfig, message: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Accept Button Text</Label>
                      <Input 
                        value={cookieConfig.acceptButtonText} 
                        onChange={(e) => setCookieConfig({...cookieConfig, acceptButtonText: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Decline Button Text</Label>
                      <Input 
                        value={cookieConfig.declineButtonText} 
                        onChange={(e) => setCookieConfig({...cookieConfig, declineButtonText: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Privacy Link Text</Label>
                    <Input 
                      value={cookieConfig.privacyLinkText} 
                      onChange={(e) => setCookieConfig({...cookieConfig, privacyLinkText: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Position</Label>
                      <Select 
                        value={cookieConfig.position} 
                        onValueChange={(value: any) => setCookieConfig({...cookieConfig, position: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Theme</Label>
                      <Select 
                        value={cookieConfig.theme} 
                        onValueChange={(value: any) => setCookieConfig({...cookieConfig, theme: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={saveCookieConfig} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Cookie Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Page Edit Dialog */}
      <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
            <DialogDescription>
              Use the HTML editor to format your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Page Title</Label>
              <Input 
                value={pageTitle} 
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="e.g., Privacy Policy"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input 
                value={pageSlug} 
                onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g., privacy-policy"
              />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea 
                value={pageMetaDesc} 
                onChange={(e) => setPageMetaDesc(e.target.value)}
                placeholder="Brief description for SEO..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch 
                checked={pagePublished} 
                onCheckedChange={setPagePublished}
              />
            </div>
            <div>
              <Label className="mb-2 block">Content</Label>
              <div className="border rounded-md">
                <ReactQuill
                  value={pageContent}
                  onChange={setPageContent}
                  modules={quillModules}
                  formats={quillFormats}
                  className="min-h-[300px]"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Copy and paste formatted text directly from Word, ChatGPT, or any document
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePage}>
              <Save className="w-4 h-4 mr-2" />
              Save Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Edit Dialog */}
      <Dialog open={isFAQDialogOpen} onOpenChange={setIsFAQDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFAQ ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Question</Label>
              <Input 
                value={faqQuestion} 
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="e.g., How do I create an account?"
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea 
                value={faqAnswer} 
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="Provide a clear answer..."
                rows={5}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={faqCategory} onValueChange={setFaqCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or create category" />
                </SelectTrigger>
                <SelectContent>
                  {faqCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="new">+ Create New Category</SelectItem>
                </SelectContent>
              </Select>
              {faqCategory === 'new' && (
                <Input 
                  className="mt-2"
                  placeholder="Enter new category name"
                  value={faqNewCategory}
                  onChange={(e) => setFaqNewCategory(e.target.value)}
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch 
                checked={faqPublished} 
                onCheckedChange={setFaqPublished}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFAQDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveFAQ}>
              <Save className="w-4 h-4 mr-2" />
              Save FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Content</DialogTitle>
            <DialogDescription>Paste your JSON data to import</DialogDescription>
          </DialogHeader>
          <Textarea 
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='{"pages": [...], "faqs": [...]}'
            rows={10}
            className="font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={importContent}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pageToDelete && deletePage(pageToDelete)} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!faqToDelete} onOpenChange={() => setFaqToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => faqToDelete && deleteFAQ(faqToDelete)} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all content to the default values. All your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDefault} className="bg-red-600">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}