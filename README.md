# Pulse — Modern Responsive Blogging Platform

A production-grade, responsive blogging and longform reading platform built with modern **HTML5**, **CSS3 (Custom Properties & Responsive Grid/Flexbox)**, and **Vanilla JavaScript (ES6+ Modules)**. It features zero external framework dependencies, instant client-side performance, and persistent browser-based storage (`localStorage`).

---

## ✨ Features Overview

### 1. ✍️ Article Publishing & Visual Markdown Editor
- **Distraction-Free Writing**: Clean interface inspired by Medium, Substack, and Notion.
- **Rich Markdown Formatting Toolbar**: One-click actions for Bold, Italic, H2/H3 Headings, Blockquotes, Code Blocks, Lists, Links, Images, and Horizontal Dividers.
- **Dual Mode (Write & Live Preview)**: Instantly toggle between markdown editing and a real-time rendered preview of the article.
- **Cover Image Management**:
  - Direct Image URL input
  - 6 Built-in High-Resolution Unsplash presets (Coding, Design, Cyber, Abstract, Nature, Architecture)
  - Local Image File Upload (automatically converted to base64 Data URLs for local persistence)
- **Tag & Category System**: Category dropdown selector + dynamic tag chips with enter-to-add and remove buttons.
- **Writing Intelligence**: Real-time word count, character counter, and estimated reading time.
- **Draft Resilience**: Automatic local draft caching so ideas are never lost on accidental tab closes. Save stories as drafts or publish instantly.
- **Full Article Editing**: Edit existing stories, update tags, modify text, or manage drafts directly from your profile.

### 2. 📖 Immersive Reading Experience
- **Top Reading Progress Bar**: Smooth, real-time scroll progress indicator at the top of the viewport.
- **Floating Action Dock**: Sticky desktop side dock and mobile bottom dock featuring:
  - Interactive Likes / Claps with heart-pulse animations and persistent counters
  - Bookmarking toggle
  - Quick jump to discussion thread with counter badge
  - Share modal (copy direct link, share to Twitter/X & LinkedIn)
  - Author controls (Edit & Delete buttons for post owners)
- **Auto-Generated Table of Contents**: Automatically extracts `##` and `###` headers from markdown content with smooth anchor scrolling.
- **Typography & Code Highlighting**:
  - High-contrast code blocks with syntax language badge and one-click **"Copy Code"** button.
  - Styled blockquotes with accent indicators.
  - Responsive inline images with captions.
- **Author Bio & Recommendations**: Author card with "Follow" toggle and a "Recommended Stories" strip.

### 3. 💬 Interactive Threaded Commenting
- **Real-Time Commenting**: Add comments formatted with markdown.
- **Threaded Replies**: Inline reply boxes supporting multi-tier conversation threads.
- **Comment Likes**: Like and appreciate comments independently.
- **Author Recognition**: Displays an **"Author"** badge when the article writer participates in the discussion.
- **Self-Management**: Comment authors can delete their own remarks with confirmation.

### 4. 🔍 Discovery, Search & Category Filtering
- **Instant Search**: Debounced live search querying titles, subtitles, content, author names, and tags.
- **Category Filter Pills**: Quick toggle across *All*, *Technology*, *Design*, *Engineering*, *Artificial Intelligence*, and *Productivity*.
- **Topic Cloud**: Popular tags cloud with frequency count pills (e.g., `#webdev`, `#architecture`, `#ai`, `#javascript`).
- **Flexible Sorting**: Sort stories by *Newest First*, *Most Liked*, *Trending / Active*, *Short Reads (< 4m)*, *Deep Dives (> 5m)*, or *Oldest First*.
- **Featured Hero Banner**: Prominent showcase story on the default discovery feed.
- **Empty States**: Helpful illustrations and "Reset Filters" action when queries yield no results.

### 5. 🔖 Reading List & Bookmarks
- Dedicated bookmarks view to access saved stories anytime.
- Real-time navbar bookmark counter badge.
- Instant search within saved articles.
- One-click removal with toast notifications.

### 6. 👤 User Profile & Metrics
- **Author Dashboard**: Quantitative metrics ribbon tracking:
  - Published Stories count
  - Total Likes received across all authored articles
  - Total View impressions
  - Total Community responses
- **Organized Tabs**: *Published*, *Drafts* (private to owner), *Liked Stories*, and *Saved / Bookmarks*.
- **Edit Profile Modal**: Customize display name, `@username` handle, professional title, personal bio, avatar image, location, and website.

### 7. 💾 Local-First Storage & Data Management
- **100% Client-Side Persistence**: Built on a robust `StorageService` using `localStorage`.
- **Pre-seeded Realistic Demo Content**: 5 rich, high-quality technical articles with comments, claps, tags, and realistic author avatars.
- **Data Backup & Restore**:
  - **Export JSON**: Download a complete backup of all articles, drafts, bookmarks, comments, and profile data in 1 click.
  - **Import JSON**: Restore or transfer content from any backup file.
  - **Reset to Demo Data**: Reset to pristine factory state with confirmation protection.

### 8. 🎨 Design System & Accessibility
- **CSS Custom Properties**: Fully tokenized design tokens for spacing, elevation shadows, radii, and typography.
- **Dark & Light Mode**: Instant toggle with automatic OS preference detection (`prefers-color-scheme`) and saved preference in `localStorage`.
- **Zero External Icon Fonts**: Crisp, self-contained SVG icon system that renders offline with zero network latency.
- **Fluid Responsiveness**: Tailored layouts for desktops, tablets, and smartphones (including a slide-over mobile drawer and sticky bottom dock).
- **Toast Notifications & Accessible Modals**: Floating feedback toasts with auto-dismiss progress bars and keyboard-friendly modals (ESC key dismissal, backdrop dismiss, and focus management).

---

## 📁 Project Architecture

```
blong/
├── index.html                   # Semantic HTML shell, navbar, and SPA view containers
├── package.json                 # Project configuration & npm scripts
├── test_suite.js                # Automated unit & integration tests
├── css/
│   ├── variables.css            # Design tokens, color palettes (light/dark), typography scales
│   ├── base.css                 # Global reset, headings, custom scrollbars, selection
│   ├── components.css           # Buttons, badges, toasts, modals, inputs, empty states
│   ├── layout.css               # Header navigation, brand logo, user menu, mobile drawer
│   ├── feed.css                 # Hero card, category scroll, search/sort toolbar, sidebar
│   ├── article.css              # Reading progress bar, floating dock, TOC, comments thread
│   ├── editor.css               # Markdown toolbar, write/preview panes, image presets, tags
│   ├── profile.css              # Banner, avatar, stats ribbon, tabs, drafts cards
│   └── responsive.css           # Responsive breakpoints for tablets and mobile devices
└── js/
    ├── app.js                   # Application bootstrapper, theme engine, global nav
    ├── data/
    │   └── defaultData.js       # Pre-seeded articles, categories, cover image presets
    ├── services/
    │   ├── storage.js           # LocalStorage CRUD engine, likes, bookmarks, comments
    │   ├── markdown.js          # Markdown-to-HTML parser, TOC extractor, date formatters
    │   └── router.js            # Hash-based SPA client router with history navigation
    ├── components/
    │   ├── icons.js             # Vector SVG icon library
    │   ├── toast.js             # Toast notification manager
    │   └── modal.js             # Modal and confirm dialog manager
    └── views/
        ├── feedView.js          # Discovery stream, hero card, search, sort & filters
        ├── articleView.js       # Reader, reading progress, TOC, comments, claps
        ├── editorView.js        # Markdown editor, presets, file upload, draft persistence
        ├── bookmarksView.js     # Saved reading list management
        └── profileView.js       # Profile dashboard, stats ribbon, drafts, profile editing
```

---

## 🚀 Getting Started

Since Pulse is built purely with standard HTML5, CSS3, and modern ES6 JavaScript modules, it requires **no build tools, bundlers, or compilers**.

### Option A: Using Python (Recommended)
Open a terminal in the project directory and run:
```bash
python -m http.server 8080
```
Then visit **`http://localhost:8080`** in any modern web browser.

### Option B: Using Node.js
If you have Node.js installed, you can run:
```bash
npm start
```
or use `npx serve`:
```bash
npx serve .
```

---

## 🧪 Automated Testing

A complete automated unit and integration test suite is included in `test_suite.js`. It validates markdown parsing, heading anchor generation, storage initialization, article creation/updating/deletion, category filtering, search, likes, bookmarks, and threaded comments:

```bash
npm test
```
*Expected result:*
```
Testing Markdown Parser...
✔ Markdown Parser passed!
Testing Storage Service...
✔ Initial seed verified: 5 posts loaded
✔ Category filtering verified: 1 Technology posts
✔ Search query verified: found 1 matches
✔ Tag filter verified: found 1 matches
✔ Post creation verified
✔ Likes toggling verified!
✔ Bookmarking verified!
✔ Threaded commenting verified!
✔ Post update verified!
✔ Post deletion verified!
✔ User profile & stats verified!
✔ Export and Import verified!

🎉 ALL UNIT & INTEGRATION TESTS PASSED WITH 100% SUCCESS!
```

