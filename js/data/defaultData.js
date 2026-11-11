/**
 * Default Seed Data for the Blogging Platform
 * Rich articles with realistic content, metadata, comments, and author profiles.
 */

export const DEFAULT_CURRENT_USER = {
  id: 'user_current',
  name: 'Alex Rivera',
  handle: 'alexrivera',
  title: 'Full-stack Architect & Tech Essayist',
  bio: 'Building resilient web systems, experimenting with local-first software, and writing about human-centered interface design.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  location: 'San Francisco, CA',
  website: 'https://alexrivera.dev',
  twitter: 'alexrivera_dev',
  github: 'alexrivera',
  joinedDate: 'January 2024'
};

export const DEFAULT_POSTS = [
  {
    id: 'post-1',
    title: 'The Architecture of Modern Frontend: Beyond Framework Fatigue',
    subtitle: 'Why the future of client-side engineering favors primitives, web standards, and composable systems over monolithic toolchains.',
    slug: 'architecture-of-modern-frontend',
    category: 'Technology',
    tags: ['webdev', 'architecture', 'javascript', 'frontend'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    content: `# The Architecture of Modern Frontend: Beyond Framework Fatigue

For the past decade, web engineering has lived in a cycle of relentless pendulum swings. We swung from server-rendered HTML into massive client-side SPAs, bundled gigabytes of vendor scripts, and subsequently devised complex server-side hydration hydras to mitigate the performance penalties we imposed upon ourselves.

Today, however, an exciting equilibrium is crystallizing. The most compelling modern web applications aren't defined by which mega-framework they bind themselves to; they are defined by **primitives, local state resilience, and deep respect for browser capabilities**.

---

## 1. The Real Cost of Unnecessary Abstraction

Every layer of abstraction promises leverage, but levies a tax. In frontend systems, that tax manifests as:

1. **Hydration Mismatch overhead** – shipping duplicate JSON payloads to reconstruct a DOM already painted by the server.
2. **Bundle churn** – upgrading dependencies every six months just to maintain security patches.
3. **Cognitive lock-in** – junior developers learning a proprietary DSL instead of understanding HTTP, DOM events, and CSS layout algorithms.

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

Consider this simple pattern for reactive DOM updates using pure standard browser mechanisms:

\`\`\`javascript
// Minimal reactive signal in standard JavaScript
export function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  const get = () => value;
  const set = (nextValue) => {
    value = typeof nextValue === 'function' ? nextValue(value) : nextValue;
    subscribers.forEach(fn => fn(value));
  };

  const subscribe = (fn) => {
    subscribers.add(fn);
    fn(value);
    return () => subscribers.delete(fn);
  };

  return [get, set, subscribe];
}
\`\`\`

Notice how zero build tools or polyfills are required. The browser is already an astonishingly competent runtime.

---

## 2. The Local-First Renaissance

Users expect web applications to feel instantaneous, regardless of their subway commute or spotty coffee shop Wi-Fi. The prevailing request-response mental model is giving way to **Local-First architecture**:

- **Read locally first**: Always fetch data from IndexedDB or LocalStorage before pinging a network socket.
- **Write optimistically**: Update the UI synchronously in 16 milliseconds; dispatch background synchronization tasks quietly.
- **Conflict resolution**: Treat offline not as an exceptional edge case, but as a normal operating state.

\`\`\`
[User Action] ──> [Instant Local State / Storage] ──> [Optimistic UI Paint (0ms)]
                           │
                           ▼ (Background Sync)
                    [Cloud Endpoint]
\`\`\`

## 3. Composable Design Systems

Modern CSS with container queries, \`:has()\` selectors, and custom properties has eliminated 80% of the CSS-in-JS runtimes that plagued mid-2010s codebases. Writing clean, tokenized CSS without runtime overhead gives our users 60fps scrolling and our battery life back.

### The Takeaway

Focus on fundamentals. Code written to browser specifications outlives frameworks by decades. When you build with clarity and respect for the platform, performance is not an afterthought—it's the default.`,
    author: {
      id: 'user_current',
      name: 'Alex Rivera',
      handle: 'alexrivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: 'Full-stack Architect'
    },
    createdAt: '2026-11-08T10:30:00Z',
    updatedAt: '2026-11-09T14:15:00Z',
    likesCount: 142,
    readingTime: '5 min read',
    viewsCount: 1890,
    status: 'published',
    comments: [
      {
        id: 'c-101',
        author: {
          name: 'Elena Rostova',
          handle: 'elena_ux',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
        },
        content: 'This aligns so closely with our recent migration away from heavy SSR setups. Going local-first reduced our p95 latencies from 420ms down to near 0 for active sessions.',
        createdAt: '2026-11-08T14:20:00Z',
        likesCount: 19,
        replies: [
          {
            id: 'c-101-r1',
            author: {
              name: 'Alex Rivera',
              handle: 'alexrivera',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            },
            content: 'Spot on, Elena! Once teams experience the sheer speed and reliability of optimistic local caches, going back to loading spinners feels unacceptable.',
            createdAt: '2026-11-08T15:10:00Z',
            likesCount: 8
          }
        ]
      },
      {
        id: 'c-102',
        author: {
          name: 'Marcus Vance',
          handle: 'marcus_v',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        },
        content: 'The CSS :has() selector alone replaced almost 300 lines of state tracking in our form validation library. Great write-up.',
        createdAt: '2026-11-09T08:45:00Z',
        likesCount: 12,
        replies: []
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Designing for Flow: Why Micro-interactions Define Digital Craft',
    subtitle: 'The subtle animations, soundscapes, and physics-driven spring mechanics that separate clinical software from beloved tools.',
    slug: 'designing-for-flow-micro-interactions',
    category: 'Design',
    tags: ['design', 'ui-ux', 'animation', 'craft'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    content: `# Designing for Flow: Why Micro-interactions Define Digital Craft

We rarely remember software for its database schema or its cloud provider. We remember software for how it **felt** when we pressed a key, dragged an element, or completed a challenging workflow.

True digital craft lives in the liminal spaces—the 150 milliseconds between intent and confirmation.

## The Anatomy of an Unforgettable Micro-interaction

Every satisfying micro-interaction obeys four fundamental principles:

1. **Trigger** – The visual or tactile initiation (hover, tap, scroll).
2. **Rule** – What happens behind the scenes (state toggle, payload prep).
3. **Feedback** – The sensory acknowledgement that the system recognized you.
4. **Loops & Modes** – How the behavior shifts when context alters.

> "Details make perfection, and perfection is not a detail." — Leonardo da Vinci

### Spring Physics Over Linear Easing

Human eyes reject rigid linear animations because nothing in the physical universe accelerates or stops instantly. Physical momentum, mass, and dampening provide intuitive comfort.

\`\`\`css
/* Spring-inspired cubic-bezier for snappy yet fluid transitions */
.action-button {
  transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 220ms ease;
}

.action-button:active {
  transform: scale(0.96);
}
\`\`\`

When you give a button realistic resistance, users develop subconscious muscle memory. The tool ceases to be a barrier and becomes an extension of thought.

## Reducing Mental Friction

- **Progressive Disclosure**: Show only what the user needs at this exact heartbeat.
- **Contextual Anchors**: Animate dialogs out from the button that spawned them rather than jarringly popping up from the center of the viewport.
- **Delightful Error States**: When validation fails, don't just flash harsh red text—shake the field softly like a gentle physical refusal.

When you craft each micro-interaction with empathy, software transforms from a tedious chore into a creative instrument.`,
    author: {
      id: 'user_maya',
      name: 'Maya Lin',
      handle: 'mayadesign',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      title: 'Principal Product Designer'
    },
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    likesCount: 98,
    readingTime: '4 min read',
    viewsCount: 1420,
    status: 'published',
    comments: [
      {
        id: 'c-201',
        author: {
          name: 'Devin Thorne',
          handle: 'devin_t',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
        },
        content: 'The note about contextual anchors is gold. It keeps the spatial orientation intact so users never lose their train of thought.',
        createdAt: '2026-11-06T09:12:00Z',
        likesCount: 14,
        replies: []
      }
    ]
  },
  {
    id: 'post-3',
    title: 'Demystifying Local-First Software: SQLite, CRDTs, and the Web',
    subtitle: 'How bringing full-scale relational databases into browser memory is revolutionizing offline collaboration.',
    slug: 'demystifying-local-first-software',
    category: 'Engineering',
    tags: ['engineering', 'database', 'localfirst', 'performance'],
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    content: `# Demystifying Local-First Software: SQLite, CRDTs, and the Web

Until recently, running a full SQL database inside a web browser was either considered a bizarre novelty or an absurd waste of RAM. 

With WebAssembly (Wasm) and Origin Private File System (OPFS), that assumption has been shattered. We can now execute complex relational queries, join multiple tables, and persist gigabytes of encrypted user data directly on the client machine at native C-speed.

## Why Client-Side Relational Storage Matters

When your client has a real database:

- **Zero-latency queries**: Filters, searches, and sorts execute locally in microseconds.
- **Offline by default**: Airplane mode or tunnel disconnections are no longer catastrophic.
- **Privacy and sovereignty**: Sensitive documents never need to leave the client device unless the user explicitly shares them.

### Conflict-Free Replicated Data Types (CRDTs)

How do multiple offline collaborators merge edits when they reconnect? CRDTs provide mathematically guaranteed convergence without requiring a central coordinator locking rows.

\`\`\`
State A: "Hello World"  ──> Edit: "Hello Beautiful World"
                                         ↘
                                           [Deterministic Merge] ──> "Hello Beautiful Wonderful World"
                                         ↗
State B: "Hello World"  ──> Edit: "Hello Wonderful World"
\`\`\`

By combining CRDT logs with persistent local SQLite snapshots, modern web apps attain the collaborative superpower of Google Docs with the raw speed of a desktop native binary.`,
    author: {
      id: 'user_david',
      name: 'David Chen',
      handle: 'dchen_codes',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      title: 'Systems & Distributed Engine Lead'
    },
    createdAt: '2026-11-02T16:45:00Z',
    updatedAt: '2026-11-03T11:20:00Z',
    likesCount: 215,
    readingTime: '6 min read',
    viewsCount: 3100,
    status: 'published',
    comments: [
      {
        id: 'c-301',
        author: {
          name: 'Sarah Connor',
          handle: 'sarah_c',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
        },
        content: 'OPFS is one of the most underrated browser APIs shipped in the last 5 years. The I/O throughput is astounding compared to IndexedDB.',
        createdAt: '2026-11-03T18:00:00Z',
        likesCount: 27,
        replies: []
      }
    ]
  },
  {
    id: 'post-4',
    title: 'The Next Horizon of Generative AI: From Prompts to Autonomous Workflows',
    subtitle: 'Moving past simple conversational chat windows toward multi-agent coordination and self-correcting pipelines.',
    slug: 'next-horizon-generative-ai',
    category: 'Artificial Intelligence',
    tags: ['ai', 'machine-learning', 'agents', 'future'],
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    content: `# The Next Horizon of Generative AI: From Prompts to Autonomous Workflows

The early phase of generative AI was dominated by the text prompt box: a single human typing a query, waiting for a completion, and iteratively refining phrasing.

We are now witnessing the transition into the **agentic epoch**—where models don't just output tokens, but orchestrate actions, inspect their own outputs, execute sandboxed code, and recover from errors autonomously.

## The Pillars of Autonomous Workflows

- **Decomposition**: Breaking a broad ambition ("Audit this codebase for memory leaks") into targeted sub-tasks.
- **Tool Interoperability**: Calling REST APIs, querying vector indexes, and manipulating file trees via standardized schema (like Model Context Protocol).
- **Reflective Verification**: Validating output against formal test runners before presenting results to human overseers.

> The most impactful AI systems will not replace human ambition; they will compress the friction between intent and realization to zero.`,
    author: {
      id: 'user_sophia',
      name: 'Dr. Sophia Sterling',
      handle: 'sophiastech',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      title: 'AI Research Director'
    },
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
    likesCount: 178,
    readingTime: '4 min read',
    viewsCount: 2450,
    status: 'published',
    comments: []
  },
  {
    id: 'post-5',
    title: 'Finding Focus in an Age of Infinite Feeds: A Developer’s Protocol',
    subtitle: 'Practical tactics to protect deep cognitive work, eliminate asynchronous alert fatigue, and regain joyful mastery.',
    slug: 'finding-focus-in-age-of-infinite-feeds',
    category: 'Productivity',
    tags: ['productivity', 'habits', 'career', 'focus'],
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    content: `# Finding Focus in an Age of Infinite Feeds: A Developer’s Protocol

Knowledge workers operate in an environment weaponized against deep attention. Notification badges, chat pings, continuous deployment alerts, and algorithmic feeds fragment our working memory into 3-minute slivers.

Yet, high-value creative output requires sustained, unbroken immersion. Here is the daily operating protocol that protected my output and mental peace.

## 1. Batching Communication into Bounded Windows

Never leave Slack, Teams, or email open on a secondary monitor. Turn off background notification sounds. Check communication only three times a day:
- 11:30 AM (Mid-morning sweep)
- 2:30 PM (Mid-afternoon coordination)
- 5:00 PM (End-of-day signoffs)

## 2. The 90-Minute Focus Monolith

Plan your primary technical task before you open your laptop in the morning. Put your phone in another room, set a physical countdown timer for 90 minutes, and write code until the bell rings. You will achieve more in those 90 minutes than most do in an eight-hour day of multi-tasking.`,
    author: {
      id: 'user_current',
      name: 'Alex Rivera',
      handle: 'alexrivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: 'Full-stack Architect'
    },
    createdAt: '2026-10-20T14:00:00Z',
    updatedAt: '2026-10-20T14:00:00Z',
    likesCount: 312,
    readingTime: '3 min read',
    viewsCount: 4210,
    status: 'published',
    comments: [
      {
        id: 'c-501',
        author: {
          name: 'Liam Vance',
          handle: 'liamv',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
        },
        content: 'The 90-minute monolith has completely turned my week around. No meetings allowed before noon in our team now!',
        createdAt: '2026-10-21T10:15:00Z',
        likesCount: 16,
        replies: []
      }
    ]
  }
];

export const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Engineering',
  'Artificial Intelligence',
  'Productivity'
];

export const COVER_PRESETS = [
  { name: 'Coding & Terminal', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Minimal Design Desk', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cyber Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Abstract Hologram', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Serene Nature & Focus', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' }
];

