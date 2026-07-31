import { useState, useCallback } from "react";
import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload as UploadIcon, 
  FileVideo, 
  X, 
  Sparkles, 
  Hash, 
  FileText,
  Youtube,
  Instagram,
  Clock,
  Wand2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-youtube/20 text-youtube border-youtube/30" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-instagram/20 text-instagram border-instagram/30" },
  { id: "tiktok", name: "TikTok", color: "bg-tiktok/20 text-tiktok border-tiktok/30" },
  { id: "linkedin", name: "LinkedIn", color: "bg-linkedin/20 text-linkedin border-linkedin/30" },
];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["youtube", "instagram"]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Upload Content</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Upload your video and let AI optimize it for all platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upload Zone */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Video Upload</h3>
              
              {!uploadedFile ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer",
                    dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
                  />
                  <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <UploadIcon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium mb-1">Drop your video here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, AVI up to 2GB</p>
                </div>
              ) : (
                <div className="rounded-xl bg-secondary/30 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                      <FileVideo className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUploadedFile(null);
                        setGenerated(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-display text-base md:text-lg font-semibold mb-4">Publish To</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                      selectedPlatforms.includes(platform.id)
                        ? platform.color + " border-2"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    {platform.icon ? (
                      <platform.icon className="h-5 w-5" />
                    ) : (
                      <span className="h-5 w-5 flex items-center justify-center text-sm font-bold">
                        {platform.name[0]}
                      </span>
                    )}
                    <span className="font-medium text-sm">{platform.name}</span>
                    {selectedPlatforms.includes(platform.id) && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Schedule</h3>
              <div className="flex items-center gap-4">
                <Button variant="secondary" className="flex-1 gap-2">
                  <Clock className="h-4 w-4" />
                  Publish Now
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>

          {/* AI Content Generation */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">AI Content Generation</h3>
                <Button 
                  variant="gradient" 
                  size="sm" 
                  onClick={handleGenerate}
                  disabled={!uploadedFile || generating}
                >
                  {generating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Title
                  </Label>
                  <Input 
                    placeholder="Enter video title..."
                    defaultValue={generated ? "10 Tips for Better Content Creation in 2024" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Description
                  </Label>
                  <textarea
                    className="w-full min-h-[120px] rounded-lg bg-secondary/50 border border-border p-3 text-sm resize-none focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="AI will generate an optimized description..."
                    defaultValue={generated ? "In this video, I share my top 10 tips for creating better content that engages your audience and grows your following. From planning to editing, these strategies will transform your content game! 🚀\n\n⏱ Timestamps:\n0:00 - Introduction\n1:30 - Tip 1: Know Your Audience\n..." : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-emerald-400" />
                    Tags & Hashtags
                  </Label>
                  <div className="rounded-lg bg-secondary/50 border border-border p-3">
                    {generated ? (
                      <div className="flex flex-wrap gap-2">
                        {["contentcreation", "youtube", "socialmedia", "creator", "tips", "2024", "growth", "viral"].map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tags will be generated based on your video content...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Reels */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-instagram/20 to-accent/20 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-instagram" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Auto-Generate Reels</h3>
                  <p className="text-sm text-muted-foreground">AI will create short clips from your video</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled={!uploadedFile}>
                Generate 3 Reels
              </Button>
            </div>

            {/* Publish */}
            <Button variant="gradient" size="lg" className="w-full" disabled={!uploadedFile}>
              <UploadIcon className="h-5 w-5" />
              Publish to {selectedPlatforms.length} Platforms
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

