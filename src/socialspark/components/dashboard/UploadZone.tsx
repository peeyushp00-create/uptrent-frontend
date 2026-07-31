import { Upload, Sparkles, Wand2, Hash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadZone() {
  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="font-display text-lg font-semibold mb-4">Upload & Distribute</h3>
      
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors duration-300 cursor-pointer group">
        <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <p className="text-foreground font-medium mb-1">Drop your video here</p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
        <Button variant="gradient" size="sm">
          <Upload className="h-4 w-4" />
          Select Video
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
          <Wand2 className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Auto-edit reels</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
          <Hash className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Generate tags</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
          <FileText className="h-4 w-4 text-emerald-400" />
          <span className="text-muted-foreground">AI descriptions</span>
        </div>
      </div>
    </div>
  );
}

