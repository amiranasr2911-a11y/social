import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Search, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { usersApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";

const PAGE_SIZE = 10;

const Suggestions = () => {
  const { toast } = useToast();
  const [allSuggestions, setAllSuggestions] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const data = await usersApi.getSuggestions(50);
      setAllSuggestions(data.suggestions || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const data = await usersApi.searchUsers(q, 30);
      setSearchResults(data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  const handleFollow = async (userId: string) => {
    try {
      await usersApi.followUnfollow(userId);
      setFollowed((prev) => new Set(prev).add(userId));
      toast({ title: "Following successfully." });
    } catch {
      toast({ title: "Something went wrong.", variant: "destructive" });
    }
  };

  const isSearchMode = searchQuery.trim().length > 0;
  const suggestions = allSuggestions.slice(0, visibleCount);
  const displayList = isSearchMode ? searchResults : suggestions;
  const hasMore = !isSearchMode && visibleCount < allSuggestions.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        to="/feed"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={22} className="text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">
            {isSearchMode ? "Search Results" : "Suggested Friends"}
          </h1>
          {!searching && (
            <span className="ml-auto text-sm bg-muted text-muted-foreground rounded-full px-3 py-1 font-semibold">
              {isSearchMode ? searchResults.length : allSuggestions.length} people
            </span>
          )}
        </div>

        {/* Search input */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          {searching && (
            <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          )}
          <input
            type="text"
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
          />
        </div>

        {/* States */}
        {loading && !isSearchMode ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-primary" size={28} />
          </div>
        ) : searching ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-primary" size={28} />
            <p className="text-sm text-muted-foreground mt-3">Searching...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {isSearchMode ? "No users found." : "No suggestions available."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayList.map((friend) => {
                const isFollowed = followed.has(friend._id);
                return (
                  <div
                    key={friend._id}
                    className="bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-4"
                  >
                    <Link to={`/user/${friend._id}`}>
                      <Avatar className="h-14 w-14 shrink-0">
                        <AvatarImage src={friend.photo || undefined} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                          {friend.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/user/${friend._id}`}
                        className="text-sm font-semibold text-foreground truncate block hover:text-primary transition-colors"
                      >
                        {friend.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {friend.username ? `@${friend.username}` : "route user"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-primary bg-accent px-2.5 py-0.5 rounded-full font-medium">
                          {friend.followersCount || 0} followers
                        </span>
                        {(friend.mutualFollowersCount || 0) > 0 && (
                          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium">
                            {friend.mutualFollowersCount} mutual
                          </span>
                        )}
                      </div>
                    </div>

                    {isFollowed ? (
                      <Button variant="outline" size="sm" className="shrink-0 text-xs h-9 gap-1.5" disabled>
                        <UserCheck size={14} />
                        Following
                      </Button>
                    ) : (
                      <Button
                        variant="follow"
                        size="sm"
                        className="shrink-0 text-xs h-9 gap-1.5"
                        onClick={() => handleFollow(friend._id)}
                      >
                        <UserPlus size={14} />
                        Follow
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load more button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="px-8"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                >
                  Load more ({allSuggestions.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Suggestions;