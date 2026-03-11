import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  onShare: (postId: string, body: string) => Promise<void>;
}

const ShareDialog = ({ open, onOpenChange, post, onShare }: ShareDialogProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      await onShare(post._id, text);
      setText("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something about this..."
            className="w-full min-h-[80px] bg-muted rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none border border-border focus:border-primary transition-colors"
          />

          {/* Original post preview */}
          <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.user?.photo || ""} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {post.user?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{post.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{post.user?.username || post.user?.name?.toLowerCase().replace(/\s/g, "")}
                </p>
              </div>
            </div>
            {post.body && <p className="text-sm text-foreground">{post.body}</p>}
            {post.image && (
              <img
                src={post.image}
                alt="post"
                className="w-full rounded-lg object-cover max-h-60"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={14} /> : "Share now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
