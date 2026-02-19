import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Save, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ContentPage {
  id: string;
  page_type: string;
  title: string;
  content: string;
  updated_at: string;
}

const pageTypes = [
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'about', label: 'About Us' },
  { value: 'faqs', label: 'FAQs' },
];

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      toast.error('Access Denied', {
        description: 'You do not have admin privileges',
      });
      navigate('/');
      return;
    }

    fetchPages();
  };

  const fetchPages = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      toast.error('Database Error', {
        description: 'Please run the SQL script: supabase-content-pages.sql in Supabase',
      });
    } else if (data) {
      setPages(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedPage || !title || !content) {
      toast.error('Validation Error', {
        description: 'Please fill in all fields',
      });
      return;
    }

    setSaving(true);

    if (editingId) {
      // Update existing page
      const { error } = await supabase
        .from('content_pages')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        toast.error('Update Failed', {
          description: error.message,
        });
      } else {
        toast.success('Page Updated', {
          description: 'Content has been saved successfully',
        });
        resetForm();
        fetchPages();
      }
    } else {
      // Create new page
      const { error } = await supabase.from('content_pages').insert({
        page_type: selectedPage,
        title,
        content,
      });

      if (error) {
        toast.error('Save Failed', {
          description: error.message,
        });
      } else {
        toast.success('Page Created', {
          description: 'Content has been saved successfully',
        });
        resetForm();
        fetchPages();
      }
    }

    setSaving(false);
  };

  const handleEdit = (page: ContentPage) => {
    setEditingId(page.id);
    setSelectedPage(page.page_type);
    setTitle(page.title);
    setContent(page.content);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return;
    }

    const { error } = await supabase.from('content_pages').delete().eq('id', id);

    if (error) {
      toast.error('Delete Failed', {
        description: error.message,
      });
    } else {
      toast.success('Page Deleted');
      fetchPages();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedPage('');
    setTitle('');
    setContent('');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              Content Management
            </h1>
            <p className="text-gray-600">
              Manage legal pages and site content
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#A89F91]" />
                    {editingId ? 'Edit Page' : 'Create New Page'}
                  </CardTitle>
                  <CardDescription>
                    {editingId ? 'Update existing content' : 'Add a new content page'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="page-type">Page Type</Label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter page title"
                      className="border-gray-300 focus:border-[#A89F91] focus:ring-[#A89F91]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        className="bg-white"
                        style={{ minHeight: '400px' }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#A89F91] hover:bg-[#B45309] text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingId ? 'Update Page' : 'Create Page'}
                        </>
                      )}
                    </Button>
                    {editingId && (
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Existing Pages */}
            <div>
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Existing Pages</CardTitle>
                  <CardDescription>
                    {pages.length} page{pages.length !== 1 ? 's' : ''} published
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#A89F91] transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {page.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {pageTypes.find((t) => t.value === page.page_type)?.label}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                          Updated: {new Date(page.updated_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(page)}
                            className="flex-1 border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91] hover:text-white"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(page.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {pages.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 text-sm">No pages created yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
