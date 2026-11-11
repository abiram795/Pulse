/**
 * Article Reader View
 * Features reading progress bar, floating action dock, table of contents,
 * claps/likes, bookmarks, social share, and interactive threaded commenting.
 */

import { storage } from '../services/storage.js';
import { MarkdownParser } from '../services/markdown.js';
import { icons } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';
import { router } from '../services/router.js';

export class ArticleView {
  constructor() {
    this.container = null;
    this.currentPost = null;
    this.scrollHandler = null;
  }

  render(params) {
    this.container = document.getElementById('view-article');
    if (!this.container) return;

    const postId = params.id;
    this.currentPost = storage.getPostById(postId);

    if (!this.currentPost) {
      this.renderNotFound();
      return;
    }

    // Increment view count
    storage.incrementView(postId);

    const post = this.currentPost;
    const currentUser = storage.getCurrentUser();
    const isAuthor = post.author && (post.author.id === currentUser.id || post.author.handle === currentUser.handle);
    const isLiked = storage.isLiked(post.id);
    const isBookmarked = storage.isBookmarked(post.id);
    const headings = MarkdownParser.extractHeadings(post.content);
    const parsedHtml = MarkdownParser.parse(post.content);

    this.container.innerHTML = `
      <!-- Top Scroll Progress Bar -->
      <div id="reading-progress-bar" class="reading-progress-bar"></div>

      <div class="article-reader-layout">
        <!-- Floating Action Dock -->
        <aside class="floating-action-dock" id="floating-action-dock">
          <button class="action-dock-btn dock-like-btn ${isLiked ? 'liked' : ''}" id="dock-like-btn" title="Like article" aria-label="Like article">
            <span class="dock-icon">${isLiked ? icons.heartFill : icons.heart}</span>
            <span class="dock-count" id="dock-like-count">${post.likesCount || 0}</span>
          </button>

          <button class="action-dock-btn dock-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" id="dock-bookmark-btn" title="Bookmark article" aria-label="Bookmark article">
            <span class="dock-icon">${isBookmarked ? icons.bookmarkFill : icons.bookmark}</span>
          </button>

          <button class="action-dock-btn" id="dock-comment-jump-btn" title="Jump to discussion" aria-label="Jump to discussion">
            <span class="dock-icon">${icons.comment}</span>
            <span class="dock-count" id="dock-comment-count">${post.comments ? post.comments.length : 0}</span>
          </button>

          <button class="action-dock-btn" id="dock-share-btn" title="Share article" aria-label="Share article">
            <span class="dock-icon">${icons.share}</span>
          </button>

          ${isAuthor ? `
            <div class="dock-divider"></div>
            <a href="#edit/${post.id}" class="action-dock-btn" title="Edit story" aria-label="Edit story">
              <span class="dock-icon">${icons.edit}</span>
            </a>
            <button class="action-dock-btn dock-delete-btn" id="dock-delete-btn" title="Delete story" aria-label="Delete story">
              <span class="dock-icon">${icons.trash}</span>
            </button>
          ` : ''}
        </aside>

        <!-- Article Reader Main Column -->
        <main class="article-reader-main">
          <!-- Back Link -->
          <div class="article-back-nav">
            <a href="#feed" class="back-link">
              ${icons.arrowLeft}
              <span>Back to Stories</span>
            </a>
          </div>

          <!-- Header -->
          <header class="article-header">
            <div class="article-header-meta">
              <a href="#feed?category=${encodeURIComponent(post.category)}" class="category-badge">${post.category}</a>
              <span class="meta-dot">·</span>
              <span class="read-time-pill">${icons.clock} ${post.readingTime}</span>
              <span class="meta-dot">·</span>
              <span class="post-date-muted">${MarkdownParser.formatDate(post.createdAt)}</span>
              ${post.viewsCount ? `<span class="meta-dot">·</span><span class="view-count-pill">${icons.eye} ${post.viewsCount} views</span>` : ''}
            </div>

            <h1 class="article-main-title">${MarkdownParser.escapeHtml(post.title)}</h1>

            ${post.subtitle ? `<p class="article-main-subtitle">${MarkdownParser.escapeHtml(post.subtitle)}</p>` : ''}

            <!-- Author Bio Bar -->
            <div class="article-author-row">
              <a href="#profile/${post.author.id}" class="author-avatar-link">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="author-main-avatar" />
              </a>
              <div class="author-details">
                <div class="author-name-group">
                  <a href="#profile/${post.author.id}" class="author-display-name">${post.author.name}</a>
                  <span class="author-handle">@${post.author.handle}</span>
                </div>
                <p class="author-role">${post.author.title || 'Writer & Contributor'}</p>
              </div>

              ${!isAuthor ? `
                <button type="button" class="btn btn-outline btn-sm follow-btn" id="author-follow-btn">Follow</button>
              ` : `
                <div class="author-self-actions">
                  <a href="#edit/${post.id}" class="btn btn-secondary btn-sm">${icons.edit} Edit</a>
                  <button type="button" class="btn btn-outline-danger btn-sm" id="article-header-delete-btn">${icons.trash}</button>
                </div>
              `}
            </div>
          </header>

          <!-- Featured Cover Image -->
          ${post.coverImage ? `
            <div class="article-cover-banner">
              <img src="${post.coverImage}" alt="${MarkdownParser.escapeHtml(post.title)}" class="article-cover-img" />
            </div>
          ` : ''}

          <!-- Two-column Body with Sticky Table of Contents -->
          <div class="article-body-wrapper">
            <!-- Article Markdown Content -->
            <div class="article-content-body" id="article-content-body">
              ${parsedHtml}
            </div>

            <!-- Table of Contents Sidebar -->
            ${headings.length > 1 ? `
              <aside class="article-toc-sidebar">
                <div class="toc-container">
                  <h4 class="toc-title">Table of Contents</h4>
                  <nav class="toc-nav">
                    <ul>
                      ${headings.map(h => `
                        <li class="toc-item toc-level-${h.level}">
                          <a href="#${h.id}" class="toc-link">${h.title}</a>
                        </li>
                      `).join('')}
                    </ul>
                  </nav>
                </div>
              </aside>
            ` : ''}
          </div>

          <!-- Tags Cloud -->
          ${Array.isArray(post.tags) && post.tags.length > 0 ? `
            <div class="article-tags-section">
              <span class="tags-label">${icons.tag} Tags:</span>
              <div class="tags-list">
                ${post.tags.map(t => `<a href="#feed?tag=${encodeURIComponent(t)}" class="tag-pill">#${t}</a>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Author Box -->
          <section class="author-card-highlight">
            <img src="${post.author.avatar}" alt="${post.author.name}" class="highlight-avatar" />
            <div class="highlight-info">
              <div class="highlight-header">
                <div>
                  <h3 class="highlight-name">Written by ${post.author.name}</h3>
                  <span class="highlight-handle">@${post.author.handle}</span>
                </div>
                <a href="#profile/${post.author.id}" class="btn btn-outline btn-sm">View Profile</a>
              </div>
              <p class="highlight-bio">${post.author.title || 'Writer & Tech Craftsman'}. Passionate about sharing ideas and open web standards.</p>
            </div>
          </section>

          <!-- Related Posts Section -->
          <section class="related-posts-section" id="related-posts-section"></section>

          <!-- Comments Section -->
          <section class="comments-section" id="comments-section">
            <div class="comments-header">
              <h2 class="comments-title">
                <span>Discussion</span>
                <span class="comments-count-badge" id="comments-count-pill">${post.comments ? post.comments.length : 0}</span>
              </h2>
            </div>

            <!-- New Comment Box -->
            <div class="comment-input-box">
              <img src="${currentUser.avatar}" alt="${currentUser.name}" class="comment-user-avatar" />
              <div class="comment-form-inner">
                <textarea 
                  id="new-comment-textarea" 
                  class="comment-textarea" 
                  placeholder="What are your thoughts on this story? (Markdown supported)"
                  rows="3"
                ></textarea>
                <div class="comment-form-actions">
                  <span class="comment-hint">Be respectful and constructive</span>
                  <button type="button" class="btn btn-primary btn-sm" id="submit-comment-btn">
                    <span>Respond</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Comments Thread List -->
            <div class="comments-list" id="comments-list"></div>
          </section>
        </main>
      </div>
    `;

    this.bindEvents();
    this.bindCodeBlockCopy();
    this.renderComments();
    this.renderRelatedPosts();
    this.setupScrollProgress();
  }

  setupScrollProgress() {
    const progressBar = this.container.querySelector('#reading-progress-bar');
    if (!progressBar) return;

    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }

    this.scrollHandler = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.scrollHandler();
  }

  bindEvents() {
    const post = this.currentPost;

    // Like button
    const likeBtn = this.container.querySelector('#dock-like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        const res = storage.toggleLike(post.id);
        likeBtn.classList.toggle('liked', res.liked);
        likeBtn.querySelector('.dock-icon').innerHTML = res.liked ? icons.heartFill : icons.heart;
        likeBtn.querySelector('#dock-like-count').textContent = res.count;

        if (res.liked) {
          likeBtn.classList.add('heart-burst');
          setTimeout(() => likeBtn.classList.remove('heart-burst'), 600);
          toast.show('You liked this article! ❤️', 'success');
        }
      });
    }

    // Bookmark button
    const bookmarkBtn = this.container.querySelector('#dock-bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        const bookmarked = storage.toggleBookmark(post.id);
        bookmarkBtn.classList.toggle('bookmarked', bookmarked);
        bookmarkBtn.querySelector('.dock-icon').innerHTML = bookmarked ? icons.bookmarkFill : icons.bookmark;
        toast.show(bookmarked ? 'Story saved to bookmarks' : 'Removed from bookmarks', 'bookmark');
      });
    }

    // Jump to comments button
    const jumpBtn = this.container.querySelector('#dock-comment-jump-btn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        const commentsSection = this.container.querySelector('#comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
          const textarea = this.container.querySelector('#new-comment-textarea');
          if (textarea) textarea.focus();
        }
      });
    }

    // Share button
    const shareBtn = this.container.querySelector('#dock-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.openShareModal();
      });
    }

    // Delete post buttons
    const deleteBtn = this.container.querySelector('#dock-delete-btn');
    const headerDeleteBtn = this.container.querySelector('#article-header-delete-btn');
    const triggerDelete = () => {
      modal.confirm({
        title: 'Delete Article',
        message: `Are you sure you want to delete "${MarkdownParser.escapeHtml(post.title)}"? This action cannot be undone.`,
        confirmText: 'Delete Permanently',
        isDanger: true,
        onConfirm: () => {
          storage.deletePost(post.id);
          toast.success('Article deleted successfully');
          router.navigate('feed');
        }
      });
    };

    if (deleteBtn) deleteBtn.addEventListener('click', triggerDelete);
    if (headerDeleteBtn) headerDeleteBtn.addEventListener('click', triggerDelete);

    // Follow author toggle button
    const followBtn = this.container.querySelector('#author-follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', () => {
        const isFollowing = followBtn.classList.contains('following');
        if (isFollowing) {
          followBtn.classList.remove('following');
          followBtn.textContent = 'Follow';
          toast.info(`Unfollowed @${post.author.handle}`);
        } else {
          followBtn.classList.add('following');
          followBtn.textContent = 'Following';
          toast.success(`You are now following @${post.author.handle}!`);
        }
      });
    }

    // Submit comment button
    const submitCommentBtn = this.container.querySelector('#submit-comment-btn');
    const commentTextarea = this.container.querySelector('#new-comment-textarea');
    if (submitCommentBtn && commentTextarea) {
      submitCommentBtn.addEventListener('click', () => {
        const text = commentTextarea.value.trim();
        if (!text) {
          toast.error('Please write a comment before posting');
          commentTextarea.focus();
          return;
        }

        const newComment = storage.addComment(post.id, text);
        if (newComment) {
          commentTextarea.value = '';
          this.currentPost = storage.getPostById(post.id);
          this.renderComments();
          toast.success('Your response has been published!');
        }
      });
    }

    // Smooth scroll for TOC links
    this.container.querySelectorAll('.toc-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  bindCodeBlockCopy() {
    this.container.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeEl = btn.closest('.code-block-wrapper').querySelector('code');
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.innerText).then(() => {
            btn.querySelector('.copy-icon').textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.querySelector('.copy-icon').textContent = 'Copy';
              btn.classList.remove('copied');
            }, 2000);
          }).catch(() => {
            toast.error('Failed to copy to clipboard');
          });
        }
      });
    });
  }

  renderComments() {
    const commentsList = this.container.querySelector('#comments-list');
    const countPill = this.container.querySelector('#comments-count-pill');
    const dockCommentCount = this.container.querySelector('#dock-comment-count');
    if (!commentsList) return;

    const post = this.currentPost;
    const comments = post.comments || [];
    const currentUser = storage.getCurrentUser();

    if (countPill) countPill.textContent = comments.length;
    if (dockCommentCount) dockCommentCount.textContent = comments.length;

    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div class="empty-comments">
          <p class="muted-text">No responses yet. Be the first to start the conversation!</p>
        </div>
      `;
      return;
    }

    commentsList.innerHTML = comments.map(comment => {
      const isCommentLiked = storage.isCommentLiked(comment.id);
      const isOwnComment = comment.author && comment.author.name === currentUser.name;
      const isPostAuthor = comment.author && post.author && comment.author.name === post.author.name;

      return `
        <div class="comment-item" id="comment-${comment.id}">
          <div class="comment-header">
            <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-author-avatar" />
            <div class="comment-author-info">
              <div class="comment-name-row">
                <span class="comment-author-name">${comment.author.name}</span>
                ${isPostAuthor ? `<span class="author-badge">Author</span>` : ''}
              </div>
              <span class="comment-time">${MarkdownParser.formatDate(comment.createdAt)}</span>
            </div>
            ${isOwnComment ? `
              <button class="delete-comment-btn" data-id="${comment.id}" title="Delete comment" aria-label="Delete comment">
                ${icons.trash}
              </button>
            ` : ''}
          </div>

          <div class="comment-body">
            <p>${MarkdownParser.escapeHtml(comment.content)}</p>
          </div>

          <div class="comment-actions">
            <button class="comment-like-btn ${isCommentLiked ? 'liked' : ''}" data-id="${comment.id}">
              ${isCommentLiked ? icons.heartFill : icons.heart}
              <span class="comment-like-count">${comment.likesCount || 0}</span>
            </button>
            <button class="comment-reply-trigger-btn" data-id="${comment.id}">
              ${icons.reply}
              <span>Reply</span>
            </button>
          </div>

          <!-- Inline Reply Box (Hidden by default) -->
          <div class="inline-reply-box hidden" id="reply-box-${comment.id}">
            <textarea class="reply-textarea" placeholder="Write a reply..." rows="2"></textarea>
            <div class="reply-actions">
              <button class="btn btn-secondary btn-sm cancel-reply-btn" data-id="${comment.id}">Cancel</button>
              <button class="btn btn-primary btn-sm submit-reply-btn" data-id="${comment.id}">Reply</button>
            </div>
          </div>

          <!-- Nested Replies -->
          ${Array.isArray(comment.replies) && comment.replies.length > 0 ? `
            <div class="nested-replies-list">
              ${comment.replies.map(reply => {
                const isReplyLiked = storage.isCommentLiked(reply.id);
                const isOwnReply = reply.author && reply.author.name === currentUser.name;
                const isReplyAuthorPostOwner = reply.author && post.author && reply.author.name === post.author.name;

                return `
                  <div class="reply-item" id="reply-${reply.id}">
                    <div class="comment-header">
                      <img src="${reply.author.avatar}" alt="${reply.author.name}" class="comment-author-avatar reply-avatar" />
                      <div class="comment-author-info">
                        <div class="comment-name-row">
                          <span class="comment-author-name">${reply.author.name}</span>
                          ${isReplyAuthorPostOwner ? `<span class="author-badge">Author</span>` : ''}
                        </div>
                        <span class="comment-time">${MarkdownParser.formatDate(reply.createdAt)}</span>
                      </div>
                      ${isOwnReply ? `
                        <button class="delete-comment-btn" data-id="${reply.id}" title="Delete reply" aria-label="Delete reply">
                          ${icons.trash}
                        </button>
                      ` : ''}
                    </div>
                    <div class="comment-body">
                      <p>${MarkdownParser.escapeHtml(reply.content)}</p>
                    </div>
                    <div class="comment-actions">
                      <button class="comment-like-btn ${isReplyLiked ? 'liked' : ''}" data-id="${reply.id}">
                        ${isReplyLiked ? icons.heartFill : icons.heart}
                        <span class="comment-like-count">${reply.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    this.bindCommentInteractions();
  }

  bindCommentInteractions() {
    const post = this.currentPost;

    // Comment like buttons
    this.container.querySelectorAll('.comment-like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.id;
        const res = storage.toggleCommentLike(commentId);
        btn.classList.toggle('liked', res.liked);
        btn.querySelector('svg').outerHTML = res.liked ? icons.heartFill : icons.heart;
        btn.querySelector('.comment-like-count').textContent = res.count;
      });
    });

    // Delete comment / reply buttons
    this.container.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.id;
        modal.confirm({
          title: 'Delete Comment',
          message: 'Are you sure you want to delete this comment?',
          confirmText: 'Delete',
          isDanger: true,
          onConfirm: () => {
            storage.deleteComment(post.id, commentId);
            this.currentPost = storage.getPostById(post.id);
            this.renderComments();
            toast.info('Comment removed');
          }
        });
      });
    });

    // Reply trigger buttons
    this.container.querySelectorAll('.comment-reply-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.id;
        const box = this.container.querySelector(`#reply-box-${commentId}`);
        if (box) {
          box.classList.toggle('hidden');
          if (!box.classList.contains('hidden')) {
            const textarea = box.querySelector('.reply-textarea');
            if (textarea) textarea.focus();
          }
        }
      });
    });

    // Cancel reply buttons
    this.container.querySelectorAll('.cancel-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.id;
        const box = this.container.querySelector(`#reply-box-${commentId}`);
        if (box) box.classList.add('hidden');
      });
    });

    // Submit reply buttons
    this.container.querySelectorAll('.submit-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.id;
        const box = this.container.querySelector(`#reply-box-${commentId}`);
        const textarea = box ? box.querySelector('.reply-textarea') : null;
        if (!textarea || !textarea.value.trim()) {
          toast.error('Please enter reply text');
          return;
        }

        storage.addComment(post.id, textarea.value.trim(), commentId);
        this.currentPost = storage.getPostById(post.id);
        this.renderComments();
        toast.success('Reply submitted');
      });
    });
  }

  renderRelatedPosts() {
    const relatedSection = this.container.querySelector('#related-posts-section');
    if (!relatedSection) return;

    const allPosts = storage.getPosts({ status: 'published' });
    const related = allPosts
      .filter(p => p.id !== this.currentPost.id && (p.category === this.currentPost.category || (p.author && p.author.id === this.currentPost.author.id)))
      .slice(0, 3);

    if (related.length === 0) {
      relatedSection.style.display = 'none';
      return;
    }

    relatedSection.innerHTML = `
      <div class="related-header">
        <h3 class="related-title">Recommended from Modern Blog</h3>
      </div>
      <div class="related-grid">
        ${related.map(p => `
          <div class="related-card">
            <a href="#article/${p.id}" class="related-cover-link">
              <img src="${p.coverImage}" alt="${MarkdownParser.escapeHtml(p.title)}" loading="lazy" />
            </a>
            <div class="related-card-content">
              <span class="category-badge">${p.category}</span>
              <h4 class="related-card-title">
                <a href="#article/${p.id}">${MarkdownParser.escapeHtml(p.title)}</a>
              </h4>
              <div class="related-author-row">
                <img src="${p.author.avatar}" alt="${p.author.name}" class="related-author-avatar" />
                <span class="related-author-name">${p.author.name}</span>
                <span class="meta-dot">·</span>
                <span>${p.readingTime}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  openShareModal() {
    const post = this.currentPost;
    const shareUrl = window.location.href;

    const content = `
      <div class="share-modal-body">
        <p class="share-desc">Share <strong>"${MarkdownParser.escapeHtml(post.title)}"</strong> with your network:</p>
        
        <div class="share-copy-box">
          <input type="text" class="share-link-input" value="${shareUrl}" readonly />
          <button class="btn btn-primary share-copy-btn" id="modal-copy-link-btn">
            ${icons.copy}
            <span>Copy Link</span>
          </button>
        </div>

        <div class="share-social-buttons">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline share-social-btn">
            Twitter / X
          </a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline share-social-btn">
            LinkedIn
          </a>
        </div>
      </div>
    `;

    const container = modal.open('Share Story', content, '', { size: 'sm' });
    const copyBtn = container.querySelector('#modal-copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyBtn.querySelector('span').textContent = 'Copied!';
          toast.success('Link copied to clipboard!');
          setTimeout(() => modal.close(), 1000);
        });
      });
    }
  }

  renderNotFound() {
    this.container.innerHTML = `
      <div class="article-not-found">
        <div class="empty-state-icon">${icons.arrowLeft}</div>
        <h2>Article Not Found</h2>
        <p class="muted-text">The story you are looking for may have been removed or does not exist.</p>
        <a href="#feed" class="btn btn-primary">
          ${icons.arrowLeft}
          <span>Back to Feed</span>
        </a>
      </div>
    `;
  }
}

export const articleView = new ArticleView();

