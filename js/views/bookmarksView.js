/**
 * Bookmarks / Reading List View
 * Displays saved articles with filtering, search, and one-click removal.
 */

import { storage } from '../services/storage.js';
import { MarkdownParser } from '../services/markdown.js';
import { icons } from '../components/icons.js';
import { toast } from '../components/toast.js';

export class BookmarksView {
  constructor() {
    this.container = null;
    this.state = {
      search: '',
      category: 'All'
    };
  }

  render() {
    this.container = document.getElementById('view-bookmarks');
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="bookmarks-layout">
        <header class="bookmarks-header">
          <div class="bookmarks-header-title-row">
            <div>
              <h1 class="bookmarks-page-title">Reading List</h1>
              <p class="bookmarks-page-subtitle">Your curated collection of saved stories and references</p>
            </div>
            <div class="bookmarks-count-pill" id="bookmarks-total-pill">
              ${icons.bookmarkFill}
              <span id="bookmarks-count-number">0</span>
            </div>
          </div>

          <div class="bookmarks-filter-toolbar">
            <div class="search-input-wrapper">
              <span class="search-icon">${icons.search}</span>
              <input 
                type="text" 
                id="bookmarks-search-input" 
                class="search-input" 
                placeholder="Search within your saved stories..." 
                value="${MarkdownParser.escapeHtml(this.state.search)}"
              />
            </div>
          </div>
        </header>

        <!-- Bookmarks List Grid -->
        <div id="bookmarks-grid" class="articles-grid"></div>
      </div>
    `;

    this.bindEvents();
    this.refreshBookmarks();
  }

  bindEvents() {
    const searchInput = this.container.querySelector('#bookmarks-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.search = e.target.value.toLowerCase().trim();
        this.refreshBookmarks();
      });
    }
  }

  refreshBookmarks() {
    let posts = storage.getBookmarkedPosts();
    const countNumber = this.container.querySelector('#bookmarks-count-number');
    if (countNumber) countNumber.textContent = `${posts.length} saved`;

    if (this.state.search) {
      const q = this.state.search;
      posts = posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.author && p.author.name && p.author.name.toLowerCase().includes(q))
      );
    }

    const grid = this.container.querySelector('#bookmarks-grid');
    if (!grid) return;

    if (posts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icons.bookmark}</div>
          <h3 class="empty-state-title">Your reading list is empty</h3>
          <p class="empty-state-text">Found something intriguing? Tap the bookmark icon on any article to save it here for later reading.</p>
          <a href="#feed" class="btn btn-primary">
            ${icons.sparkles}
            <span>Discover Stories</span>
          </a>
        </div>
      `;
      return;
    }

    grid.innerHTML = posts.map(post => {
      const isLiked = storage.isLiked(post.id);
      const commentCount = post.comments ? post.comments.length : 0;

      return `
        <article class="article-card" data-id="${post.id}">
          <div class="article-card-cover">
            <a href="#article/${post.id}">
              <img src="${post.coverImage}" alt="${MarkdownParser.escapeHtml(post.title)}" loading="lazy" />
            </a>
            <span class="category-badge">${post.category}</span>
            <button class="bookmark-btn active" data-id="${post.id}" title="Remove from reading list">
              ${icons.bookmarkFill}
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
          </div>
        </article>
      `;
    }).join('');

    // Bind remove bookmark
    grid.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const postId = btn.dataset.id;
        storage.toggleBookmark(postId);
        toast.show('Removed from reading list', 'bookmark');
        this.refreshBookmarks();
      });
    });
  }
}

export const bookmarksView = new BookmarksView();

