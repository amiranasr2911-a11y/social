import { useState, useEffect } from "react";
import { Loader2, Bookmark } from "lucide-react";
import { usersApi } from "../lib/api";
import PostCard from "../components/feed/PostCard";
import ShareDialog from "../components/feed/ShareDialog";
import { postsApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";

const Saved = () => {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharePost, setSharePost] = useState<any>(null);

  const fetchBookmarks = async () => {
    try {
      const data = await usersApi.getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleShare = async (postId: string, body: string) => {
    try {
      await postsApi.share(postId, body);
      toast({ title: "تم المشاركة " });
      fetchBookmarks();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Saved Posts</h1>
      </div>

      {loading ? (
        <div className="bg-card rounded-2xl shadow-card p-12 text-center">
          <Loader2 className="animate-spin mx-auto text-primary" size={28} />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card p-12 text-center">
          <Bookmark size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No saved posts yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Bookmark posts to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((post: any) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={fetchBookmarks}
              onShareClick={(p) => setSharePost(p)}
            />
          ))}
        </div>
      )}

      <ShareDialog
        open={!!sharePost}
        onOpenChange={(open) => !open && setSharePost(null)}
        post={sharePost}
        onShare={handleShare}
      />
    </div>
  );
};

export default Saved;
