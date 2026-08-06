import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Search, ArrowLeft, Calendar, User, Clock, X, Loader2, Image, Globe, FileText, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Article, ArticleFormData } from "../types/articles";
import { ARTICLE_CATEGORIES } from "../types/articles";
import { getTierLimits } from "@/utils/tierAccess";
import type { PricingTier } from "../types";
import UpgradePrompt from "./UpgradePrompt";

interface ArticleManagerProps {
  userRole: "admin" | "user";
  userId: string;
  userName: string;
  userAvatar?: string;
  userTier?: PricingTier;
}

type ViewMode = "list" | "create" | "edit" | "view";

const EMPTY_FORM: ArticleFormData = {
  title: "",
  content: "",
  excerpt: "",
  metaTitle: "",
  metaDescription: "",
  category: "",
  tags: [],
  status: "draft",
  featuredImage: undefined,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));
}

function mapRow(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string,
    excerpt: (row.excerpt as string) || "",
    featuredImage: row.featured_image as string | undefined,
    metaTitle: row.meta_title as string | undefined,
    metaDescription: row.meta_description as string | undefined,
    authorId: (row.author_id as string) || "",
    authorName: (row.author_name as string) || "",
    authorAvatar: row.author_avatar as string | undefined,
    category: (row.category as string) || "",
    tags: (row.tags as string[]) || [],
    status: row.status as "draft" | "published" | "archived",
    publishedAt: row.published_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    readingTime: (row.reading_time as number) || 1,
    viewCount: (row.view_count as number) || 0,
  };
}

export default function ArticleManager({ userRole, userId, userName, userAvatar, userTier }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const limits = getTierLimits(userTier || 'professional-basic');
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(EMPTY_FORM);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [inlineImageDialog, setInlineImageDialog] = useState(false);
  const [inlineImageFile, setInlineImageFile] = useState<File | null>(null);
  const [inlineImageAlt, setInlineImageAlt] = useState("");
  const [inlineImagePreview, setInlineImagePreview] = useState<string | null>(null);
  const [inlineImageUploading, setInlineImageUploading] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [newTag, setNewTag] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadArticles(); }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Filter by author for non-admin users
      if (userRole !== "admin" && userId) {
        query = query.eq("author_id", userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setArticles((data || []).map(mapRow));
    } catch (err: unknown) {
      console.error("Load articles error:", err);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    const matchCat = filterCategory === "all" || a.category === filterCategory;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedArticles = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus]);

  const startCreate = () => {
    setFormData(EMPTY_FORM);
    setFeaturedImagePreview(null);
    setEditingArticle(null);
    setViewMode("create");
  };

  const startEdit = (article: Article) => {
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || "",
      category: article.category,
      tags: article.tags,
      status: article.status === "archived" ? "draft" : article.status,
      featuredImage: article.featuredImage,
    });
    setFeaturedImagePreview(article.featuredImage || null);
    setEditingArticle(article);
    setViewMode("edit");
  };

  const startView = (article: Article) => {
    setViewingArticle(article);
    setViewMode("view");
  };

  const goToList = () => {
    setViewMode("list");
    setEditingArticle(null);
    setViewingArticle(null);
    setFormData(EMPTY_FORM);
    setFeaturedImagePreview(null);
  };

  const handleSave = async () => {
    const title = formData.title.trim();
    const content = contentRef.current ? contentRef.current.innerHTML : formData.content;
    if (!title) { toast.error("Title is required"); return; }
    if (!content || content.replace(/<[^>]*>/g, "").trim() === "") { toast.error("Content is required"); return; }
    if (!formData.category) { toast.error("Category is required"); return; }

    if (userRole === "user" && !limits.canAddArticles) {
      toast.error("Article publishing is a Pro feature. Please upgrade to add articles.");
      return;
    }

    if (
      !editingArticle &&
      userRole === "user" &&
      typeof limits.articleLimit === "number" &&
      articles.length >= limits.articleLimit
    ) {
      toast.error(`You have reached your ${limits.articleLimit}-article limit. Please upgrade for more articles.`);
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const slug = editingArticle ? editingArticle.slug : `${slugify(title)}-${Date.now()}`;
      const rt = readingTime(content);

      const payload = {
        title,
        slug,
        content,
        excerpt: formData.excerpt || "",
        featured_image: typeof formData.featuredImage === "string" ? formData.featuredImage : null,
        meta_title: formData.metaTitle || null,
        meta_description: formData.metaDescription || null,
        author_id: userId,
        author_name: userName,
        author_avatar: userAvatar || null,
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        published_at: formData.status === "published" ? (editingArticle?.publishedAt || now) : null,
        reading_time: rt,
        updated_at: now,
      };

      if (editingArticle) {
        const { error } = await supabase.from("articles").update(payload).eq("id", editingArticle.id);
        if (error) throw error;
        toast.success("Article updated successfully");
      } else {
        const { error } = await supabase.from("articles").insert({ ...payload, created_at: now, view_count: 0 });
        if (error) throw error;
        toast.success("Article created successfully");
      }

      await loadArticles();
      goToList();
    } catch (err: unknown) {
      console.error("Save article error:", err);
      toast.error("Failed to save article. Make sure the articles table exists in Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("articles").delete().eq("id", articleToDelete.id);
      if (error) throw error;
      toast.success("Article deleted");
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      await loadArticles();
      if (viewMode === "view") goToList();
    } catch (err: unknown) {
      console.error("Delete error:", err);
      toast.error("Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch("/api/upload-article-image", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setFeaturedUploading(true);
    try {
      const url = await uploadToStorage(file, "featured");
      setFeaturedImagePreview(url);
      setFormData((prev) => ({ ...prev, featuredImage: url }));
      toast.success("Featured image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Make sure the article-images bucket exists in Supabase.");
    } finally {
      setFeaturedUploading(false);
    }
  };

  const execFormat = (cmd: string, value?: string) => {
    contentRef.current?.focus();
    document.execCommand(cmd, false, value);
    if (contentRef.current) setFormData((p) => ({ ...p, content: contentRef.current!.innerHTML }));
  };

  const saveCaretRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0).cloneRange());
  };

  const openInlineImageDialog = () => {
    saveCaretRange();
    setInlineImageFile(null);
    setInlineImageAlt("");
    setInlineImagePreview(null);
    setInlineImageDialog(true);
  };

  const insertInlineImage = async () => {
    if (!inlineImageFile) { toast.error("Please select an image"); return; }
    setInlineImageUploading(true);
    try {
      const url = await uploadToStorage(inlineImageFile, "content");
      contentRef.current?.focus();
      if (savedRange) {
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(savedRange); }
      }
      const alt = inlineImageAlt.trim() || inlineImageFile.name;
      const caption = inlineImageAlt.trim() ? `<figcaption style="font-size:0.85em;color:#666;margin-top:0.4em;text-align:center">${inlineImageAlt.trim()}</figcaption>` : "";
      const html = `<figure style="margin:1.5em 0;text-align:center"><img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:6px;display:inline-block" />${caption}</figure><p><br></p>`;
      document.execCommand("insertHTML", false, html);
      if (contentRef.current) setFormData((p) => ({ ...p, content: contentRef.current!.innerHTML }));
      toast.success("Image inserted");
      setInlineImageDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Check article-images bucket in Supabase.");
    } finally {
      setInlineImageUploading(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "published") return <Badge className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
    if (status === "draft") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Archived</Badge>;
  };

  // ─── VIEW: Article Detail ────────────────────────────────────────────────────
  if (viewMode === "view" && viewingArticle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Articles
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => startEdit(viewingArticle)}>
              <Edit className="h-4 w-4 mr-2" />Edit
            </Button>
            <Button variant="destructive" onClick={() => { setArticleToDelete(viewingArticle); setDeleteDialogOpen(true); }}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </Button>
          </div>
        </div>

        <Card className="p-8 border-gray-200">
          {viewingArticle.featuredImage && (
            <img src={viewingArticle.featuredImage} alt={viewingArticle.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {statusBadge(viewingArticle.status)}
            <Badge variant="outline">{viewingArticle.category}</Badge>
            <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{viewingArticle.readingTime} min read</span>
            <span className="text-sm text-gray-500 flex items-center gap-1"><Eye className="h-3 w-3" />{viewingArticle.viewCount} views</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{viewingArticle.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{viewingArticle.authorName}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(viewingArticle.createdAt).toLocaleDateString()}</span>
            {viewingArticle.publishedAt && <span className="flex items-center gap-1"><Globe className="h-4 w-4" />Published {new Date(viewingArticle.publishedAt).toLocaleDateString()}</span>}
          </div>
          {viewingArticle.excerpt && <p className="text-gray-600 italic mb-6 text-lg border-l-4 border-[#A89F91] pl-4">{viewingArticle.excerpt}</p>}
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
          {viewingArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {viewingArticle.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          )}
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Article</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete "{articleToDelete?.title}"? This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ─── VIEW: Create / Edit Form ────────────────────────────────────────────────
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Articles
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{viewMode === "edit" ? "Edit Article" : "Create New Article"}</h2>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={goToList} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#A89F91] hover:bg-[#948979] text-white">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><FileText className="h-4 w-4 mr-2" />Save Article</>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-gray-200">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="article-title" className="text-sm font-medium text-gray-700">Title *</Label>
                  <Input
                    id="article-title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title..."
                    className="mt-1 text-lg font-medium"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Excerpt / Summary</Label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description shown in article listings..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">Content *</Label>
                  {/* ── Toolbar ── */}
                  <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border border-b-0 border-gray-300 rounded-t-md">
                    <button type="button" title="Bold (Ctrl+B)" onMouseDown={(e) => { e.preventDefault(); execFormat("bold"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><Bold className="h-3.5 w-3.5" /></button>
                    <button type="button" title="Italic (Ctrl+I)" onMouseDown={(e) => { e.preventDefault(); execFormat("italic"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><Italic className="h-3.5 w-3.5" /></button>
                    <button type="button" title="Underline (Ctrl+U)" onMouseDown={(e) => { e.preventDefault(); execFormat("underline"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><Underline className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-5 bg-gray-300 mx-1" />
                    <button type="button" title="Heading 2" onMouseDown={(e) => { e.preventDefault(); execFormat("formatBlock", "h2"); }} className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 text-xs font-bold">H2</button>
                    <button type="button" title="Heading 3" onMouseDown={(e) => { e.preventDefault(); execFormat("formatBlock", "h3"); }} className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 text-xs font-bold">H3</button>
                    <button type="button" title="Paragraph" onMouseDown={(e) => { e.preventDefault(); execFormat("formatBlock", "p"); }} className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 text-xs">¶</button>
                    <span className="w-px h-5 bg-gray-300 mx-1" />
                    <button type="button" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); execFormat("insertUnorderedList"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><List className="h-3.5 w-3.5" /></button>
                    <button type="button" title="Numbered list" onMouseDown={(e) => { e.preventDefault(); execFormat("insertOrderedList"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><ListOrdered className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-5 bg-gray-300 mx-1" />
                    <button type="button" title="Align left" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyLeft"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><AlignLeft className="h-3.5 w-3.5" /></button>
                    <button type="button" title="Align center" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyCenter"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><AlignCenter className="h-3.5 w-3.5" /></button>
                    <button type="button" title="Align right" onMouseDown={(e) => { e.preventDefault(); execFormat("justifyRight"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><AlignRight className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-5 bg-gray-300 mx-1" />
                    <button type="button" title="Insert link" onMouseDown={(e) => { e.preventDefault(); const url = prompt("Enter URL (include https://)"); if (url) execFormat("createLink", url); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700"><Link className="h-3.5 w-3.5" /></button>
                    <button type="button" title="Insert image with ALT text" onMouseDown={(e) => { e.preventDefault(); openInlineImageDialog(); }} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-medium ml-1">
                      <Image className="h-3.5 w-3.5" /> Insert Image
                    </button>
                  </div>
                  {/* ── Editor ── */}
                  <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {
                      if (contentRef.current) setFormData((prev) => ({ ...prev, content: contentRef.current!.innerHTML }));
                    }}
                    onBlur={() => {
                      if (contentRef.current) setFormData((prev) => ({ ...prev, content: contentRef.current!.innerHTML }));
                    }}
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                    className="min-h-[380px] p-4 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-[#A89F91] prose prose-sm max-w-none bg-white"
                    style={{ wordBreak: "break-word" }}
                  />
                  <p className="text-xs text-gray-400 mt-1">Select text then click toolbar buttons to format. Use "Insert Image" to add images with ALT text between content.</p>

                  {/* ── Inline Image Insert Dialog ── */}
                  {inlineImageDialog && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-lg font-semibold text-gray-900">Insert Image</h3>
                          <button onClick={() => setInlineImageDialog(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                        </div>

                        {/* File picker */}
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Image File *</Label>
                          <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#A89F91] transition-colors bg-gray-50 overflow-hidden">
                            {inlineImagePreview ? (
                              <img src={inlineImagePreview} alt="preview" className="h-full w-full object-contain" />
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Click to select image</span>
                                <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP — max 10MB</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                if (f.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
                                setInlineImageFile(f);
                                const reader = new FileReader();
                                reader.onloadend = () => setInlineImagePreview(reader.result as string);
                                reader.readAsDataURL(f);
                              }}
                            />
                          </label>
                          {inlineImageFile && <p className="text-xs text-gray-500 mt-1 truncate">{inlineImageFile.name}</p>}
                        </div>

                        {/* ALT text */}
                        <div className="mb-6">
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">ALT Text / Caption</Label>
                          <Input
                            value={inlineImageAlt}
                            onChange={(e) => setInlineImageAlt(e.target.value)}
                            placeholder="Describe the image for accessibility and SEO..."
                            className="w-full"
                          />
                          <p className="text-xs text-gray-400 mt-1">This text is shown to screen readers and displayed as a caption below the image.</p>
                        </div>

                        <div className="flex gap-3 justify-end">
                          <Button variant="outline" onClick={() => setInlineImageDialog(false)} disabled={inlineImageUploading}>Cancel</Button>
                          <Button onClick={insertInlineImage} disabled={!inlineImageFile || inlineImageUploading} className="bg-[#A89F91] hover:bg-[#948979] text-white">
                            {inlineImageUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Image className="h-4 w-4 mr-2" />Insert Image</>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Meta Title</Label>
                  <Input value={formData.metaTitle || ""} onChange={(e) => setFormData((p) => ({ ...p, metaTitle: e.target.value }))} placeholder="SEO page title (defaults to article title)" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Meta Description</Label>
                  <Textarea value={formData.metaDescription || ""} onChange={(e) => setFormData((p) => ({ ...p, metaDescription: e.target.value }))} placeholder="SEO description (defaults to excerpt)" rows={2} className="mt-1" />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            <Card className="p-6 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Publish Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={formData.status} onValueChange={(v: "draft" | "published") => setFormData((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft — Not visible to public</SelectItem>
                      <SelectItem value="published">Published — Live on site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Featured Image</h3>
              {featuredImagePreview ? (
                <div className="relative">
                  <img src={featuredImagePreview} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                  <Button type="button" size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => { setFeaturedImagePreview(null); setFormData((p) => ({ ...p, featuredImage: undefined })); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : featuredUploading ? (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#A89F91] rounded-lg bg-gray-50">
                  <Loader2 className="h-8 w-8 animate-spin text-[#A89F91] mb-2" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#A89F91] transition-colors">
                  <Image className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload</span>
                  <span className="text-xs text-gray-400">Max 10MB — stored in Supabase</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </Card>

            <Card className="p-6 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Tags</h3>
              <div className="flex gap-2 mb-3">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..." className="text-sm" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newTag.trim() && !formData.tags.includes(newTag.trim())) { setFormData((p) => ({ ...p, tags: [...p.tags, newTag.trim()] })); setNewTag(""); } } }} />
                <Button type="button" size="sm" onClick={() => { if (newTag.trim() && !formData.tags.includes(newTag.trim())) { setFormData((p) => ({ ...p, tags: [...p.tags, newTag.trim()] })); setNewTag(""); } }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer flex items-center gap-1" onClick={() => setFormData((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}>
                    {tag}<X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW: List ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-gray-500 text-sm">
            {articles.length} total articles
            {userRole === "user" && typeof limits.articleLimit === "number" && (
              <span className="ml-2 text-xs text-muted-foreground">(Pro limit: {limits.articleLimit})</span>
            )}
          </p>
        </div>
        {userRole === "admin" || limits.canAddArticles ? (
          <Button
            onClick={startCreate}
            disabled={userRole === "user" && typeof limits.articleLimit === "number" && articles.length >= limits.articleLimit}
            className="bg-[#A89F91] hover:bg-[#948979] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />New Article
          </Button>
        ) : (
          <UpgradePrompt feature="Add Articles" message="Publish up to 5 articles with the Pro plan." currentTier={userTier} />
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Published", count: articles.filter((a) => a.status === "published").length, color: "text-green-600" },
          { label: "Drafts", count: articles.filter((a) => a.status === "draft").length, color: "text-yellow-600" },
          { label: "Archived", count: articles.filter((a) => a.status === "archived").length, color: "text-gray-500" },
        ].map((s) => (
          <Card key={s.label} className="p-4 border-gray-200 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by title, excerpt, category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Articles Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[#A89F91]" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No articles found</p>
          <p className="text-sm text-gray-400 mb-4">{articles.length === 0 ? "Create your first article to get started." : "Try adjusting your search or filters."}</p>
          {articles.length === 0 && <Button onClick={startCreate} className="bg-[#A89F91] hover:bg-[#948979] text-white"><Plus className="h-4 w-4 mr-2" />Create First Article</Button>}
        </Card>
      ) : (
        <>
        <div className="space-y-3">
          {paginatedArticles.map((article) => (
            <Card key={article.id} className="border-gray-200 hover:border-[#A89F91] transition-colors">
              <div className="flex items-center gap-4 p-4">
                {article.featuredImage ? (
                  <img src={article.featuredImage} alt={article.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
                ) : (
                  <div className="w-20 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200">
                    <FileText className="h-6 w-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{article.title}</h3>
                    {statusBadge(article.status)}
                    <Badge variant="outline" className="text-xs shrink-0">{article.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{article.excerpt || "No excerpt"}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.authorName}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingTime} min</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.viewCount} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startView(article)} title="View article">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(article)} title="Edit article">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { setArticleToDelete(article); setDeleteDialogOpen(true); }} title="Delete article">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-[#A89F91] text-white' : 'border-gray-300'}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500 ml-2">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </span>
          </div>
        )}
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{articleToDelete?.title}"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
