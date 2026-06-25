import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eye
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  editorId?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your article...", 
  height = "400px",
  editorId
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [altText, setAltText] = useState('');

  // Initialize editor content only once when mounting or when value changes externally
  useEffect(() => {
    if (editorRef.current && !isPreview && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isPreview]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current && !isPreview) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBlur = () => {
    if (editorRef.current && !isPreview) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`;
      document.execCommand('insertHTML', false, imgHtml);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      setImageUrl('');
      setAltText('');
      setShowImageDialog(false);
    }
  };

  const formatBlock = (tagName: string) => {
    execCommand('formatBlock', tagName);
  };

  const ToolbarButton = ({ 
    icon, 
    onClick, 
    title, 
    isActive = false 
  }: { 
    icon: React.ReactNode; 
    onClick: () => void; 
    title: string; 
    isActive?: boolean; 
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 p-0 ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
    >
      {icon}
    </Button>
  );

  if (isPreview) {
    return (
      <Card className="w-full">
        <div className="border-b p-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Preview</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(false)}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
        </div>
        <div 
          className="p-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ minHeight: height }}
        />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            icon={<Undo className="h-4 w-4" />}
            onClick={() => execCommand('undo')}
            title="Undo"
          />
          <ToolbarButton
            icon={<Redo className="h-4 w-4" />}
            onClick={() => execCommand('redo')}
            title="Redo"
          />
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            onClick={() => execCommand('bold')}
            title="Bold"
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            onClick={() => execCommand('italic')}
            title="Italic"
          />
          <ToolbarButton
            icon={<Underline className="h-4 w-4" />}
            onClick={() => execCommand('underline')}
            title="Underline"
          />
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            icon={<Heading1 className="h-4 w-4" />}
            onClick={() => formatBlock('h1')}
            title="Heading 1"
          />
          <ToolbarButton
            icon={<Heading2 className="h-4 w-4" />}
            onClick={() => formatBlock('h2')}
            title="Heading 2"
          />
          <ToolbarButton
            icon={<Heading3 className="h-4 w-4" />}
            onClick={() => formatBlock('h3')}
            title="Heading 3"
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            icon={<AlignLeft className="h-4 w-4" />}
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
          />
          <ToolbarButton
            icon={<AlignCenter className="h-4 w-4" />}
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
          />
          <ToolbarButton
            icon={<AlignRight className="h-4 w-4" />}
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
          />
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            icon={<Link className="h-4 w-4" />}
            onClick={() => setShowLinkDialog(true)}
            title="Insert Link"
          />
          <ToolbarButton
            icon={<Image className="h-4 w-4" />}
            onClick={() => setShowImageDialog(true)}
            title="Insert Image"
          />
          <ToolbarButton
            icon={<Quote className="h-4 w-4" />}
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Quote"
          />
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            onClick={() => execCommand('formatBlock', 'pre')}
            title="Code Block"
          />
        </div>

        {/* Preview */}
        <ToolbarButton
          icon={<Eye className="h-4 w-4" />}
          onClick={() => setIsPreview(true)}
          title="Preview"
        />
      </div>

      {/* Editor */}
      <div
        id={editorId}
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        className="p-4 min-h-[400px] focus:outline-none prose prose-sm max-w-none"
        style={{ minHeight: height }}
        suppressContentEditableWarning
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={insertLink}>
                  Insert
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Description of the image"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={insertImage}>
                  Insert
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
