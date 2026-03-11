import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, UserPlus, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { usersApi, postsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";
import PostCard from "../components/feed/PostCard";
import ShareDialog from "../components/feed/ShareDialog";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [sharePost, setSharePost] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const data = await usersApi.getUserProfile(userId!);
      const userData = data.user || data;
      setProfile(userData);
      const followers = userData.followers || [];
      setIsFollowing(
        Array.isArray(followers)
          ? followers.some((f: any) => (typeof f === "string" ? f : f?._id) === currentUser?._id)
          : false
      );
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await usersApi.getUserPosts(userId!);
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    }
  };

  const handleFollow = async () => {
    try {
      await usersApi.followUnfollow(userId!);
      const nowFollowing = !isFollowing;
      setIsFollowing(nowFollowing);

      setProfile((prev: any) => ({
        ...prev,
        followersCount: (prev?.followersCount || 0) + (nowFollowing ? 1 : -1),
      }));

      await refreshUser();

      toast({ title: nowFollowing ? "Now following this user." : "Unfollowed successfully." });
    } catch {
      toast({ title: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleShare = async (id: string, body: string) => {
    try {
      await postsApi.share(id, body);
      toast({ title: "Post shared successfully." });
      fetchPosts();
    } catch (err: any) {
      toast({ title: "Failed to share post.", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Loader2 className="animate-spin mx-auto text-primary" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center space-y-3">
        <p className="text-muted-foreground text-lg font-medium">User not found.</p>
        <p className="text-sm text-muted-foreground">This profile does not exist or may have been removed.</p>
        <Link to="/feed" className="text-primary hover:underline mt-2 inline-block text-sm">Back to feed</Link>
      </div>
    );
  }

  const initials = profile.name?.charAt(0)?.toUpperCase() || "?";
  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="px-4 py-4">
        <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Cover */}
      <div className="h-48 gradient-cover rounded-b-3xl" />

      {/* Profile header */}
      <div className="px-6 -mt-16 mb-6">
        <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col md:flex-row md:items-center gap-4">
          <Avatar className="h-28 w-28 border-4 border-card shadow-lg -mt-14 md:-mt-14">
            <AvatarImage src={profile.photo || undefined} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-3xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
            <p className="text-muted-foreground text-sm">
              @{profile.username || profile.userName || profile.name?.toLowerCase().replace(/\s/g, "")}
            </p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{profile.followersCount ?? 0}</span> followers
              </span>
              <span>
                <span className="font-semibold text-foreground">{profile.followingCount ?? 0}</span> following
              </span>
            </div>
          </div>

          {!isOwnProfile && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className="h-10 px-6 gap-2"
              onClick={handleFollow}
            >
              {isFollowing ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
            </Button>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="px-6 space-y-4 pb-8">
        {posts.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-card p-12 text-center text-muted-foreground">No posts yet.</div>
        ) : (
          posts.map((post: any) => (
            <PostCard key={post._id} post={post} onPostUpdated={fetchPosts} onShareClick={(p) => setSharePost(p)} />
          ))
        )}
      </div>

      <ShareDialog
        open={!!sharePost}
        onOpenChange={(open) => !open && setSharePost(null)}
        post={sharePost}
        onShare={handleShare}
      />
    </div>
  );
};

export default UserProfile;