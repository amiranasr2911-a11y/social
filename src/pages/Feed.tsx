import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Image, Smile, Send, Search, UserPlus, Bookmark, Users, Newspaper, FileText, Loader2, Globe, UserCheck, Lock, ChevronDown } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { postsApi, usersApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import PostCard from "../components/feed/PostCard";
import ShareDialog from "../components/feed/ShareDialog";

type FeedFilter = "community" | "my_posts" | "saved";

const sidebarItems: { label: string; icon: any; filter: FeedFilter }[] = [
  { label: "Community", icon: Users, filter: "community" },
  { label: "My Posts", icon: FileText, filter: "my_posts" },
  { label: "Saved", icon: Bookmark, filter: "saved" },
];

const Feed = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("community");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      if (activeFilter === "my_posts") {
        if (user?._id) {
          const data = await usersApi.getUserPosts(user._id);
          setPosts(data.posts || []);
        } else {
          setPosts([]);
        }
      } else if (activeFilter === "saved") {
        const data = await usersApi.getBookmarks();
        setPosts(data.bookmarks || []);
      } else {
        const data = await postsApi.getAll();
        setPosts(data.posts || []);
      }
    } catch {
      // silent
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await usersApi.getSuggestions(10);
      setSuggestions(data.suggestions || []);
    } catch {
      // silent
    }
  };

  const handlePost = async () => {
    if (!postText.trim() && !postImage) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("body", postText);
      if (postImage) formData.append("image", postImage);
      await postsApi.create(formData);
      setPostText("");
      setPostImage(null);
      toast({ title: " " });
      fetchPosts();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const [sharePost, setSharePost] = useState<any>(null);

  const handleShare = async (postId: string, body: string) => {
    try {
      await postsApi.share(postId, body);
      toast({ title: "" });
      fetchPosts();
    } catch (err: any) {
      toast({ title: "", description: err.message, variant: "destructive" });
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await usersApi.followUnfollow(userId);
      setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeFilter === item.filter;
            return (
              <button
                key={item.label}
                onClick={() => setActiveFilter(item.filter)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            );
          })}
          </div>
        </aside>

        {/* Center Feed */}
        <div className="space-y-4 max-w-[600px] mx-auto w-full">
          {/* Post Composer */}
          <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photo || ""} />
                <AvatarFallback className="gradient-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-foreground">{user?.name || "User"}</p>
                <div className="relative">
                  <button
                    onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                    className="flex items-center gap-1.5 text-xs bg-muted rounded-lg px-2.5 py-1 text-muted-foreground hover:bg-accent transition-colors"
                  >
                    {visibility === "public" && <Globe size={12} className="text-primary" />}
                    {visibility === "friends" && <UserCheck size={12} className="text-primary" />}
                    {visibility === "only_me" && <Lock size={12} className="text-primary" />}
                    {visibility === "public" ? "Public" : visibility === "friends" ? "Followers" : "Only Me"}
                    <ChevronDown size={12} />
                  </button>
                  {showVisibilityMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowVisibilityMenu(false)} />
                      <div className="absolute left-0 top-full mt-1 w-40 bg-card rounded-xl shadow-card-hover border z-50 py-1.5">
                        {[
                          { value: "public", label: "Public", icon: Globe },
                          { value: "friends", label: "Followers", icon: UserCheck },
                          { value: "only_me", label: "Only Me", icon: Lock },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setVisibility(opt.value); setShowVisibilityMenu(false); }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm w-full transition-colors ${
                              visibility === opt.value ? "text-primary bg-accent" : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <opt.icon size={14} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "User"}?`}
              className="w-full min-h-[100px] bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none resize-y text-sm focus:border-primary transition-colors"
            />

            {postImage && (
              <div className="relative">
                <img src={URL.createObjectURL(postImage)} alt="preview" className="max-h-48 rounded-xl object-cover" />
                <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-card rounded-full w-6 h-6 text-xs font-bold shadow">✕</button>
              </div>
            )}

            <div className="border-t pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted cursor-pointer">
                  <Image size={18} className="text-green-600" />
                  Photo/video
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPostImage(e.target.files?.[0] || null)} />
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
                  >
                    <Smile size={18} className="text-amber-500" />
                    Feeling/activity
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-50">
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) => {
                          setPostText((prev) => prev + emoji.native);
                        }}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="search"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button variant="post" size="sm" className="px-6" onClick={handlePost} disabled={posting}>
                {posting ? <Loader2 className="animate-spin" size={14} /> : <>Post <Send size={14} /></>}
              </Button>
            </div>
          </div>

          {/* Posts */}
          {loadingPosts ? (
            <div className="bg-card rounded-2xl shadow-card p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-primary" size={28} />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-card p-12 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first one to publish.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={fetchPosts}
                onShareClick={(p) => setSharePost(p)}
              />
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
          <div className="bg-card rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-foreground" />
              <h3 className="font-bold text-foreground">Suggested Friends</h3>
              <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                {suggestions.filter((f: any) => f.name?.toLowerCase().includes(searchQuery.toLowerCase())).length}
              </span>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No suggestions</p>
              ) : (
                suggestions
                  .filter((f: any) => f.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5).map((friend: any) => (
                  <div key={friend._id} className="bg-muted/50 border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <Link to={`/user/${friend._id}`}>
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={friend.photo || ""} />
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                            {friend.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/user/${friend._id}`} className="text-sm font-semibold text-foreground truncate block hover:text-primary transition-colors">{friend.name}</Link>
                        <p className="text-xs text-muted-foreground">route user</p>
                      </div>
                      <Button variant="follow" size="sm" className="shrink-0 text-xs h-8" onClick={() => handleFollow(friend._id)}>
                        <UserPlus size={14} />
                        Follow
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                        {friend.followersCount || 0} followers
                      </span>
                      {(friend.mutualFollowersCount || 0) > 0 && (
                        <span className="inline-block text-xs text-primary bg-accent px-2.5 py-1 rounded-full font-medium">
                          {friend.mutualFollowersCount} mutual
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {suggestions.length > 0 && (
              <Link
                to="/suggestions"
                className="block mt-4 text-center py-2.5 text-sm font-medium text-muted-foreground bg-muted hover:bg-accent rounded-xl transition-colors border border-border"
              >
                View more
              </Link>
            )}
          </div>
          </div>
        </aside>
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

export default Feed;
