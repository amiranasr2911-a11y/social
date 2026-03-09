const BASE_URL = "https://route-posts.routemisr.com";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.token = token;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || "Something went wrong");
  }
  // API wraps responses in a "data" field - unwrap it
  return (json.data ?? json) as T;
}

// Auth
export const authApi = {
  signup: (body: {
    name: string;
    email: string;
    password: string;
    rePassword: string;
    dateOfBirth: string;
    gender: string;
  }) => request<{ token: string; user: any }>("/users/signup", { method: "POST", body: JSON.stringify(body) }),

  signin: (body: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/users/signin", { method: "POST", body: JSON.stringify(body) }),

  changePassword: (body: { password: string; newPassword: string }) =>
    request<{ message: string }>("/users/change-password", { method: "PATCH", body: JSON.stringify(body) }),
};

// Users
export const usersApi = {
  getMyProfile: () => request<{ user: any }>("/users/profile-data"),

  getUserProfile: (userId: string) => request<{ user: any }>(`/users/${userId}/profile`),

  uploadPhoto: async (formData: FormData) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${BASE_URL}/users/upload-photo`, {
      method: "PUT",
      headers: { token },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Upload failed");
    }
    return json.data ?? json;
  },

  getSuggestions: (limit = 10) =>
    request<{ suggestions: any[] }>(`/users/suggestions?limit=${limit}`),

  searchUsers: (query: string, limit = 20) =>
    request<{ users: any[] }>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getBookmarks: () => request<{ bookmarks: any[] }>("/users/bookmarks"),

  followUnfollow: (userId: string) =>
    request<{ message: string }>(`/users/${userId}/follow`, { method: "PUT" }),

  getUserPosts: (userId: string) =>
    request<{ posts: any[] }>(`/users/${userId}/posts`),
};

// Posts
export const postsApi = {
  getAll: (page = 1, limit = 20) =>
    request<{ posts: any[]; total?: number; paginationInfo?: any }>(
      `/posts?page=${page}&limit=${limit}`
    ),

  getFeed: (limit = 10) =>
    request<{ posts: any[] }>(`/posts/feed?only=following&limit=${limit}`),

  create: (formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: token ? { token } : {},
      body: formData,
    }).then((r) => r.json());
  },

  getById: (postId: string) => request<{ post: any }>(`/posts/${postId}`),

  update: (postId: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}`, {
      method: "PUT",
      headers: token ? { token } : {},
      body: formData,
    }).then((r) => r.json());
  },

  delete: (postId: string) =>
    request<{ message: string }>(`/posts/${postId}`, { method: "DELETE" }),

  getLikes: (postId: string, page = 1, limit = 20) =>
    request<{ likes: any[] }>(`/posts/${postId}/likes?page=${page}&limit=${limit}`),

  like: (postId: string) =>
    request<{ message: string }>(`/posts/${postId}/like`, { method: "PUT" }),

  bookmark: (postId: string) =>
    request<{ message: string }>(`/posts/${postId}/bookmark`, { method: "PUT" }),

  getComments: (postId: string, page = 1, limit = 10) =>
    request<{ comments: any[] }>(`/posts/${postId}/comments?page=${page}&limit=${limit}`),

  addComment: (postId: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: token ? { token } : {},
      body: formData,
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok || json.success === false) throw new Error(json.message || "Failed");
      return (json.data ?? json) as { comment: any };
    });
  },

  replyToComment: (postId: string, commentId: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
      method: "POST",
      headers: token ? { token } : {},
      body: formData,
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok || json.success === false) throw new Error(json.message || "Failed");
      return (json.data ?? json) as { reply: any };
    });
  },

  updateComment: (postId: string, commentId: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: "PUT",
      headers: token ? { token } : {},
      body: formData,
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok || json.success === false) throw new Error(json.message || "Failed");
      return (json.data ?? json) as { comment: any };
    });
  },

  deleteComment: (postId: string, commentId: string) =>
    request<{ message: string }>(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),

  getReplies: (postId: string, commentId: string, page = 1, limit = 10) =>
    request<{ replies: any[] }>(`/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`),

  likeComment: (postId: string, commentId: string) =>
    request<{ message: string }>(`/posts/${postId}/comments/${commentId}/like`, { method: "PUT" }),

  share: (postId: string, body?: string) =>
    request<{ message: string }>(`/posts/${postId}/share`, {
      method: "POST",
      body: JSON.stringify({ body: body || "" }),
    }),
};

// Notifications
export const notificationsApi = {
  getAll: (page = 1, limit = 10, unread?: boolean) => {
    const url = `/notifications?page=${page}&limit=${limit}${unread !== undefined ? '&unread=' + unread : ''}`;
    return request<any>(url);
  },

  getUnreadCount: () =>
    request<any>("/notifications/unread-count"),

  markAsRead: (notificationId: string) =>
    request<{ message: string }>(`/notifications/${notificationId}/read`, { method: "PATCH" }),

  markAllAsRead: () =>
    request<{ message: string }>("/notifications/read-all", { method: "PATCH" }),
};
