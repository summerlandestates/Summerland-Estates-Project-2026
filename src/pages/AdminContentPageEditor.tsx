import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Globe, FileText } from 'lucide-react';
import { contentManager, ContentPage } from '@/lib/contentManagement';
import SEOHead from '@/components/SEOHead';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image',
];

export default function AdminContentPageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageMetaDesc, setPageMetaDesc] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isNew) return;
    contentManager.init().then(() => {
      const page = contentManager.getContent().pages.find((p) => p.id === id || p.slug === id);
      if (!page) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setPageContent(page.content);
      setPageMetaDesc(page.metaDescription);
      setPagePublished(page.isPublished);
      setSlugEdited(true);
      setLoading(false);
    });
  }, [id, isNew]);

  const handleTitleChange = (value: string) => {
    setPageTitle(value);
    if (!slugEdited) {
      setPageSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      );
    }
  };

  const savePage = async () => {
    if (!pageTitle.trim() || !pageSlug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    const page: ContentPage = {
      id: isNew ? pageSlug : id!,
      title: pageTitle,
      slug: pageSlug,
      content: pageContent,
      metaDescription: pageMetaDesc,
      isPublished: pagePublished,
      lastUpdated: new Date().toISOString(),
    };

    try {
      await contentManager.updatePage(page);
      toast.success(isNew ? 'Page created successfully' : 'Page updated successfully');
      navigate('/admin/content');
    } catch (error: any) {
      toast.error('Failed to save page', { description: error?.message });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <FileText className="w-8 h-8 animate-pulse text-[#A89F91]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <FileText className="w-12 h-12 mb-4 text-[#D4CCC0]" />
        <h2 className="text-lg font-semibold text-[#2C2820] mb-1">Page not found</h2>
        <p className="text-sm text-[#9A9183] mb-4">This content page does not exist.</p>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/content')}
          className="border-[#E8E2D9]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Content
        </Button>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={`${isNew ? 'New Page' : 'Edit Page'} - Admin`}
        description="Edit content page."
        noIndex={true}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/content')}
            className="border-[#E8E2D9] text-[#5C554A] hover:bg-[#F2EDE4]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#2C2820]">
              {isNew ? 'Create New Page' : 'Edit Page'}
            </h1>
            <p className="text-sm text-[#9A9183]">
              {isNew ? 'Add a new content page to your site' : `Editing: ${pageTitle}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={
              pagePublished
                ? 'bg-green-100 text-green-700 border-0'
                : 'bg-gray-100 text-gray-500 border-0'
            }
          >
            {pagePublished ? 'Published' : 'Draft'}
          </Badge>
          <Button onClick={savePage} className="bg-[#A89F91] hover:bg-[#8A8279] text-white">
            <Save className="w-4 h-4 mr-2" />
            {isNew ? 'Create Page' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <Card className="border-[#E8E2D9] bg-white lg:col-span-2">
          <CardHeader className="border-b border-[#F2EDE4] pb-4">
            <CardTitle className="text-base font-semibold text-[#2C2820]">Page Content</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Page Title</Label>
              <Input
                value={pageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Privacy Policy"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="mb-2 block">Content</Label>
              <div className="border border-[#E8E2D9] rounded-md overflow-hidden">
                <ReactQuill
                  value={pageContent}
                  onChange={setPageContent}
                  modules={quillModules}
                  formats={quillFormats}
                  className="min-h-[350px]"
                />
              </div>
              <p className="text-xs text-[#9A9183] mt-1">
                Copy and paste formatted text directly from Word, ChatGPT, or any document
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Settings sidebar */}
        <div className="space-y-6">
          <Card className="border-[#E8E2D9] bg-white">
            <CardHeader className="border-b border-[#F2EDE4] pb-4">
              <CardTitle className="text-base font-semibold text-[#2C2820]">Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div>
                <Label>URL Slug</Label>
                <div className="mt-1 flex items-center rounded-md border border-input bg-background overflow-hidden">
                  <span className="px-3 text-sm text-[#9A9183] bg-[#FBF9F6] border-r border-[#E8E2D9] py-2">
                    /
                  </span>
                  <Input
                    value={pageSlug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    placeholder="privacy-policy"
                    className="border-0 focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-[#9A9183] mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  The page will be available at /{pageSlug || 'slug'}
                </p>
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={pageMetaDesc}
                  onChange={(e) => setPageMetaDesc(e.target.value)}
                  placeholder="Brief description for SEO..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <Label className="font-semibold text-[#2C2820]">Published</Label>
                  <p className="text-xs text-[#9A9183]">Make this page live on the site</p>
                </div>
                <Switch checked={pagePublished} onCheckedChange={setPagePublished} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E2D9] bg-white">
            <CardContent className="pt-6">
              <Button
                onClick={savePage}
                className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isNew ? 'Create Page' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/content')}
                className="w-full mt-2 border-[#E8E2D9] text-[#5C554A] hover:bg-[#F2EDE4]"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
