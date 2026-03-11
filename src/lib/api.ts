const BASE_URL = "https://route-posts.routemisr.com";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isLocalMode(): boolean {
  const token = getToken();
  if (!token) return false;
  return !token.includes(".");
}

function getCurrentUserEmail(): string {
  const token = getToken();
  if (!token) return "";
  try { return atob(token).split(":")[0]; }
  catch { return ""; }
}

function getCurrentUser(): any {
  const email = getCurrentUserEmail();
  const users = JSON.parse(localStorage.getItem("route_posts_users") || "[]");
  const user = users.find((u: any) => u.email === email);
  if (!user) return null;
  return { _id: email, name: user.name, email: user.email, gender: user.gender };
}

export const FAKE_USERS: Record<string, any> = {
  user_seed_1:  { _id: "user_seed_1",  name: "Ahmed Hassan",  email: "ahmed@route.com",   followersCount: 128, followingCount: 34, mutualFollowersCount: 3,  followers: [], following: [] },
  user_seed_2:  { _id: "user_seed_2",  name: "Sara Mohamed",  email: "sara@route.com",    followersCount: 74,  followingCount: 20, mutualFollowersCount: 1,  followers: [], following: [] },
  user_seed_3:  { _id: "user_seed_3",  name: "Omar Khaled",   email: "omar@route.com",    followersCount: 310, followingCount: 80, mutualFollowersCount: 5,  followers: [], following: [] },
  user_seed_4:  { _id: "user_seed_4",  name: "Nour Ali",      email: "nour@route.com",    followersCount: 56,  followingCount: 15, mutualFollowersCount: 2,  followers: [], following: [] },
  user_seed_5:  { _id: "user_seed_5",  name: "Youssef Tarek", email: "youssef@route.com", followersCount: 200, followingCount: 60, mutualFollowersCount: 0,  followers: [], following: [] },
  user_seed_6:  { _id: "user_seed_6",  name: "Menna Adel",    email: "menna@route.com",   followersCount: 95,  followingCount: 40, mutualFollowersCount: 4,  followers: [], following: [] },
  user_seed_7:  { _id: "user_seed_7",  name: "Karim Samir",   email: "karim@route.com",   followersCount: 43,  followingCount: 10, mutualFollowersCount: 1,  followers: [], following: [] },
  user_seed_8:  { _id: "user_seed_8",  name: "Dina Mahmoud",  email: "dina@route.com",    followersCount: 167, followingCount: 55, mutualFollowersCount: 6,  followers: [], following: [] },
  user_seed_9:  { _id: "user_seed_9",  name: "Tamer Hesham",  email: "tamer@route.com",   followersCount: 88,  followingCount: 25, mutualFollowersCount: 0,  followers: [], following: [] },
  user_seed_10: { _id: "user_seed_10", name: "Rana Ibrahim",  email: "rana@route.com",    followersCount: 231, followingCount: 70, mutualFollowersCount: 7,  followers: [], following: [] },
};

function getFakeUserById(userId: string): any | null {
  if (FAKE_USERS[userId]) return FAKE_USERS[userId];
  return Object.values(FAKE_USERS).find((u) => u.email === userId) || null;
}

const LOCAL_POSTS_KEY = "route_posts_local_posts";

const SEED_POSTS = [
  { _id: "seed_1",  body: "Welcome to Route Posts! A new platform to connect with friends and share your thoughts.", image: null, user: { _id: "user_seed_1", name: "Ahmed Hassan"  }, createdAt: new Date(Date.now() - 1000*60*60*2).toISOString(),   likesCount: 12, commentsCount: 3,  sharesCount: 2, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_2",  body: "Beautiful weather today! Anyone up for a walk?",                                          image: null, user: { _id: "user_seed_2", name: "Sara Mohamed"  }, createdAt: new Date(Date.now() - 1000*60*60*5).toISOString(),   likesCount: 8,  commentsCount: 1,  sharesCount: 0, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_3",  body: "If you're learning to code right now — keep going! Progress happens every day even when you can't feel it.", image: null, user: { _id: "user_seed_3", name: "Omar Khaled"  }, createdAt: new Date(Date.now() - 1000*60*60*24).toISOString(),  likesCount: 34, commentsCount: 7,  sharesCount: 5, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_4",  body: "Today's to-do list:\n Woke up early\n Worked out\n⬜Study session\n Reading time", image: null, user: { _id: "user_seed_4", name: "Nour Ali"       }, createdAt: new Date(Date.now() - 1000*60*60*36).toISOString(),  likesCount: 21, commentsCount: 4,  sharesCount: 1, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_5",  body: "What's the difference between React and Next.js?\nReact is a library. Next.js is a framework built on top of it that adds routing, SSR, and much more.", image: null, user: { _id: "user_seed_3", name: "Omar Khaled"  }, createdAt: new Date(Date.now() - 1000*60*60*48).toISOString(),  likesCount: 45, commentsCount: 12, sharesCount: 8, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_6",  body: "Just finished reading Atomic Habits. Highly recommend it to anyone trying to build better habits!", image: null, user: { _id: "user_seed_6", name: "Menna Adel"    }, createdAt: new Date(Date.now() - 1000*60*60*60).toISOString(),  likesCount: 18, commentsCount: 2,  sharesCount: 3, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_7",  body: "Reminder: drink water, take breaks, and get some sleep. Your productivity depends on it.", image: null, user: { _id: "user_seed_10",name: "Rana Ibrahim" }, createdAt: new Date(Date.now() - 1000*60*60*72).toISOString(),  likesCount: 63, commentsCount: 9,  sharesCount: 12,likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_8",  body: "Just deployed my first full-stack app! Months of learning finally paying off.",             image: null, user: { _id: "user_seed_5", name: "Youssef Tarek"}, createdAt: new Date(Date.now() - 1000*60*60*80).toISOString(),  likesCount: 77, commentsCount: 15, sharesCount: 9, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_9",  body: "Morning run done. 5km in 28 minutes. Small wins every day.",                               image: null, user: { _id: "user_seed_7", name: "Karim Samir"  }, createdAt: new Date(Date.now() - 1000*60*60*90).toISOString(),  likesCount: 29, commentsCount: 5,  sharesCount: 2, likes: [], isLiked: false, isBookmarked: false, comments: [] },
  { _id: "seed_10", body: "Anyone else feel like TypeScript saves hours of debugging? Can't imagine going back to plain JS.", image: null, user: { _id: "user_seed_8", name: "Dina Mahmoud" }, createdAt: new Date(Date.now() - 1000*60*60*100).toISOString(), likesCount: 52, commentsCount: 8,  sharesCount: 6, likes: [], isLiked: false, isBookmarked: false, comments: [] },
];

function ensureSeedPosts() {
  try {
    const existing: any[] = JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || "[]");
    const existingIds = new Set(existing.map((p: any) => p._id));
    const missing = SEED_POSTS.filter((p) => !existingIds.has(p._id));
    if (missing.length === 0) return;
    const userPosts = existing.filter((p: any) => !p._id.startsWith("seed_"));
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify([...userPosts, ...missing]));
  } catch {
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(SEED_POSTS));
  }
}

export function seedFakePosts() { ensureSeedPosts(); }

function getPosts(): any[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || "[]"); }
  catch { return []; }
}

function savePosts(posts: any[]) {
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
}

function createLocalPost(body: string, image?: string): any {
  const user = getCurrentUser();
  const post = {
    _id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    body, image: image || null, user,
    createdAt: new Date().toISOString(),
    likesCount: 0, commentsCount: 0, sharesCount: 0,
    likes: [], isLiked: false, isBookmarked: false, comments: [],
  };
  const posts = getPosts();
  posts.unshift(post);
  savePosts(posts);
  return post;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.token = token;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(json.message || json.error || "Something went wrong");
  return (json.data ?? json) as T;
}

export const authApi = {
  signup: (body: { name: string; email: string; password: string; rePassword: string; dateOfBirth: string; gender: string }) =>
    request<{ token: string; user: any }>("/users/signup", { method: "POST", body: JSON.stringify(body) }),
  signin: (body: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/users/signin", { method: "POST", body: JSON.stringify(body) }),
  changePassword: (body: { password: string; newPassword: string }) =>
    request<{ message: string }>("/users/change-password", { method: "PATCH", body: JSON.stringify(body) }),
};

export const usersApi = {
  getMyProfile: () => request<{ user: any }>("/users/profile-data"),

  getUserProfile: async (userId: string) => {
    if (isLocalMode()) {
      const fakeUser = getFakeUserById(userId);
      if (fakeUser) return { user: fakeUser };
      const myEmail = getCurrentUserEmail();
      if (userId === myEmail) {
        const me = getCurrentUser();
        if (me) return { user: { ...me, followersCount: 0, followingCount: 0, followers: [], following: [] } };
      }
      const storedUsers = JSON.parse(localStorage.getItem("route_posts_users") || "[]");
      const found = storedUsers.find((u: any) => u.email === userId);
      if (found) return { user: { _id: found.email, name: found.name, email: found.email, followersCount: 0, followingCount: 0, followers: [], following: [] } };
      throw new Error("User not found");
    }
    return request<{ user: any }>(`/users/${userId}/profile`);
  },

  uploadPhoto: async (formData: FormData) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${BASE_URL}/users/upload-photo`, { method: "PUT", headers: { token }, body: formData });
    const json = await res.json();
    if (!res.ok || json.success === false) throw new Error(json.message || "Upload failed");
    return json.data ?? json;
  },

  getSuggestions: async (limit = 10) => {
    if (isLocalMode()) {
      const myEmail = getCurrentUserEmail();
      const suggestions = Object.values(FAKE_USERS).filter((u) => u.email !== myEmail).slice(0, limit);
      return { suggestions };
    }
    return request<{ suggestions: any[] }>(`/users/suggestions?limit=${limit}`);
  },

  searchUsers: async (query: string, limit = 20) => {
    if (isLocalMode()) {
      const q = query.toLowerCase().trim();
      const myEmail = getCurrentUserEmail();
      const results = Object.values(FAKE_USERS).filter((u) => u.email !== myEmail && u.name.toLowerCase().includes(q)).slice(0, limit);
      return { users: results };
    }
    return request<{ users: any[] }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  getBookmarks: async () => {
    if (isLocalMode()) return { bookmarks: getPosts().filter((p: any) => p.isBookmarked) };
    return request<{ bookmarks: any[] }>("/users/bookmarks");
  },

  followUnfollow: async (userId: string) => {
    if (isLocalMode()) return { message: "Done" };
    return request<{ message: string }>(`/users/${userId}/follow`, { method: "PUT" });
  },

  getUserPosts: async (userId: string) => {
    if (isLocalMode()) {
      ensureSeedPosts();
      const myEmail = getCurrentUserEmail();
      const targetId = userId === myEmail ? myEmail : userId;
      return { posts: getPosts().filter((p: any) => p.user?._id === targetId) };
    }
    return request<{ posts: any[] }>(`/users/${userId}/posts`);
  },
};

export const postsApi = {
  getAll: async (page = 1, limit = 20) => {
    if (isLocalMode()) {
      ensureSeedPosts();
      const all = getPosts();
      return { posts: all.slice((page - 1) * limit, page * limit), total: all.length };
    }
    return request<{ posts: any[]; total?: number; paginationInfo?: any }>(`/posts?page=${page}&limit=${limit}`);
  },

  getFeed: async (limit = 10) => {
    if (isLocalMode()) { ensureSeedPosts(); return { posts: getPosts().slice(0, limit) }; }
    return request<{ posts: any[] }>(`/posts/feed?only=following&limit=${limit}`);
  },

  create: async (formData: FormData) => {
    if (isLocalMode()) {
      const body = formData.get("body") as string || "";
      const imageFile = formData.get("image") as File | null;
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }
      return { post: createLocalPost(body, imageUrl), success: true };
    }
    const token = getToken();
    const res = await fetch(`${BASE_URL}/posts`, { method: "POST", headers: token ? { token } : {}, body: formData });
    const json = await res.json();
    if (!res.ok || json.success === false) throw new Error(json.message || "Failed to create post");
    return json.data ?? json;
  },

  getById: (postId: string) => request<{ post: any }>(`/posts/${postId}`),

  update: async (postId: string, formData: FormData) => {
    if (isLocalMode()) {
      const posts = getPosts();
      const idx = posts.findIndex((p) => p._id === postId);
      if (idx !== -1) { posts[idx].body = formData.get("body") as string || posts[idx].body; savePosts(posts); }
      return { post: posts[idx] };
    }
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}`, { method: "PUT", headers: token ? { token } : {}, body: formData }).then((r) => r.json());
  },

  delete: async (postId: string) => {
    if (isLocalMode()) { savePosts(getPosts().filter((p) => p._id !== postId)); return { message: "Deleted" }; }
    return request<{ message: string }>(`/posts/${postId}`, { method: "DELETE" });
  },

  like: async (postId: string) => {
    if (isLocalMode()) {
      const posts = getPosts();
      const idx = posts.findIndex((p) => p._id === postId);
      if (idx !== -1) { posts[idx].isLiked = !posts[idx].isLiked; posts[idx].likesCount += posts[idx].isLiked ? 1 : -1; savePosts(posts); }
      return { message: "Done" };
    }
    return request<{ message: string }>(`/posts/${postId}/like`, { method: "PUT" });
  },

  bookmark: async (postId: string) => {
    if (isLocalMode()) {
      const posts = getPosts();
      const idx = posts.findIndex((p) => p._id === postId);
      if (idx !== -1) { posts[idx].isBookmarked = !posts[idx].isBookmarked; savePosts(posts); }
      return { message: "Done" };
    }
    return request<{ message: string }>(`/posts/${postId}/bookmark`, { method: "PUT" });
  },

  getLikes: (postId: string, page = 1, limit = 20) =>
    request<{ likes: any[] }>(`/posts/${postId}/likes?page=${page}&limit=${limit}`),

  getComments: async (postId: string, page = 1, limit = 10) => {
    if (isLocalMode()) { const post = getPosts().find((p) => p._id === postId); return { comments: post?.comments || [] }; }
    return request<{ comments: any[] }>(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
  },

  addComment: async (postId: string, formData: FormData) => {
    if (isLocalMode()) {
      const posts = getPosts();
      const idx = posts.findIndex((p) => p._id === postId);
      if (idx !== -1) {
        const comment = { _id: `c_${Date.now()}`, body: formData.get("body") as string, user: getCurrentUser(), createdAt: new Date().toISOString(), likesCount: 0, replies: [] };
        posts[idx].comments = [comment, ...(posts[idx].comments || [])];
        posts[idx].commentsCount = (posts[idx].commentsCount || 0) + 1;
        savePosts(posts);
        return { comment };
      }
      throw new Error("Post not found");
    }
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}/comments`, { method: "POST", headers: token ? { token } : {}, body: formData })
      .then(async (r) => { const json = await r.json(); if (!r.ok || json.success === false) throw new Error(json.message || "Failed"); return (json.data ?? json) as { comment: any }; });
  },

  replyToComment: (postId: string, commentId: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}/replies`, { method: "POST", headers: token ? { token } : {}, body: formData })
      .then(async (r) => { const json = await r.json(); if (!r.ok || json.success === false) throw new Error(json.message || "Failed"); return (json.data ?? json) as { reply: any }; });
  },

  updateComment: (postId: string, commentId: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}`, { method: "PUT", headers: token ? { token } : {}, body: formData })
      .then(async (r) => { const json = await r.json(); if (!r.ok || json.success === false) throw new Error(json.message || "Failed"); return (json.data ?? json) as { comment: any }; });
  },

  deleteComment: (postId: string, commentId: string) =>
    request<{ message: string }>(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),

  getReplies: (postId: string, commentId: string, page = 1, limit = 10) =>
    request<{ replies: any[] }>(`/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`),

  likeComment: (postId: string, commentId: string) =>
    request<{ message: string }>(`/posts/${postId}/comments/${commentId}/like`, { method: "PUT" }),

  share: async (postId: string, body?: string) => {
    if (isLocalMode()) {
      const posts = getPosts();
      const originalPost = posts.find((p) => p._id === postId);
      if (!originalPost) throw new Error("Post not found");

      const sharedPost = {
        _id: `share_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        body: body || "",           
        image: null,
        user: getCurrentUser(),
        createdAt: new Date().toISOString(),
        likesCount: 0, commentsCount: 0, sharesCount: 0,
        likes: [], isLiked: false, isBookmarked: false, comments: [],
        isShare: true,              
        sharedPost: {               
          _id: originalPost._id,
          body: originalPost.body,
          image: originalPost.image,
          user: originalPost.user,
          createdAt: originalPost.createdAt,
        },
      };

      const idx = posts.findIndex((p) => p._id === postId);
      if (idx !== -1) { posts[idx].sharesCount = (posts[idx].sharesCount || 0) + 1; }

      posts.unshift(sharedPost);
      savePosts(posts);
      return { message: "Shared" };
    }

    return request<{ message: string }>(`/posts/${postId}/share`, {
      method: "POST",
      body: JSON.stringify({ body: body || "" }),
    });
  },
};

export const notificationsApi = {
  getAll: (page = 1, limit = 10, unread?: boolean) =>
    request<any>(`/notifications?page=${page}&limit=${limit}${unread !== undefined ? "&unread=" + unread : ""}`),
  getUnreadCount: () => request<any>("/notifications/unread-count"),
  markAsRead: (notificationId: string) =>
    request<{ message: string }>(`/notifications/${notificationId}/read`, { method: "PATCH" }),
  markAllAsRead: () =>
    request<{ message: string }>("/notifications/read-all", { method: "PATCH" }),
};