# UsapUs - Design Documentation

## Document Information
- **Project Name:** UsapUs - Modern Messaging Application
- **Version:** 1.0
- **Last Updated:** January 19, 2026
- **Document Type:** UI/UX Design Specification

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Visual Identity](#2-visual-identity)
3. [User Interface Screens](#3-user-interface-screens)
4. [Component Library](#4-component-library)
5. [Responsive Design](#5-responsive-design)
6. [Interaction Design](#6-interaction-design)
7. [Accessibility](#7-accessibility)

---

## 1. Design Philosophy

### 1.1 Core Principles
UsapUs follows a modern, clean, and user-centric design approach that emphasizes:

- **Simplicity:** Minimalist interface that reduces cognitive load
- **Clarity:** Clear visual hierarchy and intuitive navigation
- **Consistency:** Unified design language across all features
- **Responsiveness:** Seamless experience across all device sizes
- **Accessibility:** Inclusive design for all users

### 1.2 Design Goals
- Create an inviting and friendly messaging experience
- Ensure fast visual comprehension of interface elements
- Maintain focus on content and conversations
- Provide delightful micro-interactions and animations
- Support both light and dark usage contexts

---

## 2. Visual Identity

### 2.1 Color Palette

#### Primary Colors
```css
Mint Green (Primary):
- Hue: 142
- Saturation: 76%
- Lightness: 36%
- Hex: #16a34a (light mode)

Primary Variations:
- primary/90: Slightly darker for hover states
- primary/80: Medium shade for active states
- primary/10: Light tint for backgrounds
```

#### Neutral Colors
```css
Light Mode:
- Background: White (#ffffff)
- Card Background: #f9fafb
- Text Primary: #0f172a
- Text Secondary: #64748b
- Border: #e2e8f0

Dark Mode:
- Background: #0f172a
- Card Background: #1e293b
- Text Primary: #f8fafc
- Text Secondary: #94a3b8
- Border: #334155
```

#### Semantic Colors
```css
Success: #22c55e (Green)
Error/Destructive: #ef4444 (Red)
Warning: #f59e0b (Amber)
Info: #3b82f6 (Blue)
```

### 2.2 Typography

#### Font Families
- **Primary Font:** Geist Sans (system default fallback)
- **Monospace Font:** Geist Mono (for code/technical content)

#### Type Scale
```css
Display: 3rem (48px) - Large headings
H1: 2rem (32px) - Page titles
H2: 1.5rem (24px) - Section headings
H3: 1.25rem (20px) - Subsection headings
Body: 1rem (16px) - Default text
Small: 0.875rem (14px) - Secondary text
Tiny: 0.75rem (12px) - Labels and captions
```

#### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### 2.3 Spacing System
UsapUs uses a consistent 4px base unit spacing system:
```
0.5: 2px
1: 4px
2: 8px
3: 12px
4: 16px
6: 24px
8: 32px
12: 48px
16: 64px
```

### 2.4 Elevation & Shadows
```css
Shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Shadow-md: 0 4px 6px rgba(0,0,0,0.1)
Shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
Shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
```

### 2.5 Border Radius
```css
sm: 0.375rem (6px) - Small elements
md: 0.5rem (8px) - Default
lg: 0.75rem (12px) - Cards
xl: 1rem (16px) - Large containers
2xl: 1.5rem (24px) - Message bubbles
full: 9999px - Circular elements
```

---

## 3. User Interface Screens

All screen mockups are available in the `/images` directory. Below are detailed descriptions of each major screen.

### 3.1 Authentication Screen
**File:** `images/authscreen.png`

**Description:**
The authentication screen serves as the entry point for users.

**Key Elements:**
- Large UsapUs logo with mint green accent
- Tagline: "Modern Messaging Made Simple"
- Prominent "Sign In to Start Chatting" button
- Clean, centered layout with ample whitespace
- Clerk authentication modal integration

**Visual Characteristics:**
- Minimalist design focusing on the call-to-action
- Large emoji (💬) for visual appeal
- Smooth gradient background
- Welcoming and friendly tone

---

### 3.2 Start/Welcome Screen
**File:** `images/startscreen.png`

**Description:**
The initial screen users see after authentication, before selecting a conversation.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Sidebar (320px)      │  Main Area       │
│                      │                   │
│ • Header with logo   │  Welcome message  │
│ • Navigation tabs    │  Large emoji (💬) │
│ • Conversation list  │  Action buttons   │
│ • Friend requests    │                   │
│                      │                   │
└─────────────────────────────────────────┘
```

**Key Elements:**
- **Left Sidebar:**
  - UsapUs branding
  - Theme toggle button
  - Notification bell with badge
  - User profile button
  - Three-tab navigation: Chats, Friends, Find
  - Scrollable conversation list
  - New group creation button

- **Main Area:**
  - Large centered welcome message
  - Call-to-action buttons
  - Empty state illustration

**Responsive Behavior:**
- On mobile: Shows only sidebar initially
- Sidebar slides out when conversation selected

---

### 3.3 Chat Screen
**File:** `images/chatscreen.png`

**Description:**
The primary messaging interface where users engage in conversations.

**Layout:**
```
┌──────────────────────────────────────────────┐
│ Chat Header                                  │
│ [Avatar] Contact Name       [🔊] [📹] [⋮]   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────┐                       │
│  │ Received Message │                       │
│  └──────────────────┘                       │
│                                              │
│                       ┌──────────────────┐  │
│                       │   Sent Message   │  │
│                       └──────────────────┘  │
│                                              │
├──────────────────────────────────────────────┤
│ [📷] [📎] [😊] Message Input      [Send ⬆]│
└──────────────────────────────────────────────┘
```

**Key Components:**

**Chat Header:**
- Contact avatar (circular, 40px)
- Contact name (bold, truncated)
- Status text (online/typing/offline)
- Call buttons (voice, video)
- Options menu (three dots)

**Message Area:**
- Scrollable message container
- Messages grouped by sender
- Avatars show only on first message in group
- Timestamp on hover/tap
- Message actions on hover (react, reply)
- Smooth auto-scroll to latest message

**Message Bubbles:**
- **Sent messages:**
  - Right-aligned
  - Primary (mint green) background
  - White text
  - Rounded corners with tail on bottom-right
  - Read receipt checkmarks

- **Received messages:**
  - Left-aligned
  - Accent background (light gray)
  - Dark text
  - Rounded corners with tail on bottom-left
  - Sender avatar

**Message Types:**
- Text: Standard bubble with content
- Image: Inline preview with rounded corners
- File: Attachment card with icon and metadata
- Voice: Audio player with waveform visualization
- Reply: Shows quoted message above content
- Reactions: Emoji bubbles below message

**Input Area:**
- Attachment buttons (image, file)
- Emoji picker button
- Text input field with placeholder
- Send button (transforms to mic for voice messages)
- Reply preview (dismissible)

---

### 3.4 Group Chat Screen
**File:** `images/groupchatscreen.png`

**Description:**
Similar to individual chat but optimized for group conversations.

**Distinctive Features:**
- Group avatar (composite or single image)
- Member count displayed in header
- Sender names shown above messages
- Multiple avatars in message flow
- Group info accessible via header

**Group Creation Dialog:**
- Group name input field
- Member selection interface
- Scrollable friend list with checkboxes
- Selected member count badge
- Create button with member preview

---

### 3.5 Voice Call Screen
**File:** `images/voicecallscreen.png`

**Description:**
Full-screen interface for voice calls.

**Layout:**
```
┌────────────────────────┐
│                        │
│    [Large Avatar]      │
│                        │
│    Contact Name        │
│    Voice Call          │
│    00:45              │
│                        │
│                        │
│  [🎤] [🔊] [📞]       │
│                        │
└────────────────────────┘
```

**Visual Characteristics:**
- Full-screen gradient background (primary color)
- Large centered avatar (128px)
- Contact name (prominent typography)
- Call duration timer (monospace font)
- "Calling..." or active call status

**Controls:**
- Mute/Unmute button (microphone icon)
- Speaker toggle (speaker icon)
- End call button (red, prominent)
- Circular button style
- Clear visual feedback for states

**States:**
- Outgoing: "Calling..." with pulsing animation
- Incoming: Large accept/reject buttons
- Active: Timer and full controls visible

---

### 3.6 Video Call Screen
**File:** `images/videocallscreen.png`

**Description:**
Full-screen video calling interface.

**Layout:**
```
┌────────────────────────────────┐
│ Remote Video Stream (Full)     │
│                                │
│  ┌──────────────┐              │
│  │ Local Video  │              │
│  │ (PIP)        │              │
│  └──────────────┘              │
│                                │
│  Contact Name    00:45         │
│  [🎤] [📹] [🔊] [📞]          │
└────────────────────────────────┘
```

**Key Features:**
- Full-screen remote video
- Picture-in-picture local video (top-right)
- Semi-transparent control overlay (bottom)
- Video toggle button (camera icon)
- All voice call controls included

**Video States:**
- Camera on: Live video stream
- Camera off: Avatar with indicator
- Loading: Placeholder with spinner

---

## 4. Component Library

UsapUs uses shadcn/ui components built on Radix UI primitives. All components are customized with the application's design system.

### 4.1 Core Components

#### Button
**Variants:**
- `default`: Primary mint green background
- `secondary`: Gray background
- `outline`: Transparent with border
- `ghost`: Transparent, hover effect only
- `destructive`: Red for dangerous actions

**Sizes:** sm (small), md (default), lg (large), icon (square)

**States:** default, hover, active, disabled, loading

#### Avatar
- Circular container with fallback initials
- Supports image loading with graceful fallback
- Status indicator dot (online/offline)
- Multiple sizes: xs (24px), sm (32px), md (40px), lg (48px), xl (64px)

#### Badge
- Pill-shaped indicator for counts/status
- Variants: default, secondary, destructive, outline
- Used for: unread counts, notification badges, status labels

#### Card
- Container with border and shadow
- Header, content, and footer sections
- Used for: friend lists, settings panels

#### Dialog/Modal
- Overlay with centered content box
- Backdrop blur effect
- Close button (X) in header
- Smooth enter/exit animations

#### Dropdown Menu
- Triggered by button or icon
- List of clickable options
- Supports icons and keyboard navigation
- Smooth slide-in animation

#### Input
- Text input with focus states
- Placeholder text styling
- Error state with red border
- Prefix/suffix icon support

#### ScrollArea
- Custom scrollbar styling
- Smooth scrolling behavior
- Thin scrollbar design
- Auto-hide on inactive

#### Switch
- Toggle control for binary options
- Used for theme switching
- Smooth transition animation
- Clear on/off states

### 4.2 Custom Components

#### MessageBubble
- Displays individual messages
- Dynamic styling based on sender
- Supports all message types
- Reaction and reply rendering

#### MessageInput
- Composite input with multiple controls
- File upload handling
- Emoji picker integration
- Voice recording capability

#### ConversationItem
- List item for conversations
- Avatar, name, last message preview
- Unread badge
- Timestamp
- Active state highlighting

#### CallInterface
- Full-screen call overlay
- Control buttons
- Timer display
- Video stream containers

#### ThemeToggle
- Sun/moon icon toggle
- Smooth theme transition
- Persists preference

---

## 5. Responsive Design

### 5.1 Breakpoint Strategy

#### Mobile First Approach
Base styles target mobile devices, with progressive enhancement for larger screens.

**Breakpoints:**
```css
sm:  640px  /* Large phones */
md:  768px  /* Tablets */
lg:  1024px /* Small laptops */
xl:  1280px /* Desktops */
2xl: 1536px /* Large screens */
```

### 5.2 Layout Adaptations

#### Mobile (< 768px)
- Single column layout
- Sidebar fills full width
- Chat view fills full width when active
- Hamburger menu for navigation
- Stacked buttons
- Collapsed menu items
- Touch-optimized button sizes (min 44px)

#### Tablet (768px - 1024px)
- Sidebar remains visible (320px)
- Chat area takes remaining space
- Icon + text buttons
- Side-by-side layout

#### Desktop (> 1024px)
- Full sidebar (320px fixed)
- Expanded chat area
- All features visible
- Hover states enabled
- Multi-column potential for settings

### 5.3 Component Responsiveness

**Examples:**
```css
/* Avatar sizes */
.avatar {
  @apply h-8 w-8 md:h-10 md:w-10;
}

/* Text sizes */
.heading {
  @apply text-xl md:text-2xl lg:text-3xl;
}

/* Padding */
.container {
  @apply p-2 md:p-4 lg:p-6;
}

/* Button visibility */
.call-button {
  @apply hidden md:flex;
}
```

---

## 6. Interaction Design

### 6.1 Micro-interactions

#### Button Interactions
- **Hover:** Slight darkening, subtle scale (102%)
- **Active:** Further darkening, scale (98%)
- **Disabled:** Reduced opacity (50%), cursor not-allowed

#### Message Sending
1. User types and presses send
2. Message appears immediately with sending indicator
3. Smooth scroll to new message
4. Checkmark appears when delivered
5. Double checkmark when read

#### Typing Indicator
- Animated three-dot bubble
- Appears below last message
- Shows "User is typing..." text in header

#### Reactions
- Hover over message shows reaction button
- Click opens emoji picker
- Selected emoji animates in
- Multiple reactions group together

### 6.2 Animations

**Transition Timings:**
- Fast: 150ms (hover states, small UI changes)
- Normal: 300ms (page transitions, modals)
- Slow: 500ms (large animations, page loads)

**Easing Functions:**
- ease-in-out: Default for most transitions
- ease-out: Enter animations
- ease-in: Exit animations
- spring: Bouncy effects (reactions, notifications)

**Animation Examples:**
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 6.3 Loading States

- **Initial Load:** Full-page spinner with logo
- **Message Loading:** Skeleton messages
- **Image Loading:** Placeholder with spinner
- **Button Loading:** Spinner inside button, text changes
- **Infinite Scroll:** Load more indicator at bottom

### 6.4 Error States

- **Network Error:** Toast notification with retry button
- **Send Failure:** Red indicator on message, retry option
- **Form Errors:** Inline validation messages, red borders
- **404/Empty States:** Friendly illustrations with guidance

---

## 7. Accessibility

### 7.1 Color Contrast

All text meets WCAG AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: Clear focus indicators

### 7.2 Keyboard Navigation

- All interactive elements are keyboard accessible
- Logical tab order throughout application
- Visible focus indicators (ring-2 ring-primary)
- Escape key closes modals/dialogs
- Enter key submits forms/sends messages

### 7.3 Screen Reader Support

- Semantic HTML elements
- ARIA labels on icon-only buttons
- Alt text on images
- Live regions for dynamic content
- Skip navigation links

### 7.4 Touch Targets

- Minimum size: 44x44px (mobile)
- Adequate spacing between targets
- Touch feedback on interaction
- Swipe gestures where appropriate

### 7.5 Theme Accessibility

**Dark Mode Considerations:**
- Slightly reduced contrast to prevent eye strain
- Muted colors instead of pure black/white
- Consistent visual hierarchy
- Readable text on all backgrounds

---

## 8. Design System Resources

### 8.1 Icon Set
**Lucide React** - Consistent, minimal icon family
- 16px and 20px standard sizes
- 24px for larger UI elements
- Stroke width: 2px
- Customizable via className

### 8.2 Emoji Support
**emoji-picker-react** - Cross-platform emoji picker
- Native emoji rendering
- Search functionality
- Category organization
- Skin tone variants

### 8.3 Date Formatting
**date-fns** - Relative time display
- "just now", "2m ago", "Yesterday"
- Full timestamps on hover
- Locale support

---

## 9. Best Practices

### 9.1 Component Usage
- Keep components small and focused
- Use composition over configuration
- Implement proper TypeScript types
- Follow React best practices
- Use hooks for stateful logic

### 9.2 Styling Guidelines
- Use Tailwind utility classes
- Create custom classes for repeated patterns
- Maintain consistent spacing
- Use design tokens (CSS variables)
- Keep specificity low

### 9.3 Performance
- Lazy load images and media
- Virtualize long lists
- Debounce search inputs
- Optimize re-renders
- Code splitting for routes

---

## 10. Design Rationale

### 10.1 Color Choice: Mint Green
- **Reason:** Fresh, modern, and friendly
- **Psychology:** Trust, growth, and communication
- **Differentiation:** Stands out from typical blue messaging apps
- **Versatility:** Works well in both light and dark modes

### 10.2 Layout Decisions
- **Sidebar:** Persistent navigation reduces cognitive load
- **Single Column (Mobile):** Focuses attention on one task
- **Card-based:** Clear content boundaries
- **Whitespace:** Improves readability and reduces clutter

### 10.3 Typography
- **Sans-serif:** Modern, clean, highly readable on screens
- **System fonts:** Fast loading, native feel
- **Scale:** Clear hierarchy guides user attention

---

## 11. Future Design Considerations

### 11.1 Planned Enhancements
- Custom theme creator
- More animation options
- Advanced emoji reactions
- Stickers and GIF integration
- Message formatting (bold, italic, code)
- Custom avatar decorations

### 11.2 Potential Features
- Stories/Status updates
- Chat wallpapers
- Custom chat colors per conversation
- Widget/mini mode
- Compact/comfortable view density options

---

## 12. Design Assets

### 12.1 Image Directory
All design mockups and screenshots are located in `/images/`:

- `authscreen.png` - Authentication and login screen
- `startscreen.png` - Welcome/home screen
- `chatscreen.png` - Individual chat interface
- `groupchatscreen.png` - Group conversation interface
- `voicecallscreen.png` - Voice call UI
- `videocallscreen.png` - Video call UI

### 12.2 Design Tools
- **Figma:** (If applicable) For collaborative design work
- **Browser DevTools:** For testing responsive designs
- **Accessibility Tools:** For contrast and screen reader testing

---

## 13. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 19, 2026 | Design Team | Initial design documentation |

---

**End of Design Document**
