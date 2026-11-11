/**
 * Feed View: Home, Discovery, Search & Category Filtering
 */

import { storage } from '../services/storage.js';
import { MarkdownParser } from '../services/markdown.js';
import { icons } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { CATEGORIES } from '../data/defaultData.js';

export class FeedView {
  constructor() {
    this.container = null;
    this.state = {
      category: 'All',
      search: '',
      tag: '',
      sortBy: 'newest'
    };
    this.searchDebounceTimer = null;
  }

  render(params, query) {
    this.container = document.getElementById('view-feed');
    if (!this.container) return;

    // Sync query parameters if present
    if (query.category) this.state.category = query.category;
    if (query.tag) this.state.tag = query.tag;
    if (query.search) this.state.search = query.search;
    if (query.sort) this.state.sortBy = query.sort;

    this.container.innerHTML = `
      <div class="feed-layout">
        <!-- Main Feed Stream -->
        <main class="feed-main">
          <!-- Featured Hero Article Container -->
          <section id="feed-hero" class="feed-hero-section"></section>

          <!-- Filter & Search Toolbar -->
          <div class="feed-controls-wrapper">
            <!-- Category Pills Bar -->
            <div class="category-scroll-container">
              <div class="category-pills" id="category-pills">
                ${CATEGORIES.map(cat => `
                  <button type="button" class="category-pill ${this.state.category === cat ? 'active' : ''}" data-category="${cat}">
                    ${cat}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Search, Sort & Active Filter Bar -->
            <div class="feed-filter-row">
              <div class="search-input-wrapper">
                <span class="search-icon">${icons.search}</span>
                <input 
                  type="text" 
                  id="feed-search-input" 
                  class="search-input" 
                  placeholder="Search articles, tags, authors, keywords..." 
                  value="${MarkdownParser.escapeHtml(this.state.search)}"
                />
                ${this.state.search ? `<button type="button" id="feed-clear-search" class="clear-search-btn" aria-label="Clear search">${icons.x}</button>` : ''}
              </div>

              <div class="sort-select-wrapper">
                <label for="feed-sort-select" class="sort-label">Sort:</label>
                <select id="feed-sort-select" class="sort-select">
                  <option value="newest" ${this.state.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
                  <option value="popular" ${this.state.sortBy === 'popular' ? 'selected' : ''}>Most Liked</option>
                  <option value="trending" ${this.state.sortBy === 'trending' ? 'selected' : ''}>Trending / Active</option>
                  <option value="readingTimeAsc" ${this.state.sortBy === 'readingTimeAsc' ? 'selected' : ''}>Short Reads (&lt; 4m)</option>
                  <option value="readingTimeDesc" ${this.state.sortBy === 'readingTimeDesc' ? 'selected' : ''}>Deep Dives (&gt; 5m)</option>
                  <option value="oldest" ${this.state.sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
                </select>
              </div>
            </div>

            <!-- Active Tag Filter Badge -->
            <div id="active-filters-bar" class="active-filters-bar ${this.state.tag ? '' : 'hidden'}">
              <span class="active-filter-label">Filtered by tag:</span>
              <span class="active-tag-chip">
                ${icons.tag}
                <span>#${this.state.tag}</span>
                <button type="button" id="clear-tag-btn" class="clear-chip-btn" aria-label="Remove tag filter">${icons.x}</button>
              </span>
            </div>
          </div>

          <!-- Articles List / Grid -->
          <div id="articles-grid" class="articles-grid"></div>
        </main>

        <!-- Feed Right Sidebar -->
        <aside class="feed-sidebar">
          <!-- Spotlight / Write CTA -->
          <div class="sidebar-card write-promo-card">
            <div class="promo-badge">${icons.sparkles} Share your ideas</div>
            <h3 class="promo-title">Have a perspective on code, design, or systems?</h3>
            <p class="promo-desc">Publish directly to the community with our instant visual markdown editor.</p>
            <a href="#write" class="btn btn-primary btn-block promo-btn">
              ${icons.edit}
              <span>Write an Article</span>
            </a>
          </div>

          <!-- Trending Stories Widget -->
          <div class="sidebar-card" id="trending-widget">
            <div class="sidebar-card-header">
              <h3 class="sidebar-title">Trending Articles</h3>
            </div>
            <div class="trending-list" id="trending-list"></div>
          </div>

          <!-- Popular Tags Widget -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <h3 class="sidebar-title">Explore Topics</h3>
            </div>
            <div class="popular-tags-cloud" id="popular-tags-cloud"></div>
          </div>

          <!-- Platform Info Footer -->
          <div class="sidebar-footer">
            <div class="footer-links">
              <a href="#feed">Discover</a>
              <a href="#bookmarks">Reading List</a>
              <a href="#profile">Profile</a>
              <a href="#" id="open-backup-btn">Data & Backup</a>
            </div>
            <p class="footer-copyright">© 2026 Modern Blog. Browser-based persistent storage.</p>
          </div>
        </aside>
      </div>
    `;

    this.bindEvents();
    this.refreshFeed();
    this.renderTrending();
    this.renderPopularTags();
  }

  bindEvents() {
    // Category pills
    const pills = this.container.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.state.category = pill.dataset.category;
        this.refreshFeed();
      });
    });

    // Search input with debounce
    const searchInput = this.container.querySelector('#feed-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.state.search = e.target.value;
          this.refreshFeed();
          this.toggleClearButton();
        }, 220);
      });
    }

    // Clear search
    this.toggleClearButton();

    // Sort select
    const sortSelect = this.container.querySelector('#feed-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.refreshFeed();
      });
    }

    // Clear tag filter button
    const clearTagBtn = this.container.querySelector('#clear-tag-btn');
    if (clearTagBtn) {
      clearTagBtn.addEventListener('click', () => {
        this.state.tag = '';
        const bar = this.container.querySelector('#active-filters-bar');
        if (bar) bar.classList.add('hidden');
        this.refreshFeed();
      });
    }
  }

  toggleClearButton() {
    const searchWrapper = this.container.querySelector('.search-input-wrapper');
    let clearBtn = this.container.querySelector('#feed-clear-search');

    if (this.state.search) {
      if (!clearBtn && searchWrapper) {
        clearBtn = document.createElement('button');
        clearBtn.id = 'feed-clear-search';
        clearBtn.className = 'clear-search-btn';
        clearBtn.type = 'button';
        clearBtn.innerHTML = icons.x;
        clearBtn.addEventListener('click', () => {
          this.state.search = '';
          const input = this.container.querySelector('#feed-search-input');
          if (input) input.value = '';
          clearBtn.remove();
          this.refreshFeed();
        });
        searchWrapper.appendChild(clearBtn);
      }
    } else if (clearBtn) {
      clearBtn.remove();
    }
  }

  refreshFeed() {
    const posts = storage.getPosts({
      category: this.state.category,
      search: this.state.search,
      tag: this.state.tag,
      sortBy: this.state.sortBy,
      status: 'published'
    });

    this.renderHero(posts);
    this.renderGrid(posts);
  }

  renderHero(posts) {
    const heroContainer = this.container.querySelector('#feed-hero');
    if (!heroContainer) return;

    // Only display hero banner when on default "All" category without search/tag filter
    const isDefaultFilter = this.state.category === 'All' && !this.state.search && !this.state.tag;

    if (!isDefaultFilter || posts.length === 0) {
      heroContainer.innerHTML = '';
      heroContainer.style.display = 'none';
      return;
    }

    heroContainer.style.display = 'block';
    const heroPost = posts[0];
    const isBookmarked = storage.isBookmarked(heroPost.id);

    heroContainer.innerHTML = `
      <div class="hero-card" data-id="${heroPost.id}">
        <div class="hero-image-wrapper">
          <img src="${heroPost.coverImage}" alt="${MarkdownParser.escapeHtml(heroPost.title)}" class="hero-image" loading="eager" />
          <div class="hero-image-overlay"></div>
          <span class="hero-badge">Featured Story</span>
        </div>
        <div class="hero-content">
          <div class="hero-meta-top">
            <span class="category-badge">${heroPost.category}</span>
            <span class="meta-dot">·</span>
            <span class="read-time">${heroPost.readingTime}</span>
          </div>
          <h2 class="hero-title">
            <a href="#article/${heroPost.id}">${MarkdownParser.escapeHtml(heroPost.title)}</a>
          </h2>
          <p class="hero-excerpt">${MarkdownParser.escapeHtml(heroPost.subtitle || '')}</p>
          <div class="hero-footer">
            <div class="author-snippet">
              <img src="${heroPost.author.avatar}" alt="${heroPost.author.name}" class="author-avatar" />
              <div class="author-meta">
                <span class="author-name">${heroPost.author.name}</span>
                <span class="post-date">${MarkdownParser.formatDate(heroPost.createdAt)}</span>
              </div>
            </div>
            <div class="hero-actions">
              <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${heroPost.id}" title="${isBookmarked ? 'Remove bookmark' : 'Save story'}">
                ${isBookmarked ? icons.bookmarkFill : icons.bookmark}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind hero bookmark
    const heroBookmarkBtn = heroContainer.querySelector('.bookmark-btn');
    if (heroBookmarkBtn) {
      heroBookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const bookmarked = storage.toggleBookmark(heroPost.id);
        heroBookmarkBtn.classList.toggle('active', bookmarked);
        heroBookmarkBtn.innerHTML = bookmarked ? icons.bookmarkFill : icons.bookmark;
        toast.show(bookmarked ? 'Story saved to bookmarks' : 'Removed from bookmarks', 'bookmark');
      });
    }
  }

  renderGrid(posts) {
    const grid = this.container.querySelector('#articles-grid');
    if (!grid) return;

    // If hero is rendered, skip the first post in grid
    const isDefaultFilter = this.state.category === 'All' && !this.state.search && !this.state.tag;
    const displayPosts = isDefaultFilter && posts.length > 1 ? posts.slice(1) : posts;

    if (displayPosts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icons.search}</div>
          <h3 class="empty-state-title">No articles found</h3>
          <p class="empty-state-text">We couldn't find any stories matching your current filter criteria.</p>
          <button class="btn btn-secondary" id="reset-filters-btn">
            ${icons.refresh}
            <span>Reset All Filters</span>
          </button>
        </div>
      `;

      const resetBtn = grid.querySelector('#reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.state.category = 'All';
          this.state.search = '';
          this.state.tag = '';
          this.state.sortBy = 'newest';
          this.render({}, {});
        });
      }
      return;
    }

    grid.innerHTML = displayPosts.map(post => {
      const isBookmarked = storage.isBookmarked(post.id);
      const isLiked = storage.isLiked(post.id);
      const commentCount = post.comments ? post.comments.length : 0;

      return `
        <article class="article-card" data-id="${post.id}">
          <div class="article-card-cover">
            <a href="#article/${post.id}" tabindex="-1" aria-hidden="true">
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

            ${Array.isArray(post.tags) && post.tags.length > 0 ? `
              <div class="article-tags-row">
                ${post.tags.slice(0, 3).map(t => `<span class="tag-pill" data-tag="${t}">#${t}</span>`).join('')}
              </div>
            ` : ''}

            <div class="article-card-footer">
              <a href="#profile/${post.author.id}" class="author-compact-link">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="author-compact-avatar" />
                <span class="author-compact-name">${post.author.name}</span>
              </a>

              <div class="article-stats-group">
                <span class="stat-pill ${isLiked ? 'liked' : ''}" title="${post.likesCount} likes">
                  ${isLiked ? icons.heartFill : icons.heart}
                  <span>${post.likesCount || 0}</span>
                </span>
                <span class="stat-pill" title="${commentCount} comments">
                  ${icons.comment}
                  <span>${commentCount}</span>
                </span>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind bookmark buttons in grid
    grid.querySelectorAll('.bookmark-btn').forEach(btn => {
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

    // Bind tag pills in cards
    grid.querySelectorAll('.tag-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = pill.dataset.tag;
        this.filterByTag(tag);
      });
    });
  }

  filterByTag(tag) {
    this.state.tag = tag;
    const bar = this.container.querySelector('#active-filters-bar');
    if (bar) {
      bar.classList.remove('hidden');
      const tagSpan = bar.querySelector('.active-tag-chip span');
      if (tagSpan) tagSpan.textContent = '#' + tag;
    }
    this.refreshFeed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderTrending() {
    const list = this.container.querySelector('#trending-list');
    if (!list) return;

    const trendingPosts = storage.getPosts({ sortBy: 'popular', status: 'published' }).slice(0, 4);

    list.innerHTML = trendingPosts.map((post, idx) => `
      <div class="trending-item">
        <span class="trending-rank">0${idx + 1}</span>
        <div class="trending-content">
          <div class="trending-author">
            <img src="${post.author.avatar}" alt="${post.author.name}" class="trending-author-avatar" />
            <span class="trending-author-name">${post.author.name}</span>
          </div>
          <h4 class="trending-title">
            <a href="#article/${post.id}">${MarkdownParser.escapeHtml(post.title)}</a>
          </h4>
          <div class="trending-meta">
            <span>${MarkdownParser.formatDate(post.createdAt)}</span>
            <span>·</span>
            <span>${post.readingTime}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderPopularTags() {
    const tagsCloud = this.container.querySelector('#popular-tags-cloud');
    if (!tagsCloud) return;

    const tags = storage.getPopularTags();
    if (tags.length === 0) {
      tagsCloud.innerHTML = '<span class="muted-text">No tags available</span>';
      return;
    }

    tagsCloud.innerHTML = tags.map(t => `
      <button type="button" class="tag-cloud-pill ${this.state.tag === t.name ? 'active' : ''}" data-tag="${t.name}">
        <span>#${t.name}</span>
        <span class="tag-count">${t.count}</span>
      </button>
    `).join('');

    tagsCloud.querySelectorAll('.tag-cloud-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const tag = pill.dataset.tag;
        this.filterByTag(tag);
      });
    });
  }
}

export const feedView = new FeedView();

