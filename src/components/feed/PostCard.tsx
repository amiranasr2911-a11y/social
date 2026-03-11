import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, Share2, Send, Loader2, Bookmark, BookmarkCheck, Image as ImageIcon, Smile, Reply, X, Repeat2, MoreHorizontal, Users, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../.././components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { postsApi } from "../../lib/api";
import { useAuth } from "../.././context/AuthContext";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

// =============================================
// Shared Post Embed Component
// =============================================
const SharedPostEmbed = ({ sharedPost }: { sharedPost: any }) => {
  if (!sharedPost) return null;
  return (
    <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-2 mt-1">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={sharedPost.user?.photo || undefined} />
          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
            {sharedPost.user?.name?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{sharedPost.user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {sharedPost.createdAt
              ? formatDistanceToNow(new Date(sharedPost.createdAt), { addSuffix: true })
              : ""}
          </p>
        </div>
      </div>
      {sharedPost.body && (
        <p className="text-sm text-foreground">{sharedPost.body}</p>
      )}
      {sharedPost.image && (
        <img
          src={sharedPost.image}
          alt="shared post"
          className="w-full rounded-lg max-h-60 object-cover"
        />
      )}
    </div>
  );
};

// =============================================
// Comment Input Component
// =============================================
interface CommentInputProps {
  placeholder: string;
  onSubmit: (content: string, image: File | null) => Promise<void>;
  loading: boolean;
}

const CommentInput = ({ placeholder, onSubmit, loading }: CommentInputProps) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;
    await onSubmit(text, image);
    setText("");
    setImage(null);
  };

  return (
    <div className="space-y-2">
      <div className="bg-muted rounded-xl border border-border focus-within:border-primary transition-colors">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 pt-2.5 pb-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {image && (
          <div className="px-3 pb-1 relative inline-block">
            <img src={URL.createObjectURL(image)} alt="preview" className="h-16 rounded-lg object-cover" />
            <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 bg-card rounded-full w-5 h-5 text-xs shadow border border-border flex items-center justify-center">
              <X size={10} />
            </button>
          </div>
        )}
        <div className="flex items-center justify-between px-2 pb-1.5">
          <div className="flex items-center gap-1">
            <button onClick={() => fileRef.current?.click()} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
              <ImageIcon size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
                <Smile size={16} />
              </button>
              {showEmoji && (
                <div className="absolute bottom-full left-0 mb-1 z-50">
                  <Picker data={data} onEmojiSelect={(emoji: any) => { setText((p) => p + emoji.native); setShowEmoji(false); }} theme="light" previewPosition="none" skinTonePosition="search" />
                </div>
              )}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading || (!text.trim() && !image)} className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// PostCard Component
// =============================================
interface PostCardProps {
  post: any;
  onPostUpdated: () => void;
  onShareClick: (post: any) => void;
  defaultShowComments?: boolean;
}

const PostCard = ({ post, onPostUpdated, onShareClick, defaultShowComments = false }: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [showMenu, setShowMenu] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likesList, setLikesList] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.body || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [commentsToShow, setCommentsToShow] = useState(3);

  const isLiked = post.likes?.includes(user?._id);

  useEffect(() => {
    if (defaultShowComments) {
      setLoadingComments(true);
      postsApi.getComments(post._id).then((data) => {
        setComments(data.comments || []);
      }).catch(() => {}).finally(() => setLoadingComments(false));
    }
  }, [defaultShowComments, post._id]);

  const handleShowLikes = async () => {
    setShowLikes(true);
    setLoadingLikes(true);
    try {
      const data = await postsApi.getLikes(post._id);
      setLikesList(data.likes || []);
    } catch {} finally { setLoadingLikes(false); }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try { await postsApi.like(post._id); onPostUpdated(); } catch {} finally { setLiking(false); }
  };

  const handleBookmark = async () => {
    if (bookmarking) return;
    setBookmarking(true);
    try { await postsApi.bookmark(post._id); onPostUpdated(); } catch {} finally { setBookmarking(false); }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const data = await postsApi.getComments(post._id);
        setComments(data.comments || []);
      } catch {}
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (content: string, image: File | null) => {
    setCommenting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim() || "📷");
      if (image) formData.append("image", image);
      await postsApi.addComment(post._id, formData);
      const data = await postsApi.getComments(post._id);
      setComments(data.comments || []);
      onPostUpdated();
    } catch {} finally { setCommenting(false); }
  };

  const fetchReplies = async (commentId: string) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const data = await postsApi.getReplies(post._id, commentId);
      const repliesList = Array.isArray(data) ? data : (data.replies || []);
      setReplies((prev) => ({ ...prev, [commentId]: repliesList }));
    } catch (err) {
      console.error("Fetch replies error:", err);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const [repliedComments, setRepliedComments] = useState<Set<string>>(new Set());

  const handleReply = async (commentId: string, content: string, image: File | null) => {
    setReplyLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim() || "📷");
      if (image) formData.append("image", image);
      await postsApi.replyToComment(post._id, commentId, formData);
      setRepliedComments((prev) => new Set(prev).add(commentId));
      setReplyingTo(null);
      await fetchReplies(commentId);
      const commentsData = await postsApi.getComments(post._id);
      setComments(commentsData.comments || []);
      onPostUpdated();
    } catch (err: any) {
      console.error("Reply error:", err);
    } finally { setReplyLoading(false); }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await postsApi.likeComment(post._id, commentId);
      const data = await postsApi.getComments(post._id);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Like comment error:", err);
    }
  };

  const handleLikeReply = async (commentId: string, replyId: string) => {
    try {
      await postsApi.likeComment(post._id, replyId);
      await fetchReplies(commentId);
    } catch (err) {
      console.error("Like reply error:", err);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-5 space-y-3">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/user/${post.user?._id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.photo || undefined} />
              <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                {post.user?.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <p className="text-sm">
              <Link to={`/user/${post.user?._id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                {post.user?.name}
              </Link>
              {post.isShare && <span className="text-muted-foreground"> shared a post.</span>}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: false }) : ""}
              <span>·</span>
              <Users size={12} />
              <span>{post.privacy === "public" ? "Public" : post.privacy === "friends" ? "Followers" : "Only Me"}</span>
            </p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 w-44 bg-card rounded-xl shadow-card-hover border z-50 py-1.5">
                <button
                  onClick={() => { handleBookmark(); setShowMenu(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors w-full"
                >
                  {post.bookmarked ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
                  {post.bookmarked ? "Unsave post" : "Save post"}
                </button>
                {post.user?._id === user?._id && (
                  <>
                    <button
                      onClick={() => { setShowMenu(false); setEditing(true); setEditText(post.body || ""); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors w-full"
                    >
                      <Pencil size={16} />
                      Edit post
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full"
                    >
                      <Trash2 size={16} />
                      Delete post
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Saved badge */}
      {post.bookmarked && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-accent px-2.5 py-1 rounded-full">
          <Bookmark size={12} /> Saved
        </span>
      )}

      {/* Post Body */}
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-y min-h-[80px]"
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditing(false)} className="px-5 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  const formData = new FormData();
                  formData.append("body", editText);
                  await postsApi.update(post._id, formData);
                  setEditing(false);
                  onPostUpdated();
                } catch {} finally { setSaving(false); }
              }}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Caption / body */}
          {post.body && <p className="text-sm text-foreground">{post.body}</p>}

          {/* ✅ Shared post embed */}
          {post.isShare && post.sharedPost && (
            <SharedPostEmbed sharedPost={post.sharedPost} />
          )}

          {/* Regular post image (not shared) */}
          {!post.isShare && post.image && (
            <img src={post.image} alt="post" className="w-full rounded-xl object-cover max-h-96" />
          )}
        </>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <button onClick={handleShowLikes} className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <ThumbsUp size={10} className="text-primary-foreground" fill="currentColor" />
          </span>
          <span>{post.likesCount || post.likes?.length || 0} likes</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => onShareClick(post)} className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
            <Repeat2 size={14} /> {post.sharesCount || 0} shares
          </button>
          <button onClick={toggleComments} className="hover:text-foreground transition-colors cursor-pointer">
            {post.commentsCount || post.comments?.length || 0} comments
          </button>
          <Link to={`/post/${post._id}`} className="text-primary font-medium hover:underline text-xs">View details</Link>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t pt-2 grid grid-cols-3">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isLiked ? "text-primary bg-accent" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
          {liking ? <Loader2 size={14} className="animate-spin" /> : "Like"}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          onClick={() => onShareClick(post)}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Top Comment preview */}
      {!showComments && post.topComment && (
        <div className="border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Top Comment</p>
          <div className="flex gap-3 items-start">
            <Link to={`/user/${post.topComment.commentCreator?._id}`}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.topComment.commentCreator?.photo || undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {post.topComment.commentCreator?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link to={`/user/${post.topComment.commentCreator?._id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                {post.topComment.commentCreator?.name}
              </Link>
              <p className="text-sm text-foreground">{post.topComment.content}</p>
            </div>
          </div>
          {(post.commentsCount || 0) > 1 && (
            <button onClick={toggleComments} className="text-sm font-medium text-primary hover:underline">
              View all comments
            </button>
          )}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Comments</span>
              <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {comments.length}
              </span>
            </div>
          </div>

          {loadingComments ? (
            <div className="text-center py-3">
              <Loader2 className="animate-spin mx-auto text-muted-foreground" size={20} />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
          ) : (
            comments.slice(0, commentsToShow).map((comment: any) => (
              <div key={comment._id} className="space-y-2">
                <div className="flex gap-3">
                  <Link to={`/user/${comment.commentCreator?._id}`}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={comment.commentCreator?.photo || undefined} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {comment.commentCreator?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-muted rounded-xl px-3 py-2 inline-block max-w-full">
                      <Link to={`/user/${comment.commentCreator?._id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                        {comment.commentCreator?.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false }) : ""}
                      </p>
                      <p className="text-sm text-foreground mt-1">{comment.content}</p>
                      {comment.image && (
                        <img src={comment.image} alt="comment" className="mt-2 max-h-48 rounded-lg object-cover" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 px-1">
                      <button onClick={() => handleLikeComment(comment._id)} className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                        Like ({comment.likes?.length || 0})
                      </button>
                      {((comment.repliesCount > 0) || repliedComments.has(comment._id)) && (
                        <button
                          onClick={() => {
                            if (replies[comment._id]) {
                              setReplies((prev) => { const n = { ...prev }; delete n[comment._id]; return n; });
                            } else {
                              fetchReplies(comment._id);
                            }
                          }}
                          className="text-xs font-medium text-primary hover:underline transition-colors"
                        >
                          {replies[comment._id] ? "Hide replies" : "View replies"}
                        </button>
                      )}
                    </div>

                    {loadingReplies[comment._id] && (
                      <div className="mt-2 ml-6"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
                    )}
                    {replies[comment._id] && (
                      <div className="mt-2 ml-6 border-l-2 border-border pl-3 space-y-3">
                        {replies[comment._id].map((reply: any) => (
                          <div key={reply._id} className="flex gap-2">
                            <Link to={`/user/${reply.commentCreator?._id}`}>
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={reply.commentCreator?.photo || undefined} />
                                <AvatarFallback className="bg-accent text-accent-foreground text-[10px]">
                                  {reply.commentCreator?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1">
                              <div className="bg-muted rounded-xl px-3 py-2 inline-block max-w-full">
                                <Link to={`/user/${reply.commentCreator?._id}`} className="text-xs font-semibold text-foreground hover:text-primary">
                                  {reply.commentCreator?.name}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                  {reply.createdAt ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: false }) : ""}
                                </p>
                                <p className="text-sm text-foreground mt-1">{reply.content}</p>
                                {reply.image && (
                                  <img src={reply.image} alt="reply" className="mt-2 max-h-36 rounded-lg object-cover" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 px-1">
                                <button onClick={() => handleLikeReply(comment._id, reply._id)} className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                  Like ({reply.likes?.length || reply.likesCount || 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-1"
                      >
                        <Reply size={12} />
                        Reply
                      </button>
                    </div>
                    {replyingTo === comment._id && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground italic px-1">Replying to {comment.commentCreator?.name}</p>
                        <div className="flex gap-2">
                          <Avatar className="h-7 w-7 mt-1">
                            <AvatarImage src={user?.photo || undefined} />
                            <AvatarFallback className="bg-accent text-accent-foreground text-[10px]">
                              {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CommentInput
                              placeholder="Write a reply..."
                              onSubmit={(content, image) => handleReply(comment._id, content, image)}
                              loading={replyLoading}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {comments.length > commentsToShow && (
            <button
              onClick={() => setCommentsToShow(prev => prev + 3)}
              className="text-sm font-medium text-primary hover:underline transition-colors w-full text-center py-2"
            >
              View more comments
            </button>
          )}

          <div className="flex gap-2 pt-1">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage src={user?.photo || undefined} />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CommentInput
                placeholder={`Comment as ${user?.name || "User"}...`}
                onSubmit={handleAddComment}
                loading={commenting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Likes Dialog */}
      {showLikes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLikes(false)} />
          <div className="relative bg-card rounded-2xl shadow-card-hover w-full max-w-md mx-4 max-h-[70vh] flex flex-col z-50">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <h3 className="text-lg font-bold text-foreground">People who reacted</h3>
              </div>
              <button onClick={() => setShowLikes(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-1">
              {loadingLikes ? (
                <div className="text-center py-6"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>
              ) : likesList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No likes yet</p>
              ) : (
                likesList.map((liker: any) => (
                  <Link
                    key={liker._id}
                    to={`/user/${liker._id}`}
                    onClick={() => setShowLikes(false)}
                    className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={liker.photo || undefined} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                        {liker.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-foreground">{liker.name}</p>
                      <p className="text-xs text-muted-foreground">@{liker.username || liker.name?.toLowerCase().replace(/\s/g, "")}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-card rounded-2xl shadow-card-hover w-full max-w-md mx-4 z-50">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-foreground">Confirm action</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Delete this post?</p>
                  <p className="text-sm text-muted-foreground mt-1">This post will be permanently removed from your profile and feed.</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await postsApi.delete(post._id);
                      setShowDeleteConfirm(false);
                      navigate("/feed");
                    } catch {} finally { setDeleting(false); }
                  }}
                  disabled={deleting}
                  className="px-5 py-2.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : "Delete post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;