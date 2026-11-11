/**
 * Markdown Parsing and Typography Utility
 * Converts markdown text into structured, accessible HTML with syntax highlighting containers,
 * table-of-contents extraction, and reading helpers.
 */

export class MarkdownParser {
  /**
   * Escape raw HTML to prevent XSS
   */
  static escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Helper to clean heading titles for anchor IDs
   */
  static cleanHeadingId(title) {
    if (!title) return '';
    return title
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  /**
   * Extract headings for Table of Contents
   */
  static extractHeadings(markdownText) {
    if (!markdownText) return [];
    const headings = [];
    const lines = markdownText.split('\n');

    lines.forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length; // 2 or 3
        const title = match[2].trim().replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        const id = this.cleanHeadingId(title);
        headings.push({ level, title, id });
      }
    });

    return headings;
  }

  /**
   * Parse Markdown to HTML
   */
  static parse(markdown) {
    if (!markdown) return '';

    // First, extract and protect fenced code blocks
    const codeBlocks = [];
    let text = markdown.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      const language = (lang || 'code').toLowerCase();
      const escapedCode = this.escapeHtml(code.trim());
      codeBlocks.push(`
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-language">${language}</span>
            <button class="copy-code-btn" type="button" aria-label="Copy code">
              <span class="copy-icon">Copy</span>
            </button>
          </div>
          <pre><code class="language-${language}">${escapedCode}</code></pre>
        </div>
      `);
      return id;
    });

    // Horizontal rules
    text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="article-divider" />');

    // Headings (H1 to H4)
    text = text.replace(/^#### (.*$)/gim, (m, title) => {
      const id = this.cleanHeadingId(title);
      return `<h4 id="${id}">${title}</h4>`;
    });
    text = text.replace(/^### (.*$)/gim, (m, title) => {
      const id = this.cleanHeadingId(title);
      return `<h3 id="${id}">${title}</h3>`;
    });
    text = text.replace(/^## (.*$)/gim, (m, title) => {
      const id = this.cleanHeadingId(title);
      return `<h2 id="${id}">${title}</h2>`;
    });
    text = text.replace(/^# (.*$)/gim, (m, title) => {
      const id = this.cleanHeadingId(title);
      return `<h1 id="${id}">${title}</h1>`;
    });

    // Blockquotes
    text = text.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');
    // Combine consecutive blockquotes
    text = text.replace(/<\/blockquote>\n<blockquote>/gim, '<br />');

    // Bold & Italic
    text = text.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    text = text.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Inline code
    text = text.replace(/`([^`]+)`/g, (match, code) => {
      return `<code>${this.escapeHtml(code)}</code>`;
    });

    // Images: ![alt](url)
    text = text.replace(/!\[(.*?)\]\((.*?)\)/gim, (match, alt, url) => {
      return `
        <figure class="article-figure">
          <img src="${url}" alt="${this.escapeHtml(alt)}" loading="lazy" />
          ${alt ? `<figcaption>${this.escapeHtml(alt)}</figcaption>` : ''}
        </figure>
      `;
    });

    // Links: [title](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/gim, (match, title, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
    });

    // Lists
    // Unordered lists (- or *)
    text = text.replace(/^\s*[-*]\s+(.*)$/gim, '<ul><li>$1</li></ul>');
    text = text.replace(/<\/ul>\s*<ul>/gim, '');

    // Ordered lists (1. )
    text = text.replace(/^\s*\d+\.\s+(.*)$/gim, '<ol><li>$1</li></ol>');
    text = text.replace(/<\/ol>\s*<ol>/gim, '');

    // Paragraphs
    const blocks = text.split(/\n{2,}/);
    const parsedBlocks = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      // If block starts with HTML tag or code placeholder, don't wrap in <p>
      if (/^(<h[1-6]|<blockquote|<div|<ul|<ol|<figure|<hr|__CODE_BLOCK_)/i.test(block)) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    });

    let html = parsedBlocks.join('\n');

    // Restore protected code blocks
    codeBlocks.forEach((block, idx) => {
      html = html.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    return html;
  }

  /**
   * Format dates to human-friendly format (e.g. "Nov 8, 2026" or "2 hours ago")
   */
  static formatDate(isoString) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return '';
    }
  }
}
