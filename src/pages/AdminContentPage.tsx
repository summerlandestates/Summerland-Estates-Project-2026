import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import {
  FileText,
  Save,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCcw,
  HelpCircle,
  Cookie,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  contentManager,
  ContentPage,
  FAQItem,
  CookieConsentConfig,
  defaultContent,
} from '@/lib/contentManagement';

export default function AdminContentPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pages');

  // Pages state
  const [pages, setPages] = useState<ContentPage[]>([]);
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

  const loadContent = async () => {
    const content = await contentManager.init();
    setPages(content.pages);
    setFaqs(
      content.faqs
        .filter((f: FAQItem) => f.isPublished)
        .sort((a: FAQItem, b: FAQItem) => a.order - b.order)
    );
    setFaqCategories(contentManager.getFAQCategories());
    setCookieConfig(content.cookieConfig);
  };

  const deletePage = async (id: string) => {
    try {
      await contentManager.deletePage(id);
      await loadContent();
      toast.success('Page deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete page', { description: error?.message });
    }
    setPageToDelete(null);
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

  const saveFAQ = async () => {
    if (!faqQuestion || !faqAnswer) {
      toast.error('Question and answer are required');
      return;
    }

    const category = faqNewCategory || faqCategory;
    if (!category || category === 'new') {
      toast.error('Category is required');
      return;
    }

    const maxOrder = Math.max(...faqs.map((f) => f.order), 0);

    const faq: FAQItem = {
      id: selectedFAQ?.id || Date.now().toString(),
      question: faqQuestion,
      answer: faqAnswer,
      category,
      order: selectedFAQ?.order || maxOrder + 1,
      isPublished: faqPublished,
    };

    try {
      await contentManager.updateFAQ(faq);
      await loadContent();
      setIsFAQDialogOpen(false);
      toast.success(selectedFAQ ? 'FAQ updated successfully' : 'FAQ created successfully');
    } catch (error: any) {
      toast.error('Failed to save FAQ', { description: error?.message });
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      await contentManager.deleteFAQ(id);
      await loadContent();
      toast.success('FAQ deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete FAQ', { description: error?.message });
    }
    setFaqToDelete(null);
  };

  // Cookie handlers
  const saveCookieConfig = async () => {
    try {
      await contentManager.updateCookieConfig(cookieConfig);
      toast.success('Cookie consent settings saved');
    } catch (error: any) {
      toast.error('Failed to save settings', { description: error?.message });
    }
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

  const importContent = async () => {
    try {
      const success = await contentManager.importData(importData);
      if (success) {
        await loadContent();
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

  const resetToDefault = async () => {
    await contentManager.resetToDefault();
    await loadContent();
    setIsResetDialogOpen(false);
    toast.success('Content reset to default');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#2C2820] mb-1">
            Content Management
          </h1>
          <p className="text-sm text-[#9A9183]">
            Manage pages, FAQs, and cookie consent settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="border-[#E8E2D9] text-[#5C554A] hover:bg-[#F2EDE4]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="border-[#E8E2D9] text-[#5C554A] hover:bg-[#F2EDE4]"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="border-[#E8E2D9] text-[#5C554A] hover:bg-[#F2EDE4]"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-[#E8E2D9] p-1 mb-6">
          <TabsTrigger
            value="pages"
            className="data-[state=active]:bg-[#A89F91] data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger
            value="faqs"
            className="data-[state=active]:bg-[#A89F91] data-[state=active]:text-white"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger
            value="cookies"
            className="data-[state=active]:bg-[#A89F91] data-[state=active]:text-white"
          >
            <Cookie className="w-4 h-4 mr-2" />
            Cookie Consent
          </TabsTrigger>
        </TabsList>

        {/* Pages Tab — list layout */}
        <TabsContent value="pages">
          <Card className="border-[#E8E2D9] bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#F2EDE4] pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-[#2C2820]">
                  Content Pages
                </CardTitle>
                <p className="text-xs text-[#9A9183] mt-1">
                  Manage Privacy Policy, Terms &amp; Conditions, and custom pages
                </p>
              </div>
              <Button
                onClick={() => navigate('/admin/content/pages/new')}
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Page
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {pages.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-[#D4CCC0]" />
                  <h3 className="text-base font-semibold text-[#2C2820] mb-1">No pages yet</h3>
                  <p className="text-sm text-[#9A9183] mb-4">Create your first content page.</p>
                  <Button
                    onClick={() => navigate('/admin/content/pages/new')}
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Page
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#F2EDE4]">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-[#FBF9F6] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/content/pages/${page.id}`)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#A89F91]/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#A89F91]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-semibold text-[#2C2820] truncate">{page.title}</h3>
                            <Badge
                              className={
                                page.isPublished
                                  ? 'bg-green-100 text-green-700 border-0'
                                  : 'bg-gray-100 text-gray-500 border-0'
                              }
                            >
                              {page.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-[#9A9183]">
                              <Globe className="w-3 h-3" />
                              {['privacy', 'terms'].includes(page.slug)
                                ? `/${page.slug}`
                                : `/pages/${page.slug}`}
                            </span>
                            <span className="text-xs text-[#B8AFA3]">
                              Updated {new Date(page.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#5C554A] hover:bg-[#F2EDE4]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/content/pages/${page.id}`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPageToDelete(page.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-[#D4CCC0] group-hover:text-[#A89F91] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card className="border-[#E8E2D9] bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#F2EDE4] pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-[#2C2820]">FAQs</CardTitle>
                <p className="text-xs text-[#9A9183] mt-1">
                  Manage frequently asked questions by category
                </p>
              </div>
              <Button
                onClick={() => openFAQDialog()}
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </CardHeader>
            <CardContent>
              {faqCategories.map((category) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="font-semibold text-sm text-[#2C2820] mb-3 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2 text-[#A89F91]" />
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {faqs
                      .filter((f) => f.category === category)
                      .map((faq) => (
                        <div
                          key={faq.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#F2EDE4] hover:bg-[#FBF9F6] transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#2C2820]">{faq.question}</p>
                            <p className="text-xs text-[#9A9183] line-clamp-2 mt-0.5">{faq.answer}</p>
                          </div>
                          <div className="flex gap-1 ml-3 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#5C554A] hover:bg-[#F2EDE4]"
                              onClick={() => openFAQDialog(faq)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => setFaqToDelete(faq.id)}
                            >
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
          <Card className="border-[#E8E2D9] bg-white">
            <CardHeader className="border-b border-[#F2EDE4] pb-4">
              <CardTitle className="text-base font-semibold text-[#2C2820]">
                Cookie Consent Banner
              </CardTitle>
              <p className="text-xs text-[#9A9183] mt-1">
                Configure the cookie consent banner that appears to users
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold text-[#2C2820]">Enable Cookie Banner</Label>
                  <p className="text-sm text-[#9A9183]">Show the cookie consent banner to users</p>
                </div>
                <Switch
                  checked={cookieConfig.enabled}
                  onCheckedChange={(checked) =>
                    setCookieConfig({ ...cookieConfig, enabled: checked })
                  }
                />
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={cookieConfig.title}
                  onChange={(e) => setCookieConfig({ ...cookieConfig, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={cookieConfig.message}
                  onChange={(e) => setCookieConfig({ ...cookieConfig, message: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Accept Button Text</Label>
                  <Input
                    value={cookieConfig.acceptButtonText}
                    onChange={(e) =>
                      setCookieConfig({ ...cookieConfig, acceptButtonText: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Decline Button Text</Label>
                  <Input
                    value={cookieConfig.declineButtonText}
                    onChange={(e) =>
                      setCookieConfig({ ...cookieConfig, declineButtonText: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Privacy Link Text</Label>
                <Input
                  value={cookieConfig.privacyLinkText}
                  onChange={(e) =>
                    setCookieConfig({ ...cookieConfig, privacyLinkText: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Select
                    value={cookieConfig.position}
                    onValueChange={(value: any) =>
                      setCookieConfig({ ...cookieConfig, position: value })
                    }
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
                    onValueChange={(value: any) =>
                      setCookieConfig({ ...cookieConfig, theme: value })
                    }
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

              <Button onClick={saveCookieConfig} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Cookie Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ Edit Dialog */}
      <Dialog open={isFAQDialogOpen} onOpenChange={setIsFAQDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
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
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
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
              <Switch checked={faqPublished} onCheckedChange={setFaqPublished} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFAQDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveFAQ} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="bg-white">
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
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={importContent} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pageToDelete && deletePage(pageToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!faqToDelete} onOpenChange={() => setFaqToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => faqToDelete && deleteFAQ(faqToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all content to the default values. All your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDefault} className="bg-red-600 hover:bg-red-700">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
