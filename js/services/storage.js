/**
 * Persistent Browser-Based Storage Service
 * Manages Posts, Drafts, Comments, Likes, Bookmarks, and User Profiles using LocalStorage.
 */

import { DEFAULT_CURRENT_USER, DEFAULT_POSTS } from '../data/defaultData.js';

const STORAGE_KEYS = {
  POSTS: 'blong_posts_v1',
  CURRENT_USER: 'blong_user_v1',
  LIKES: 'blong_user_likes_v1',
  BOOKMARKS: 'blong_user_bookmarks_v1',
  COMMENT_LIKES: 'blong_user_comment_likes_v1',
  THEME: 'blong_theme_v1'
};

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_CURRENT_USER));
      }
      if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify({ 'post-1': true }));
      }
      if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(['post-1', 'post-3']));
      }
      if (!localStorage.getItem(STORAGE_KEYS.COMMENT_LIKES)) {
        localStorage.setItem(STORAGE_KEYS.COMMENT_LIKES, JSON.stringify({ 'c-101': true }));
      }
    } catch (err) {
      console.error('Storage initialization failed:', err);
    }
  }

  // --- POSTS CRUD ---

  getAllPostsRaw() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading posts:', e);
      return [];
    }
  }

  savePostsRaw(posts) {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return true;
    } catch (e) {
      console.error('Error saving posts:', e);
      return false;
    }
  }

  getPosts(options = {}) {
    const {
      search = '',
      category = 'All',
      tag = '',
      authorId = '',
      status = 'published',
      sortBy = 'newest'
    } = options;

    let posts = this.getAllPostsRaw();

    // Filter by status (published, draft, all)
    if (status !== 'all') {
      posts = posts.filter(p => (p.status || 'published') === status);
    }

    // Filter by category
    if (category && category !== 'All') {
      posts = posts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by tag
    if (tag) {
      const cleanTag = tag.trim().toLowerCase();
      posts = posts.filter(p => Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === cleanTag));
    }

    // Filter by author
    if (authorId) {
      posts = posts.filter(p => p.author && p.author.id === authorId);
    }

    // Filter by search query (matches title, subtitle, content, tags, or author name)
    if (search && search.trim()) {
      const query = search.trim().toLowerCase();
      posts = posts.filter(p => {
        const titleMatch = p.title && p.title.toLowerCase().includes(query);
        const subtitleMatch = p.subtitle && p.subtitle.toLowerCase().includes(query);
        const contentMatch = p.content && p.content.toLowerCase().includes(query);
        const authorMatch = p.author && p.author.name && p.author.name.toLowerCase().includes(query);
        const tagMatch = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(query));
        return titleMatch || subtitleMatch || contentMatch || authorMatch || tagMatch;
      });
    }

    // Sort posts
    posts.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'popular') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      if (sortBy === 'trending') {
        const aScore = (a.likesCount || 0) * 2 + (a.comments ? a.comments.length : 0) * 3;
        const bScore = (b.likesCount || 0) * 2 + (b.comments ? b.comments.length : 0) * 3;
        return bScore - aScore;
      }
      if (sortBy === 'readingTimeAsc') {
        const aMin = parseInt(a.readingTime) || 1;
        const bMin = parseInt(b.readingTime) || 1;
        return aMin - bMin;
      }
      if (sortBy === 'readingTimeDesc') {
        const aMin = parseInt(a.readingTime) || 1;
        const bMin = parseInt(b.readingTime) || 1;
        return bMin - aMin;
      }
      return 0;
    });

    return posts;
  }

  getPostById(id) {
    const posts = this.getAllPostsRaw();
    return posts.find(p => p.id === id) || null;
  }

  createPost(postData) {
    const posts = this.getAllPostsRaw();
    const currentUser = this.getCurrentUser();

    const newPost = {
      id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: postData.title.trim(),
      subtitle: postData.subtitle ? postData.subtitle.trim() : '',
      slug: (postData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: postData.category || 'Technology',
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      coverImage: postData.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      content: postData.content || '',
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        title: currentUser.title || 'Author'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      readingTime: this.calculateReadingTime(postData.content || ''),
      viewsCount: 1,
      status: postData.status || 'published',
      comments: []
    };

    posts.unshift(newPost);
    this.savePostsRaw(posts);
    return newPost;
  }

  updatePost(id, updatedFields) {
    const posts = this.getAllPostsRaw();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const currentPost = posts[index];
    const newContent = updatedFields.content !== undefined ? updatedFields.content : currentPost.content;

    const updatedPost = {
      ...currentPost,
      ...updatedFields,
      content: newContent,
      readingTime: this.calculateReadingTime(newContent),
      updatedAt: new Date().toISOString()
    };

    posts[index] = updatedPost;
    this.savePostsRaw(posts);
    return updatedPost;
  }

  deletePost(id) {
    let posts = this.getAllPostsRaw();
    const initialLen = posts.length;
    posts = posts.filter(p => p.id !== id);
    this.savePostsRaw(posts);

    // Also remove from bookmarks and likes
    this.removeBookmark(id);
    const likes = this.getLikes();
    delete likes[id];
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));

    return posts.length < initialLen;
  }

  incrementView(id) {
    const posts = this.getAllPostsRaw();
    const post = posts.find(p => p.id === id);
    if (post) {
      post.viewsCount = (post.viewsCount || 0) + 1;
      this.savePostsRaw(posts);
    }
  }

  // --- LIKES ---

  getLikes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  isLiked(postId) {
    const likes = this.getLikes();
    return Boolean(likes[postId]);
  }

  toggleLike(postId) {
    const likes = this.getLikes();
    const posts = this.getAllPostsRaw();
    const post = posts.find(p => p.id === postId);
    if (!post) return { liked: false, count: 0 };

    const wasLiked = Boolean(likes[postId]);
    const isNowLiked = !wasLiked;

    if (isNowLiked) {
      likes[postId] = true;
      post.likesCount = (post.likesCount || 0) + 1;
    } else {
      delete likes[postId];
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
    }

    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    this.savePostsRaw(posts);

    return { liked: isNowLiked, count: post.likesCount };
  }

  // --- BOOKMARKS ---

  getBookmarksList() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  isBookmarked(postId) {
    const list = this.getBookmarksList();
    return list.includes(postId);
  }

  toggleBookmark(postId) {
    let list = this.getBookmarksList();
    const index = list.indexOf(postId);
    let bookmarked = false;

    if (index > -1) {
      list.splice(index, 1);
      bookmarked = false;
    } else {
      list.unshift(postId);
      bookmarked = true;
    }

    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));

    if (typeof document !== 'undefined') {
      const countBadge = document.getElementById('nav-bookmarks-count');
      if (countBadge) {
        countBadge.textContent = list.length;
        countBadge.style.display = list.length > 0 ? 'inline-flex' : 'none';
      }
    }

    return bookmarked;
  }

  removeBookmark(postId) {
    let list = this.getBookmarksList();
    list = list.filter(id => id !== postId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));

    if (typeof document !== 'undefined') {
      const countBadge = document.getElementById('nav-bookmarks-count');
      if (countBadge) {
        countBadge.textContent = list.length;
        countBadge.style.display = list.length > 0 ? 'inline-flex' : 'none';
      }
    }
  }

  getBookmarkedPosts() {
    const ids = this.getBookmarksList();
    const all = this.getAllPostsRaw();
    const map = new Map(all.map(p => [p.id, p]));
    return ids.map(id => map.get(id)).filter(Boolean);
  }

  // --- COMMENTS & REPLIES ---

  addComment(postId, text, parentCommentId = null) {
    const posts = this.getAllPostsRaw();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    const currentUser = this.getCurrentUser();
    const newComment = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar
      },
      content: text.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      replies: []
    };

    if (parentCommentId) {
      // Find parent comment and append reply
      const parent = post.comments.find(c => c.id === parentCommentId);
      if (parent) {
        if (!Array.isArray(parent.replies)) parent.replies = [];
        parent.replies.push(newComment);
      } else {
        post.comments.push(newComment);
      }
    } else {
      post.comments.unshift(newComment);
    }

    this.savePostsRaw(posts);
    return newComment;
  }

  deleteComment(postId, commentId) {
    const posts = this.getAllPostsRaw();
    const post = posts.find(p => p.id === postId);
    if (!post || !Array.isArray(post.comments)) return false;

    // Check top-level comments
    const topIdx = post.comments.findIndex(c => c.id === commentId);
    if (topIdx > -1) {
      post.comments.splice(topIdx, 1);
      this.savePostsRaw(posts);
      return true;
    }

    // Check replies
    for (const comment of post.comments) {
      if (Array.isArray(comment.replies)) {
        const rIdx = comment.replies.findIndex(r => r.id === commentId);
        if (rIdx > -1) {
          comment.replies.splice(rIdx, 1);
          this.savePostsRaw(posts);
          return true;
        }
      }
    }

    return false;
  }

  toggleCommentLike(commentId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMENT_LIKES);
      const likes = data ? JSON.parse(data) : {};
      const wasLiked = Boolean(likes[commentId]);
      const isNowLiked = !wasLiked;

      if (isNowLiked) {
        likes[commentId] = true;
      } else {
        delete likes[commentId];
      }

      localStorage.setItem(STORAGE_KEYS.COMMENT_LIKES, JSON.stringify(likes));

      // Update post comment object count
      const posts = this.getAllPostsRaw();
      for (const p of posts) {
        if (Array.isArray(p.comments)) {
          for (const c of p.comments) {
            if (c.id === commentId) {
              c.likesCount = Math.max(0, (c.likesCount || 0) + (isNowLiked ? 1 : -1));
              this.savePostsRaw(posts);
              return { liked: isNowLiked, count: c.likesCount };
            }
            if (Array.isArray(c.replies)) {
              for (const r of c.replies) {
                if (r.id === commentId) {
                  r.likesCount = Math.max(0, (r.likesCount || 0) + (isNowLiked ? 1 : -1));
                  this.savePostsRaw(posts);
                  return { liked: isNowLiked, count: r.likesCount };
                }
              }
            }
          }
        }
      }

      return { liked: isNowLiked, count: 0 };
    } catch {
      return { liked: false, count: 0 };
    }
  }

  isCommentLiked(commentId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMENT_LIKES);
      const likes = data ? JSON.parse(data) : {};
      return Boolean(likes[commentId]);
    } catch {
      return false;
    }
  }

  // --- USER PROFILE ---

  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : DEFAULT_CURRENT_USER;
    } catch {
      return DEFAULT_CURRENT_USER;
    }
  }

  updateCurrentUser(profileData) {
    try {
      const current = this.getCurrentUser();
      const updated = { ...current, ...profileData };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));

      // Also update author info on posts authored by current user
      const posts = this.getAllPostsRaw();
      let changed = false;
      posts.forEach(p => {
        if (p.author && p.author.id === current.id) {
          p.author.name = updated.name;
          p.author.handle = updated.handle;
          p.author.avatar = updated.avatar;
          p.author.title = updated.title;
          changed = true;
        }
      });
      if (changed) this.savePostsRaw(posts);

      return updated;
    } catch (e) {
      console.error('Error updating profile:', e);
      return null;
    }
  }

  getUserStats(userId = null) {
    const targetId = userId || this.getCurrentUser().id;
    const allPosts = this.getAllPostsRaw();

    const userPosts = allPosts.filter(p => p.author && p.author.id === targetId);
    const published = userPosts.filter(p => p.status === 'published');
    const drafts = userPosts.filter(p => p.status === 'draft');

    const totalLikes = published.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalViews = published.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const totalComments = published.reduce((sum, p) => sum + (p.comments ? p.comments.length : 0), 0);

    const bookmarksCount = this.getBookmarksList().length;
    const likesGivenCount = Object.keys(this.getLikes()).length;

    return {
      publishedCount: published.length,
      draftsCount: drafts.length,
      totalLikesReceived: totalLikes,
      totalViews: totalViews,
      totalComments: totalComments,
      bookmarksCount,
      likesGivenCount
    };
  }

  getLikedPosts() {
    const likes = this.getLikes();
    const all = this.getAllPostsRaw();
    return all.filter(p => Boolean(likes[p.id]));
  }

  // --- STATS & TAGS ---

  getPopularTags() {
    const posts = this.getPosts({ status: 'published' });
    const tagMap = {};

    posts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          const lower = t.trim().toLowerCase();
          if (lower) {
            tagMap[lower] = (tagMap[lower] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // --- BACKUP & RESTORE ---

  exportAllData() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      posts: this.getAllPostsRaw(),
      currentUser: this.getCurrentUser(),
      likes: this.getLikes(),
      bookmarks: this.getBookmarksList(),
      commentLikes: localStorage.getItem(STORAGE_KEYS.COMMENT_LIKES) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENT_LIKES)) : {}
    }, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid backup file: missing posts array');
      }

      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(data.posts));
      if (data.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.currentUser));
      }
      if (data.likes) {
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(data.likes));
      }
      if (data.bookmarks) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
      }
      if (data.commentLikes) {
        localStorage.setItem(STORAGE_KEYS.COMMENT_LIKES, JSON.stringify(data.commentLikes));
      }
      return { success: true };
    } catch (err) {
      console.error('Import failed:', err);
      return { success: false, error: err.message };
    }
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_CURRENT_USER));
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify({ 'post-1': true }));
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(['post-1', 'post-3']));
    localStorage.setItem(STORAGE_KEYS.COMMENT_LIKES, JSON.stringify({ 'c-101': true }));
  }

  // --- UTILS ---

  calculateReadingTime(text) {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }
}

export const storage = new StorageService();
