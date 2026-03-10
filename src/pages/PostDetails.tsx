import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { postsApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import PostCard from "../components/feed/PostCard";
import ShareDialog from "../components/feed/ShareDialog";

const PostDetails = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sharePost, setSharePost] = useState<any>(null);

  const fetchPost = async () => {
    if (!postId) return;
    try {
      const data = await postsApi.getById(postId);
      setPost(data.post || data);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleShare = async (id: string, body: string) => {
    try {
      await postsApi.share(id, body);
      toast({ title: "" });
      fetchPost();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors mb-6 px-3 py-2 rounded-xl hover:bg-muted"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {loading ? (
        <div className="bg-card rounded-2xl shadow-card p-12 text-center">
          <Loader2 className="animate-spin mx-auto text-primary" size={28} />
        </div>
      ) : !post ? (
        <div className="bg-card rounded-2xl shadow-card p-12 text-center">
          <p className="text-muted-foreground">Post not found.</p>
        </div>
      ) : (
        <PostCard
          post={post}
          onPostUpdated={fetchPost}
          onShareClick={(p) => setSharePost(p)}
          defaultShowComments
        />
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

export default PostDetails;
