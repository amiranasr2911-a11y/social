import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Mail, Users, FileText, Bookmark, Loader2, Camera, ZoomIn, ImagePlus, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersApi, postsApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import PostCard from "../components/feed/PostCard";
import ShareDialog from "../components/feed/ShareDialog";
import { Dialog, DialogContent } from "../components/ui/dialog";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharePost, setSharePost] = useState<any>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    fetchData();
    if (user?._id) {
      const savedCover = localStorage.getItem(`cover_${user._id}`);
      if (savedCover) setCoverPhoto(savedCover);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [postsData, bookmarksData] = await Promise.all([
        usersApi.getUserPosts(user._id).catch(() => ({ posts: [] })),
        usersApi.getBookmarks().catch(() => ({ bookmarks: [] })),
      ]);
      setMyPosts(postsData.posts || []);
      setBookmarks(bookmarksData.bookmarks || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      await usersApi.uploadPhoto(formData);
      await refreshUser();
      toast({ title: "" });
    } catch {
      toast({ title: "", variant: "destructive" });
    }
  };

  const handleShare = async (id: string, body: string) => {
    try {
      await postsApi.share(id, body);
      toast({ title: "" });
      fetchData();
    } catch (err: any) {
      toast({ title: "", description: err.message, variant: "destructive" });
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCoverPhoto(result);
      if (user?._id) {
        localStorage.setItem(`cover_${user._id}`, result);
      }
      toast({ title: "" });
    };
    reader.readAsDataURL(file);
  };

  const stats = [
    { label: "FOLLOWERS", value: user?.followers?.length || 0 },
    { label: "FOLLOWING", value: user?.following?.length || 0 },
    { label: "BOOKMARKS", value: bookmarks.length },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Cover Photo */}
      <div 
        className="relative h-64 md:h-80 rounded-b-3xl group overflow-hidden bg-cover bg-center bg-no-repeat transition-all"
        style={{
          backgroundImage: coverPhoto ? `url(${coverPhoto})` : undefined,
          backgroundColor: !coverPhoto ? 'hsl(var(--primary) / 0.1)' : undefined,
        }}
      >
        {!coverPhoto && <div className="absolute inset-0 gradient-cover opacity-80" />}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <label className="bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors backdrop-blur-sm">
            <ImagePlus size={16} />
            {coverPhoto ? 'Change cover' : 'Add cover'}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCoverUpload} 
            />
          </label>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="px-4 md:px-8 -mt-20 mb-6 relative z-10">
        <div className="bg-card rounded-[2rem] p-6 md:p-8 shadow-sm border flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Avatar Area */}
          <div className="relative group -mt-16 md:-mt-20 shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-card shadow-lg bg-card">
              <AvatarImage src={user?.photo || ""} className="object-cover" />
              <AvatarFallback className="gradient-primary text-primary-foreground text-4xl">{initials}</AvatarFallback>
            </Avatar>
            
            {/* Hover Actions for Avatar */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="bg-white/20 hover:bg-white/40 p-2.5 rounded-full cursor-pointer backdrop-blur-md transition-colors text-white" title="تغيير الصورة">
                <Camera size={22} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              <button 
                onClick={() => setEnlargedPhoto(true)} 
                className="bg-white/20 hover:bg-white/40 p-2.5 rounded-full cursor-pointer backdrop-blur-md transition-colors text-white" 
                title="تكبير الصورة"
              >
                <ZoomIn size={22} />
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
            <h1 className="text-3xl font-bold text-foreground">{user?.name || "User"}</h1>
            <p className="text-muted-foreground text-lg mb-3">@{user?.userName || user?.name?.toLowerCase().replace(/\s/g, "") || "user"}</p>
            <span className="inline-flex items-center gap-1.5 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full font-medium">
              <Users size={14} />
              Route Posts member
            </span>
          </div>

          {/* Stats Boxes */}
          <div className="flex gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 justify-center">
            {stats.map((s) => (
              <div key={s.label} className="bg-background border rounded-2xl p-4 md:p-5 text-center min-w-[100px] md:min-w-[120px] flex-1 md:flex-none">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-wider mb-1 uppercase">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-6">
        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          {/* About Box */}
          <div className="bg-card rounded-[2rem] border shadow-sm p-6 md:p-8">
            <h2 className="font-bold text-foreground mb-6 text-lg">About</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                {user?.email || "user@email.com"}
              </div>
              <div className="flex items-center gap-3">
                <UserCircle size={18} className="text-primary" />
                Active on Route Posts
              </div>
            </div>
          </div>

          {/* Posts & Saved Summary */}
          <div className="space-y-4">
            <div className="bg-background border rounded-[2rem] shadow-sm p-6 md:p-8 flex flex-col justify-center h-[120px]">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">MY POSTS</p>
              <p className="text-3xl font-bold text-foreground">{myPosts.length}</p>
            </div>
            <div className="bg-background border rounded-[2rem] shadow-sm p-6 md:p-8 flex flex-col justify-center h-[120px]">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">SAVED POSTS</p>
              <p className="text-3xl font-bold text-foreground">{bookmarks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={16} />
              My Posts
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "saved"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark size={16} />
              Saved
            </button>
            <div className="flex-1" />
            <span className="self-center pr-4 text-sm text-muted-foreground">
              {activeTab === "posts" ? myPosts.length : bookmarks.length}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-primary" size={28} />
            </div>
          ) : (
            <div className="divide-y">
              {(activeTab === "posts" ? myPosts : bookmarks).length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  {activeTab === "posts" ? "No posts yet." : "No saved posts."}
                </div>
              ) : (
                (activeTab === "posts" ? myPosts : bookmarks).map((post: any) => (
                  <div key={post._id} className="p-4">
                    <PostCard
                      post={post}
                      onPostUpdated={fetchData}
                      onShareClick={(p) => setSharePost(p)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <ShareDialog
        open={!!sharePost}
        onOpenChange={(open) => !open && setSharePost(null)}
        post={sharePost}
        onShare={handleShare}
      />

      <Dialog open={enlargedPhoto} onOpenChange={setEnlargedPhoto}>
        <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center">
          {user?.photo ? (
            <img 
              src={user.photo} 
              alt={user.name} 
              className="w-full h-auto rounded-lg object-contain max-h-[85vh] bg-black/50" 
            />
          ) : (
            <div className="w-64 h-64 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-7xl font-bold">
              {initials}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
