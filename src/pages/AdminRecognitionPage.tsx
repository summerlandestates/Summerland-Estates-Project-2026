import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Star,
  Trophy,
  Users,
  Sparkles,
  Building2,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface Recognition {
  id: string;
  name: string;
  title: string;
  location: string;
  category: 'employee' | 'craft' | 'annual' | 'story' | 'vendor';
  description: string;
  award_date: string;
  image_url: string | null;
  is_featured: boolean;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

const categoryOptions = [
  { value: 'employee', label: 'Employee of the Month', icon: Users },
  { value: 'craft', label: 'Craft Excellence', icon: Star },
  { value: 'annual', label: 'Annual Awards', icon: Trophy },
  { value: 'story', label: 'Success Stories', icon: Sparkles },
  { value: 'vendor', label: 'Vendor Spotlight', icon: Building2 },
];

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-700' },
];

export default function AdminRecognitionPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecognition, setEditingRecognition] = useState<Recognition | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRecognition, setDeletingRecognition] = useState<Recognition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: '',
    category: 'employee' as Recognition['category'],
    description: '',
    award_date: '',
    image_url: '',
    is_featured: false,
    display_order: 0,
    status: 'published' as Recognition['status'],
  });

  useEffect(() => {
    if (authLoading) return;
    checkAdminAccess();
  }, [authLoading, user]);

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
      navigate('/admin/login');
      return;
    }

    fetchRecognitions();
  };

  const fetchRecognitions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recognitions')
        .select('*')
        .order('display_order', { ascending: true })
        .order('award_date', { ascending: false });

      if (error) throw error;

      setRecognitions(data || []);
    } catch (error: any) {
      toast.error('Failed to load recognitions', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.award_date) errors.award_date = 'Award date is required';
    if (formData.description.length < 10) errors.description = 'Description must be at least 10 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (editingRecognition) {
        const { error } = await supabase
          .from('recognitions')
          .update(data)
          .eq('id', editingRecognition.id);

        if (error) throw error;
        toast.success('Recognition updated successfully!');
      } else {
        const { error } = await supabase
          .from('recognitions')
          .insert({ ...data, created_at: new Date().toISOString() });

        if (error) throw error;
        toast.success('Recognition added successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchRecognitions();
    } catch (error: any) {
      toast.error(editingRecognition ? 'Failed to update recognition' : 'Failed to add recognition', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecognition) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('recognitions')
        .delete()
        .eq('id', deletingRecognition.id);

      if (error) throw error;

      toast.success('Recognition deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeletingRecognition(null);
      fetchRecognitions();
    } catch (error: any) {
      toast.error('Failed to delete recognition', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `recognitions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload image', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setImageUploading(false);
    }
  };

  const openAddDialog = () => {
    setEditingRecognition(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (recognition: Recognition) => {
    setEditingRecognition(recognition);
    setFormData({
      name: recognition.name,
      title: recognition.title,
      location: recognition.location || '',
      category: recognition.category,
      description: recognition.description,
      award_date: recognition.award_date,
      image_url: recognition.image_url || '',
      is_featured: recognition.is_featured,
      display_order: recognition.display_order,
      status: recognition.status,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (recognition: Recognition) => {
    setDeletingRecognition(recognition);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      location: '',
      category: 'employee',
      description: '',
      award_date: '',
      image_url: '',
      is_featured: false,
      display_order: 0,
      status: 'published',
    });
    setFormErrors({});
    setEditingRecognition(null);
  };

  const getCategoryIcon = (category: string) => {
    const option = categoryOptions.find(o => o.value === category);
    const Icon = option?.icon || Award;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: string) => {
    return categoryOptions.find(o => o.value === category)?.label || category;
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return (
      <Badge className={option?.color || 'bg-gray-100'}>
        {option?.label || status}
      </Badge>
    );
  };

  const filteredRecognitions = recognitions.filter(r => {
    const matchesSearch = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: recognitions.length,
    published: recognitions.filter(r => r.status === 'published').length,
    featured: recognitions.filter(r => r.is_featured).length,
    draft: recognitions.filter(r => r.status === 'draft').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#A89F91] mx-auto mb-4" />
            <p className="text-gray-600">Loading recognitions...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-[#A89F91]" />
                <div>
                  <h1 className="text-4xl font-heading font-bold text-gray-900">
                    Recognition Management
                  </h1>
                  <p className="text-gray-600">
                    Manage estate service recognitions and awards
                  </p>
                </div>
              </div>
              <Button
                onClick={openAddDialog}
                className="rounded-xl bg-[#A89F91] hover:bg-[#8A8279] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Recognition
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6 border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, title, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Table */}
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Recipient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Award Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecognitions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No recognitions found</p>
                        <p className="text-sm">Add your first recognition to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecognitions.map((recognition) => (
                      <tr key={recognition.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{recognition.display_order}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {recognition.image_url ? (
                              <img
                                src={recognition.image_url}
                                alt={recognition.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#A89F91]/10 flex items-center justify-center">
                                <Award className="w-5 h-5 text-[#A89F91]" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{recognition.name}</p>
                              <p className="text-sm text-gray-500">{recognition.title}</p>
                              {recognition.is_featured && (
                                <Badge className="mt-1 bg-amber-100 text-amber-700 text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(recognition.category)}
                            <span className="text-sm text-gray-700">{getCategoryLabel(recognition.category)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(recognition.award_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(recognition.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-[#CFC5B7] hover:bg-[#F7F1EA]"
                              onClick={() => openEditDialog(recognition)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => openDeleteDialog(recognition)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {editingRecognition ? 'Edit Recognition' : 'Add New Recognition'}
            </DialogTitle>
            <DialogDescription>
              {editingRecognition 
                ? 'Update the recognition details below.' 
                : 'Fill in the details to add a new recognition award.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Maria Santos"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title/Position *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Executive Housekeeper"
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Recognition['category'] }))}
                >
                  <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="award_date">Award Date *</Label>
                <Input
                  id="award_date"
                  type="date"
                  value={formData.award_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, award_date: e.target.value }))}
                  className={formErrors.award_date ? 'border-red-500' : ''}
                />
                {formErrors.award_date && <p className="text-sm text-red-500">{formErrors.award_date}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Beverly Hills, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe why this person is being recognized..."
                rows={4}
                className={formErrors.description ? 'border-red-500' : ''}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
              <p className="text-xs text-gray-500">{formData.description.length} characters</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-4">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="text-sm"
                  />
                  {imageUploading && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Recognition['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="is_featured" className="cursor-pointer">Featured</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white"
                disabled={isSubmitting || imageUploading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingRecognition ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingRecognition ? 'Update Recognition' : 'Add Recognition'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recognition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the recognition for <strong>{deletingRecognition?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
