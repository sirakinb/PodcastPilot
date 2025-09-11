import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentInputProps {
  content: string;
  onContentChange: (content: string) => void;
}

export default function ContentInput({ content, onContentChange }: ContentInputProps) {
  const [activeTab, setActiveTab] = useState<"text" | "upload">("text");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append("document", acceptedFiles[0]);

      try {
        const response = await fetch("/api/upload-document", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();
        onContentChange(result.content);
        setActiveTab("text");
        
        toast({
          title: "Document uploaded successfully",
          description: `Extracted ${result.content.length} characters from your document.`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to process document",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <FileText className="text-primary mr-2" size={20} />
          Input Content
        </h3>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === "text"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-text-tab"
          >
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === "upload"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-upload-tab"
          >
            Upload File
          </button>
        </div>

        {/* Text Input Tab */}
        {activeTab === "text" && (
          <div className="space-y-4">
            <label htmlFor="article-content" className="block text-sm font-medium text-foreground">
              Article Content or Transcript
            </label>
            <Textarea
              id="article-content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={12}
              className="resize-none"
              placeholder="Paste your article content here... Our AI will analyze the text and generate an engaging conversation between two podcast hosts discussing the key points, insights, and implications."
              data-testid="textarea-content"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground" data-testid="text-character-count">
                {content.length} characters
              </span>
              <span className="text-muted-foreground">Recommended: 500-5,000 characters</span>
              {content.length < 100 && content.length > 0 && (
                <span className="text-destructive flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  Too short
                </span>
              )}
            </div>
          </div>
        )}

        {/* File Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Upload Document
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary hover:bg-primary/5"
              }`}
              data-testid="dropzone-upload"
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
              {isUploading ? (
                <div>
                  <p className="text-foreground font-medium mb-2">Processing document...</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse w-1/2"></div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-foreground font-medium mb-2">
                    {isDragActive ? "Drop your document here" : "Drag and drop your document here"}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Supports .docx and .txt files up to 10MB
                  </p>
                  <Button variant="outline">
                    Choose File
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
