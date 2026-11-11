/**
 * User Profile and Author Spotlight View
 * Manages personal bio, stats, published works, drafts, liked stories, and profile editing.
 */

import { storage } from '../services/storage.js';
import { MarkdownParser } from '../services/markdown.js';
import { icons } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';
import { router } from '../services/router.js';

export class ProfileView {
  constructor() {
    this.container = null;
    this.activeTab = 'published'; // 'published', 'drafts', 'liked', 'bookmarks'
    this.targetUserId = null;
  }

  render(params) {
    this.container = document.getElementById('view-profile');
    if (!this.container) return;

    const currentUser = storage.getCurrentUser();
    this.targetUserId = params.id || currentUser.id;
    const isSelf = this.targetUserId === currentUser.id;

    // Find author details
    let user = currentUser;
    if (!isSelf) {
      const posts = storage.getAllPostsRaw();
      const authorPost = posts.find(p => p.author && p.author.id === this.targetUserId);
      if (authorPost) {
        user = {
          id: this.targetUserId,
          name: authorPost.author.name,
          handle: authorPost.author.handle,
          avatar: authorPost.author.avatar,
          title: authorPost.author.title || 'Writer',
          bio: 'Contributor to Modern Blog.',
          joinedDate: '2024'
        };
      }
    }

    const stats = storage.getUserStats(this.targetUserId);

    this.container.innerHTML = `
      <div class="profile-layout">
        <!-- Profile Banner & Hero Header -->
        <header class="profile-header-card">
          <div class="profile-header-cover"></div>
          
          <div class="profile-header-content">
            <div class="profile-avatar-row">
              <div class="profile-avatar-wrapper">
                <img src="${user.avatar}" alt="${user.name}" class="profile-avatar-img" id="profile-main-avatar" />
              </div>

              <div class="profile-actions-bar">
                ${isSelf ? `
                  <button type="button" class="btn btn-outline btn-sm" id="edit-profile-btn">
                    ${icons.edit}
                    <span>Edit Profile</span>
                  </button>
                  <a href="#write" class="btn btn-primary btn-sm">
                    ${icons.plus}
                    <span>New Story</span>
                  </a>
                ` : `
                  <button type="button" class="btn btn-outline btn-sm" id="profile-follow-btn">Follow</button>
                `}
              </div>
            </div>

            <!-- Profile Info -->
            <div class="profile-info-block">
              <h1 class="profile-name">${MarkdownParser.escapeHtml(user.name)}</h1>
              <p class="profile-handle">@${MarkdownParser.escapeHtml(user.handle)}</p>
              <p class="profile-title">${MarkdownParser.escapeHtml(user.title || 'Author & Contributor')}</p>
              
              ${user.bio ? `<p class="profile-bio">${MarkdownParser.escapeHtml(user.bio)}</p>` : ''}

              <div class="profile-meta-row">
                ${user.location ? `<span class="profile-meta-item">${user.location}</span>` : ''}
                ${user.joinedDate ? `<span class="profile-meta-item">${icons.calendar} Joined ${user.joinedDate}</span>` : ''}
                ${user.website ? `
                  <a href="${user.website}" target="_blank" rel="noopener noreferrer" class="profile-meta-link">
                    ${icons.link} ${user.website.replace(/^https?:\/\//, '')}
                  </a>
                ` : ''}
              </div>
            </div>

            <!-- Profile Quantitative Stats Ribbon -->
            <div class="profile-stats-ribbon">
              <div class="profile-stat-box">
                <span class="stat-value">${stats.publishedCount}</span>
                <span class="stat-label">Published</span>
              </div>
              <div class="profile-stat-box">
                <span class="stat-value">${stats.totalLikesReceived}</span>
                <span class="stat-label">Total Likes</span>
              </div>
              <div class="profile-stat-box">
                <span class="stat-value">${stats.totalViews}</span>
                <span class="stat-label">Views</span>
              </div>
              <div class="profile-stat-box">
                <span class="stat-value">${stats.totalComments}</span>
                <span class="stat-label">Comments</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Profile Tabs -->
        <div class="profile-tabs-nav">
          <button type="button" class="profile-tab ${this.activeTab === 'published' ? 'active' : ''}" data-tab="published">
            Published (${stats.publishedCount})
          </button>
          ${isSelf ? `
            <button type="button" class="profile-tab ${this.activeTab === 'drafts' ? 'active' : ''}" data-tab="drafts">
              Drafts (${stats.draftsCount})
            </button>
            <button type="button" class="profile-tab ${this.activeTab === 'liked' ? 'active' : ''}" data-tab="liked">
              Liked Stories (${stats.likesGivenCount})
            </button>
            <button type="button" class="profile-tab ${this.activeTab === 'bookmarks' ? 'active' : ''}" data-tab="bookmarks">
              Saved (${stats.bookmarksCount})
            </button>
          ` : ''}
        </div>

        <!-- Tab Content Stream -->
        <main class="profile-tab-content" id="profile-tab-content"></main>
      </div>
    `;

    this.bindEvents(isSelf, user);
    this.renderActiveTab(isSelf);
  }

  bindEvents(isSelf, user) {
    // Tabs switcher
    this.container.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;
        this.renderActiveTab(isSelf);
      });
    });

    // Edit profile button
    const editBtn = this.container.querySelector('#edit-profile-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.openEditProfileModal(user);
      });
    }

    // Follow button for other authors
    const followBtn = this.container.querySelector('#profile-follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', () => {
        const isFollowing = followBtn.classList.contains('following');
        if (isFollowing) {
          followBtn.classList.remove('following');
          followBtn.textContent = 'Follow';
          toast.info(`Unfollowed @${user.handle}`);
        } else {
          followBtn.classList.add('following');
          followBtn.textContent = 'Following';
          toast.success(`You are now following @${user.handle}!`);
        }
      });
    }
  }

  renderActiveTab(isSelf) {
    const tabContent = this.container.querySelector('#profile-tab-content');
    if (!tabContent) return;

    if (this.activeTab === 'published') {
      const posts = storage.getPosts({ authorId: this.targetUserId, status: 'published' });
      this.renderPostsList(tabContent, posts, 'No published stories yet.', isSelf);
    } else if (this.activeTab === 'drafts') {
      const drafts = storage.getPosts({ authorId: this.targetUserId, status: 'draft' });
      this.renderDraftsList(tabContent, drafts);
    } else if (this.activeTab === 'liked') {
      const likedPosts = storage.getLikedPosts();
      this.renderPostsList(tabContent, likedPosts, 'No liked stories yet.', false);
    } else if (this.activeTab === 'bookmarks') {
      const bookmarked = storage.getBookmarkedPosts();
      this.renderPostsList(tabContent, bookmarked, 'No saved stories yet.', false);
    }
  }

  renderPostsList(container, posts, emptyMsg, showControls = false) {
    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icons.edit}</div>
          <h3 class="empty-state-title">${emptyMsg}</h3>
          ${showControls ? `
            <a href="#write" class="btn btn-primary">
              ${icons.plus}
              <span>Write your first story</span>
            </a>
          ` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="articles-grid">
        ${posts.map(post => {
          const isBookmarked = storage.isBookmarked(post.id);
          const isLiked = storage.isLiked(post.id);
          const commentCount = post.comments ? post.comments.length : 0;

          return `
            <article class="article-card" data-id="${post.id}">
              <div class="article-card-cover">
                <a href="#article/${post.id}">
                  <img src="${post.coverImage}" alt="${MarkdownParser.escapeHtml(post.title)}" loading="lazy" />
                </a>
                <span class="category-badge">${post.category}</span>
                <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${post.id}" title="${isBookmarked ? 'Remove bookmark' : 'Bookmark story'}">
                  ${isBookmarked ? icons.bookmarkFill : icons.bookmark}
                </button>
              </div>

              <div class="article-card-body">
                <div class="article-meta-header">
                  <span class="read-time-pill">${icons.clock} ${post.readingTime}</span>
                  <span class="post-date-muted">${MarkdownParser.formatDate(post.createdAt)}</span>
                </div>

                <h3 class="article-card-title">
                  <a href="#article/${post.id}">${MarkdownParser.escapeHtml(post.title)}</a>
                </h3>

                <p class="article-card-excerpt">${MarkdownParser.escapeHtml(post.subtitle || '')}</p>

                <div class="article-card-footer">
                  <div class="author-compact-link">
                    <img src="${post.author.avatar}" alt="${post.author.name}" class="author-compact-avatar" />
                    <span class="author-compact-name">${post.author.name}</span>
                  </div>

                  <div class="article-stats-group">
                    <span class="stat-pill ${isLiked ? 'liked' : ''}">
                      ${isLiked ? icons.heartFill : icons.heart}
                      <span>${post.likesCount || 0}</span>
                    </span>
                    <span class="stat-pill">
                      ${icons.comment}
                      <span>${commentCount}</span>
                    </span>
                  </div>
                </div>

                ${showControls ? `
                  <div class="card-author-actions">
                    <a href="#edit/${post.id}" class="btn btn-secondary btn-xs">
                      ${icons.edit} Edit
                    </a>
                    <button class="btn btn-outline-danger btn-xs card-delete-btn" data-id="${post.id}">
                      ${icons.trash} Delete
                    </button>
                  </div>
                ` : ''}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    // Bind bookmarks
    container.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const postId = btn.dataset.id;
        const bookmarked = storage.toggleBookmark(postId);
        btn.classList.toggle('active', bookmarked);
        btn.innerHTML = bookmarked ? icons.bookmarkFill : icons.bookmark;
        toast.show(bookmarked ? 'Saved to reading list' : 'Removed from reading list', 'bookmark');
      });
    });

    // Bind delete actions
    container.querySelectorAll('.card-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = btn.dataset.id;
        modal.confirm({
          title: 'Delete Story',
          message: 'Are you sure you want to permanently delete this story?',
          confirmText: 'Delete',
          isDanger: true,
          onConfirm: () => {
            storage.deletePost(postId);
            toast.success('Story deleted');
            this.render({ id: this.targetUserId });
          }
        });
      });
    });
  }

  renderDraftsList(container, drafts) {
    if (drafts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icons.edit}</div>
          <h3 class="empty-state-title">No drafts in progress</h3>
          <p class="empty-state-text">Your unpublished work and ideas will show up here.</p>
          <a href="#write" class="btn btn-primary">
            ${icons.plus}
            <span>Start a New Draft</span>
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="drafts-list">
        ${drafts.map(draft => `
          <div class="draft-row-card">
            <div class="draft-main-info">
              <span class="draft-status-badge">Draft</span>
              <h3 class="draft-title">${MarkdownParser.escapeHtml(draft.title || 'Untitled Draft')}</h3>
              <p class="draft-snippet">${MarkdownParser.escapeHtml(draft.subtitle || draft.content.slice(0, 120))}</p>
              <div class="draft-meta">
                <span>Last saved ${MarkdownParser.formatDate(draft.updatedAt)}</span>
                <span class="meta-dot">·</span>
                <span>${draft.readingTime}</span>
              </div>
            </div>
            <div class="draft-actions">
              <a href="#edit/${draft.id}" class="btn btn-primary btn-sm">
                ${icons.edit} Continue Writing
              </a>
              <button class="btn btn-outline-danger btn-sm draft-delete-btn" data-id="${draft.id}">
                ${icons.trash}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind draft delete
    container.querySelectorAll('.draft-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const draftId = btn.dataset.id;
        modal.confirm({
          title: 'Discard Draft',
          message: 'Are you sure you want to delete this draft?',
          confirmText: 'Discard',
          isDanger: true,
          onConfirm: () => {
            storage.deletePost(draftId);
            toast.info('Draft deleted');
            this.render({ id: this.targetUserId });
          }
        });
      });
    });
  }

  openEditProfileModal(user) {
    const content = `
      <form id="edit-profile-form" class="modal-form">
        <div class="form-group">
          <label class="input-label" for="profile-edit-name">Display Name</label>
          <input type="text" id="profile-edit-name" class="form-input" value="${MarkdownParser.escapeHtml(user.name)}" required />
        </div>

        <div class="form-group">
          <label class="input-label" for="profile-edit-handle">Handle (@username)</label>
          <input type="text" id="profile-edit-handle" class="form-input" value="${MarkdownParser.escapeHtml(user.handle)}" required />
        </div>

        <div class="form-group">
          <label class="input-label" for="profile-edit-title">Title / Role</label>
          <input type="text" id="profile-edit-title" class="form-input" value="${MarkdownParser.escapeHtml(user.title || '')}" placeholder="e.g. Full-stack Architect & Writer" />
        </div>

        <div class="form-group">
          <label class="input-label" for="profile-edit-bio">Bio</label>
          <textarea id="profile-edit-bio" class="form-input" rows="3" placeholder="Tell readers about yourself...">${MarkdownParser.escapeHtml(user.bio || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="input-label" for="profile-edit-avatar">Avatar Image URL</label>
          <input type="url" id="profile-edit-avatar" class="form-input" value="${MarkdownParser.escapeHtml(user.avatar)}" />
        </div>

        <div class="form-group">
          <label class="input-label" for="profile-edit-website">Website</label>
          <input type="url" id="profile-edit-website" class="form-input" value="${MarkdownParser.escapeHtml(user.website || '')}" placeholder="https://yourwebsite.com" />
        </div>
      </form>
    `;

    const footer = `
      <button type="button" class="btn btn-secondary modal-cancel-btn">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-profile-btn">Save Changes</button>
    `;

    const container = modal.open('Edit Profile', content, footer);

    const cancelBtn = container.querySelector('.modal-cancel-btn');
    cancelBtn.addEventListener('click', () => modal.close());

    const saveBtn = container.querySelector('#save-profile-btn');
    saveBtn.addEventListener('click', () => {
      const name = container.querySelector('#profile-edit-name').value.trim();
      const handle = container.querySelector('#profile-edit-handle').value.trim();
      const title = container.querySelector('#profile-edit-title').value.trim();
      const bio = container.querySelector('#profile-edit-bio').value.trim();
      const avatar = container.querySelector('#profile-edit-avatar').value.trim();
      const website = container.querySelector('#profile-edit-website').value.trim();

      if (!name) {
        toast.error('Display Name cannot be empty');
        return;
      }

      storage.updateCurrentUser({
        name,
        handle: handle.replace(/^@/, ''),
        title,
        bio,
        avatar: avatar || user.avatar,
        website
      });

      // Update navbar avatar
      const navAvatar = document.getElementById('nav-user-avatar');
      if (navAvatar) navAvatar.src = avatar || user.avatar;

      modal.close();
      toast.success('Profile updated successfully!');
      this.render({ id: this.targetUserId });
    });
  }
}

export const profileView = new ProfileView();

