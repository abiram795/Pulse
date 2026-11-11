/**
 * Article Editor View
 * Rich Markdown editor with live preview, toolbar formatting, cover image presets/upload,
 * word count, read-time calculation, draft saving, and full editing support.
 */

import { storage } from '../services/storage.js';
import { MarkdownParser } from '../services/markdown.js';
import { icons } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';
import { router } from '../services/router.js';
import { CATEGORIES, COVER_PRESETS } from '../data/defaultData.js';

export class EditorView {
  constructor() {
    this.container = null;
    this.editingPostId = null;
    this.state = {
      title: '',
      subtitle: '',
      category: 'Technology',
      tags: [],
      coverImage: '',
      content: '',
      activeTab: 'write' // 'write' or 'preview'
    };
  }

  render(params) {
    this.container = document.getElementById('view-editor');
    if (!this.container) return;

    this.editingPostId = params.id || null;

    if (this.editingPostId) {
      const post = storage.getPostById(this.editingPostId);
      if (!post) {
        toast.error('Article to edit could not be found');
        router.navigate('feed');
        return;
      }
      this.state = {
        title: post.title || '',
        subtitle: post.subtitle || '',
        category: post.category || 'Technology',
        tags: Array.isArray(post.tags) ? [...post.tags] : [],
        coverImage: post.coverImage || '',
        content: post.content || '',
        activeTab: 'write'
      };
    } else {
      // Check for saved local draft
      const draft = localStorage.getItem('blong_active_draft_v1');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          this.state = {
            title: parsed.title || '',
            subtitle: parsed.subtitle || '',
            category: parsed.category || 'Technology',
            tags: parsed.tags || [],
            coverImage: parsed.coverImage || '',
            content: parsed.content || '',
            activeTab: 'write'
          };
        } catch {
          this.resetState();
        }
      } else {
        this.resetState();
      }
    }

    const availableCategories = CATEGORIES.filter(c => c !== 'All');

    this.container.innerHTML = `
      <div class="editor-layout">
        <!-- Editor Top Header Navigation & Action Bar -->
        <header class="editor-top-bar">
          <div class="editor-bar-left">
            <button type="button" class="btn btn-ghost btn-sm" id="editor-back-btn">
              ${icons.arrowLeft}
              <span>${this.editingPostId ? 'Cancel Edit' : 'Back'}</span>
            </button>
            <span class="editor-mode-pill">
              ${this.editingPostId ? 'Editing Article' : 'Drafting Story'}
            </span>
          </div>

          <div class="editor-bar-right">
            <!-- Mode Switcher Tabs -->
            <div class="editor-tabs-group">
              <button type="button" class="editor-tab ${this.state.activeTab === 'write' ? 'active' : ''}" id="tab-write-btn">
                ${icons.edit}
                <span>Write</span>
              </button>
              <button type="button" class="editor-tab ${this.state.activeTab === 'preview' ? 'active' : ''}" id="tab-preview-btn">
                ${icons.eye}
                <span>Preview</span>
              </button>
            </div>

            <button type="button" class="btn btn-secondary btn-sm" id="editor-save-draft-btn">
              ${icons.download}
              <span>Save Draft</span>
            </button>

            <button type="button" class="btn btn-primary btn-sm" id="editor-publish-btn">
              ${icons.sparkles}
              <span>${this.editingPostId ? 'Update Story' : 'Publish Story'}</span>
            </button>
          </div>
        </header>

        <!-- Editor Content Workspace -->
        <div class="editor-workspace">
          <!-- WRITE PANE -->
          <div class="editor-write-pane ${this.state.activeTab === 'write' ? '' : 'hidden'}" id="editor-write-pane">
            
            <!-- Metadata Drawer -->
            <section class="editor-metadata-box">
              <div class="metadata-grid">
                <!-- Category Select -->
                <div class="metadata-col">
                  <label class="input-label" for="editor-category-select">Category</label>
                  <select id="editor-category-select" class="form-input">
                    ${availableCategories.map(cat => `
                      <option value="${cat}" ${this.state.category === cat ? 'selected' : ''}>${cat}</option>
                    `).join('')}
                  </select>
                </div>

                <!-- Tags Input -->
                <div class="metadata-col">
                  <label class="input-label" for="editor-tag-input">Tags (Press Enter to add)</label>
                  <div class="tag-input-container">
                    <div class="tags-chips-list" id="editor-tags-chips">
                      ${this.state.tags.map(tag => `
                        <span class="tag-chip">
                          #${tag}
                          <button type="button" class="remove-tag-chip" data-tag="${tag}">${icons.x}</button>
                        </span>
                      `).join('')}
                    </div>
                    <input 
                      type="text" 
                      id="editor-tag-input" 
                      class="tag-inline-input" 
                      placeholder="e.g. javascript, ai, ui-ux" 
                    />
                  </div>
                </div>
              </div>

              <!-- Cover Image Picker -->
              <div class="cover-image-section">
                <div class="cover-image-header">
                  <label class="input-label">Cover Image</label>
                  <button type="button" class="btn btn-ghost btn-xs" id="toggle-presets-btn">
                    ${icons.image} Choose from Presets
                  </button>
                </div>

                <div class="cover-input-row">
                  <input 
                    type="url" 
                    id="editor-cover-url" 
                    class="form-input" 
                    placeholder="Paste image URL (Unsplash, Cloudinary, etc.)..." 
                    value="${MarkdownParser.escapeHtml(this.state.coverImage)}" 
                  />
                  <label class="btn btn-secondary file-upload-btn" title="Upload local image">
                    ${icons.upload}
                    <span>Upload</span>
                    <input type="file" id="editor-file-upload" accept="image/*" hidden />
                  </label>
                </div>

                <!-- Presets dropdown panel -->
                <div class="presets-grid hidden" id="presets-grid">
                  ${COVER_PRESETS.map(preset => `
                    <div class="preset-card" data-url="${preset.url}">
                      <img src="${preset.url}" alt="${preset.name}" />
                      <span class="preset-name">${preset.name}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Active Cover Preview -->
                <div class="cover-preview-wrapper ${this.state.coverImage ? '' : 'hidden'}" id="cover-preview-wrapper">
                  <img src="${this.state.coverImage}" id="cover-preview-img" alt="Cover preview" />
                  <button type="button" class="btn btn-danger btn-xs remove-cover-btn" id="remove-cover-btn">
                    ${icons.trash} Remove Cover
                  </button>
                </div>
              </div>
            </section>

            <!-- Title & Subtitle Inputs -->
            <div class="editor-titles-wrapper">
              <input 
                type="text" 
                id="editor-title-input" 
                class="editor-title-input" 
                placeholder="Title: Craft a compelling headline..." 
                value="${MarkdownParser.escapeHtml(this.state.title)}" 
              />
              <textarea 
                id="editor-subtitle-input" 
                class="editor-subtitle-input" 
                placeholder="Write a clear, enticing excerpt or subtitle..." 
                rows="2"
              >${MarkdownParser.escapeHtml(this.state.subtitle)}</textarea>
            </div>

            <!-- Markdown Toolbar -->
            <div class="editor-toolbar">
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-tool="bold" title="Bold (**text**)">${icons.bold}</button>
                <button type="button" class="toolbar-btn" data-tool="italic" title="Italic (*text*)">${icons.italic}</button>
              </div>
              <div class="toolbar-sep"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-tool="h2" title="Heading 2">H2</button>
                <button type="button" class="toolbar-btn" data-tool="h3" title="Heading 3">H3</button>
              </div>
              <div class="toolbar-sep"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-tool="quote" title="Quote (>)">${icons.quote}</button>
                <button type="button" class="toolbar-btn" data-tool="code" title="Code block">${icons.code}</button>
                <button type="button" class="toolbar-btn" data-tool="list" title="Bullet list">${icons.list}</button>
              </div>
              <div class="toolbar-sep"></div>
              <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-tool="link" title="Insert link">${icons.link}</button>
                <button type="button" class="toolbar-btn" data-tool="image" title="Insert image">${icons.image}</button>
                <button type="button" class="toolbar-btn" data-tool="hr" title="Horizontal rule">―</button>
              </div>
            </div>

            <!-- Markdown Textarea -->
            <div class="editor-textarea-wrapper">
              <textarea 
                id="editor-markdown-textarea" 
                class="editor-markdown-textarea" 
                placeholder="Tell your story... Markdown syntax is supported (# Headings, **bold**, *italic*, \`\`\`code\`\`\`, > quotes, - lists)."
              >${MarkdownParser.escapeHtml(this.state.content)}</textarea>
            </div>

            <!-- Editor Footer Stats -->
            <footer class="editor-stats-bar">
              <div class="editor-stats-left">
                <span id="stat-words-count">0 words</span>
                <span class="meta-dot">·</span>
                <span id="stat-read-time">1 min read</span>
                <span class="meta-dot">·</span>
                <span id="stat-chars-count">0 characters</span>
              </div>
              <div class="editor-stats-right">
                <span class="auto-save-status" id="auto-save-status">Draft auto-saved locally</span>
              </div>
            </footer>
          </div>

          <!-- PREVIEW PANE -->
          <div class="editor-preview-pane ${this.state.activeTab === 'preview' ? '' : 'hidden'}" id="editor-preview-pane">
            <div class="preview-inner" id="preview-inner"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateStats();
  }

  resetState() {
    this.state = {
      title: '',
      subtitle: '',
      category: 'Technology',
      tags: [],
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      content: '',
      activeTab: 'write'
    };
  }

  bindEvents() {
    // Mode switcher
    const tabWrite = this.container.querySelector('#tab-write-btn');
    const tabPreview = this.container.querySelector('#tab-preview-btn');
    const writePane = this.container.querySelector('#editor-write-pane');
    const previewPane = this.container.querySelector('#editor-preview-pane');

    tabWrite.addEventListener('click', () => {
      this.state.activeTab = 'write';
      tabWrite.classList.add('active');
      tabPreview.classList.remove('active');
      writePane.classList.remove('hidden');
      previewPane.classList.add('hidden');
    });

    tabPreview.addEventListener('click', () => {
      this.syncInputsToState();
      this.state.activeTab = 'preview';
      tabPreview.classList.add('active');
      tabWrite.classList.remove('active');
      previewPane.classList.remove('hidden');
      writePane.classList.add('hidden');
      this.renderPreview();
    });

    // Back / Cancel
    const backBtn = this.container.querySelector('#editor-back-btn');
    backBtn.addEventListener('click', () => {
      if (this.state.title || this.state.content) {
        modal.confirm({
          title: 'Leave Editor?',
          message: 'Are you sure you want to exit? Any unsaved changes in this session may be lost.',
          confirmText: 'Discard & Exit',
          isDanger: true,
          onConfirm: () => {
            if (!this.editingPostId) {
              localStorage.removeItem('blong_active_draft_v1');
            }
            router.navigate(this.editingPostId ? `article/${this.editingPostId}` : 'feed');
          }
        });
      } else {
        router.navigate('feed');
      }
    });

    // Category
    const categorySelect = this.container.querySelector('#editor-category-select');
    categorySelect.addEventListener('change', (e) => {
      this.state.category = e.target.value;
      this.persistDraft();
    });

    // Tags
    const tagInput = this.container.querySelector('#editor-tag-input');
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = tagInput.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().trim();
        if (val && !this.state.tags.includes(val)) {
          this.state.tags.push(val);
          this.renderTags();
          tagInput.value = '';
          this.persistDraft();
        }
      }
    });

    this.bindTagRemoveButtons();

    // Cover Image URL
    const coverUrlInput = this.container.querySelector('#editor-cover-url');
    coverUrlInput.addEventListener('input', (e) => {
      this.state.coverImage = e.target.value.trim();
      this.updateCoverPreview();
      this.persistDraft();
    });

    // Toggle Presets
    const togglePresetsBtn = this.container.querySelector('#toggle-presets-btn');
    const presetsGrid = this.container.querySelector('#presets-grid');
    togglePresetsBtn.addEventListener('click', () => {
      presetsGrid.classList.toggle('hidden');
    });

    // Preset selection
    this.container.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        this.state.coverImage = url;
        coverUrlInput.value = url;
        presetsGrid.classList.add('hidden');
        this.updateCoverPreview();
        this.persistDraft();
        toast.info('Cover image selected from presets');
      });
    });

    // File upload
    const fileUpload = this.container.querySelector('#editor-file-upload');
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2.5 * 1024 * 1024) {
          toast.error('Image is too large. Please select an image under 2.5MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          this.state.coverImage = dataUrl;
          coverUrlInput.value = dataUrl;
          this.updateCoverPreview();
          this.persistDraft();
          toast.success('Image loaded successfully');
        };
        reader.readAsDataURL(file);
      }
    });

    // Remove cover
    const removeCoverBtn = this.container.querySelector('#remove-cover-btn');
    removeCoverBtn.addEventListener('click', () => {
      this.state.coverImage = '';
      coverUrlInput.value = '';
      this.updateCoverPreview();
      this.persistDraft();
    });

    // Title & Subtitle inputs
    const titleInput = this.container.querySelector('#editor-title-input');
    titleInput.addEventListener('input', (e) => {
      this.state.title = e.target.value;
      this.persistDraft();
    });

    const subtitleInput = this.container.querySelector('#editor-subtitle-input');
    subtitleInput.addEventListener('input', (e) => {
      this.state.subtitle = e.target.value;
      this.persistDraft();
    });

    // Textarea input
    const textarea = this.container.querySelector('#editor-markdown-textarea');
    textarea.addEventListener('input', (e) => {
      this.state.content = e.target.value;
      this.updateStats();
      this.persistDraft();
    });

    // Toolbar formatting buttons
    this.container.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.applyFormat(tool);
      });
    });

    // Save as draft
    const saveDraftBtn = this.container.querySelector('#editor-save-draft-btn');
    saveDraftBtn.addEventListener('click', () => {
      this.syncInputsToState();
      if (!this.state.title.trim()) {
        toast.error('Please provide at least a title for your draft');
        titleInput.focus();
        return;
      }

      if (this.editingPostId) {
        storage.updatePost(this.editingPostId, {
          title: this.state.title,
          subtitle: this.state.subtitle,
          category: this.state.category,
          tags: this.state.tags,
          coverImage: this.state.coverImage,
          content: this.state.content,
          status: 'draft'
        });
        toast.success('Article updated and saved as draft');
      } else {
        storage.createPost({
          ...this.state,
          status: 'draft'
        });
        localStorage.removeItem('blong_active_draft_v1');
        toast.success('Draft saved to your library!');
      }

      router.navigate('profile');
    });

    // Publish
    const publishBtn = this.container.querySelector('#editor-publish-btn');
    publishBtn.addEventListener('click', () => {
      this.syncInputsToState();

      if (!this.state.title.trim()) {
        toast.error('Title is required before publishing');
        titleInput.focus();
        return;
      }

      if (!this.state.content.trim()) {
        toast.error('Please write some content before publishing');
        textarea.focus();
        return;
      }

      if (this.editingPostId) {
        const updated = storage.updatePost(this.editingPostId, {
          title: this.state.title,
          subtitle: this.state.subtitle,
          category: this.state.category,
          tags: this.state.tags,
          coverImage: this.state.coverImage,
          content: this.state.content,
          status: 'published'
        });
        toast.success('Article successfully updated!');
        router.navigate(`article/${updated.id}`);
      } else {
        const created = storage.createPost({
          ...this.state,
          status: 'published'
        });
        localStorage.removeItem('blong_active_draft_v1');
        toast.success('Article published to the world! 🎉');
        router.navigate(`article/${created.id}`);
      }
    });
  }

  syncInputsToState() {
    const titleInput = this.container.querySelector('#editor-title-input');
    const subtitleInput = this.container.querySelector('#editor-subtitle-input');
    const textarea = this.container.querySelector('#editor-markdown-textarea');
    const coverUrlInput = this.container.querySelector('#editor-cover-url');
    const categorySelect = this.container.querySelector('#editor-category-select');

    if (titleInput) this.state.title = titleInput.value;
    if (subtitleInput) this.state.subtitle = subtitleInput.value;
    if (textarea) this.state.content = textarea.value;
    if (coverUrlInput) this.state.coverImage = coverUrlInput.value.trim();
    if (categorySelect) this.state.category = categorySelect.value;
  }

  persistDraft() {
    if (!this.editingPostId) {
      try {
        localStorage.setItem('blong_active_draft_v1', JSON.stringify(this.state));
        const statusEl = this.container.querySelector('#auto-save-status');
        if (statusEl) {
          statusEl.textContent = 'Draft auto-saved locally';
        }
      } catch (e) {
        console.warn('LocalStorage limit reached for draft auto-save:', e);
      }
    }
  }

  renderTags() {
    const container = this.container.querySelector('#editor-tags-chips');
    if (!container) return;
    container.innerHTML = this.state.tags.map(tag => `
      <span class="tag-chip">
        #${tag}
        <button type="button" class="remove-tag-chip" data-tag="${tag}">${icons.x}</button>
      </span>
    `).join('');
    this.bindTagRemoveButtons();
  }

  bindTagRemoveButtons() {
    this.container.querySelectorAll('.remove-tag-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = btn.dataset.tag;
        this.state.tags = this.state.tags.filter(t => t !== tag);
        this.renderTags();
        this.persistDraft();
      });
    });
  }

  updateCoverPreview() {
    const wrapper = this.container.querySelector('#cover-preview-wrapper');
    const img = this.container.querySelector('#cover-preview-img');
    if (!wrapper || !img) return;

    if (this.state.coverImage) {
      img.src = this.state.coverImage;
      wrapper.classList.remove('hidden');
    } else {
      wrapper.classList.add('hidden');
    }
  }

  updateStats() {
    const text = this.state.content || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = storage.calculateReadingTime(text);

    const wordsEl = this.container.querySelector('#stat-words-count');
    const readTimeEl = this.container.querySelector('#stat-read-time');
    const charsEl = this.container.querySelector('#stat-chars-count');

    if (wordsEl) wordsEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
    if (readTimeEl) readTimeEl.textContent = readingTime;
    if (charsEl) charsEl.textContent = `${chars} character${chars === 1 ? '' : 's'}`;
  }

  applyFormat(tool) {
    const textarea = this.container.querySelector('#editor-markdown-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (tool) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? replacement.length : 1;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Section Heading'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'h3':
        replacement = `\n### ${selected || 'Sub-heading'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Inspiring quote or key takeaway.'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        replacement = `\n\`\`\`javascript\n${selected || '// Your code snippet here\nconst example = 42;'}\n\`\`\`\n`;
        cursorOffset = replacement.length;
        break;
      case 'list':
        replacement = `\n- ${selected || 'First item'}\n- Second item\n- Third item\n`;
        cursorOffset = replacement.length;
        break;
      case 'link':
        replacement = `[${selected || 'link description'}](https://example.com)`;
        cursorOffset = replacement.length;
        break;
      case 'image':
        replacement = `\n![${selected || 'Image caption'}](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80)\n`;
        cursorOffset = replacement.length;
        break;
      case 'hr':
        replacement = `\n\n---\n\n`;
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    textarea.setRangeText(replacement, start, end, 'select');
    textarea.focus();
    this.state.content = textarea.value;
    this.updateStats();
    this.persistDraft();
  }

  renderPreview() {
    const previewInner = this.container.querySelector('#preview-inner');
    if (!previewInner) return;

    const currentUser = storage.getCurrentUser();
    const parsedHtml = MarkdownParser.parse(this.state.content || '*No content provided yet.*');
    const readingTime = storage.calculateReadingTime(this.state.content);

    previewInner.innerHTML = `
      <div class="article-reader-main preview-mode-container">
        <div class="preview-badge-banner">
          ${icons.eye} Live Article Preview
        </div>

        <header class="article-header">
          <div class="article-header-meta">
            <span class="category-badge">${this.state.category}</span>
            <span class="meta-dot">·</span>
            <span class="read-time-pill">${icons.clock} ${readingTime}</span>
            <span class="meta-dot">·</span>
            <span class="post-date-muted">Draft Preview</span>
          </div>

          <h1 class="article-main-title">${MarkdownParser.escapeHtml(this.state.title || 'Untitled Story')}</h1>

          ${this.state.subtitle ? `<p class="article-main-subtitle">${MarkdownParser.escapeHtml(this.state.subtitle)}</p>` : ''}

          <div class="article-author-row">
            <img src="${currentUser.avatar}" alt="${currentUser.name}" class="author-main-avatar" />
            <div class="author-details">
              <span class="author-display-name">${currentUser.name}</span>
              <p class="author-role">${currentUser.title || 'Author'}</p>
            </div>
          </div>
        </header>

        ${this.state.coverImage ? `
          <div class="article-cover-banner">
            <img src="${this.state.coverImage}" alt="Cover preview" class="article-cover-img" />
          </div>
        ` : ''}

        <div class="article-content-body">
          ${parsedHtml}
        </div>

        ${this.state.tags.length > 0 ? `
          <div class="article-tags-section">
            <span class="tags-label">${icons.tag} Tags:</span>
            <div class="tags-list">
              ${this.state.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

export const editorView = new EditorView();

