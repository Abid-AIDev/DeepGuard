import { useState, useCallback } from "react";
import { Upload, Link, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File | string) => void;
  isLoading?: boolean;
}

export const ImageUpload = ({ onImageSelect, isLoading }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      setPreview(urlInput);
      onImageSelect(urlInput);
      setShowUrlInput(false);
    }
  }, [urlInput, onImageSelect]);

  const handleClear = useCallback(() => {
    setPreview(null);
    setUrlInput("");
  }, []);

  if (preview) {
    return (
      <div className="relative border border-border bg-card rounded-lg p-4 shadow-md">
        <button 
          onClick={handleClear}
          className="absolute -right-3 -top-3 z-10 border border-border bg-background rounded-md p-1 shadow-xs transition-all hover:shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-full w-full object-contain"
          />
        </div>
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={() => onImageSelect(preview)} 
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin border-2 border-primary-foreground border-t-transparent" />
                Analyzing...
              </span>
            ) : (
              "Verify Image"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-card p-8 transition-all",
          isDragging && "border-solid bg-accent shadow-md",
          "hover:bg-accent"
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="pointer-events-none flex flex-col items-center gap-4">
          <div className="border border-border bg-background rounded-lg p-4 shadow-sm">
            <Upload className="h-10 w-10" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tracking-wide">
              Drop image here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>PNG, JPG, WEBP up to 20MB</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-bold uppercase text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            className="flex-1"
          />
          <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
            Load
          </Button>
          <Button variant="outline" onClick={() => setShowUrlInput(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setShowUrlInput(true)}
          className="w-full"
        >
          <Link className="mr-2 h-4 w-4" />
          Paste Image URL
        </Button>
      )}
    </div>
  );
};
