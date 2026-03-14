# SmartEDU ERP - Visual Component Gallery

## 🎨 Complete Visual Guide to All Components

---

## BUTTONS

### Button Variants & Colors

```
┌─ SOLID (Default) ─────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Primary     │  │ Secondary   │  │ Success     │         │
│  │  (Blue)     │  │  (Gray)     │  │  (Green)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ Warning     │  │ Danger      │                          │
│  │  (Amber)    │  │  (Red)      │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ OUTLINE ─────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Primary     │  │ Secondary   │  │ Success     │         │
│  │  (Bordered) │  │  (Bordered) │  │  (Bordered) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ GHOST ───────────────────────────────────────────────────┐
│                                                             │
│  Primary        Secondary       Success                    │
│  (Text Only)    (Text Only)     (Text Only)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ GRADIENT ────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────┐                               │
│  │ ░░░░░░░░░░░░░░░░░░░░░░ │  Premium Feature              │
│  │ ░░░ GRADIENT FILL ░░░░░ │  (Blue to darker blue)       │
│  │ ░░░░░░░░░░░░░░░░░░░░░░ │                               │
│  └─────────────────────────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Button Sizes

```
Small (32px)     ┌──────┐
                 │ Sm   │
                 └──────┘

Medium (40px)    ┌─────────┐
                 │ Medium  │
                 └─────────┘

Large (48px)     ┌──────────────┐
                 │ Large Button │
                 └──────────────┘
```

### Button States

```
Default:   Full opacity, visible shadows
Hover:     Slight color change, shadow increase (200ms)
Active:    Pressed effect, darker
Disabled:  50% opacity, no cursor, no hover
Focus:     Blue outline ring (accessibility)
Loading:   Spinner animation + text
```

---

## CARDS

### Card Variations

```
┌─ BASIC CARD ──────────────────────┐
│                                    │
│  Card Title                        │
│  Card content goes here. Clean,    │
│  simple container with subtle      │
│  shadows and spacing.              │
│                                    │
└─ (shadow-sm, padding-md) ─────────┘

┌─ HOVERABLE CARD ──────────────────┐
│ ╱─ Hovers scale up 5% + shadow ──  │
│ │ More prominent card               │
│ │ Great for interactive content     │
│ │ Smooth transition (200ms)         │
│ ╲─────────────────────────────────  │
└─ (shadow-md, hoverable) ──────────┘

┌─────────────────────────────────────┐
│                                     │  
│  Featured Card                      │
│  Large padding, prominent shadow    │
│  Ideal for important content        │
│                                     │
└─ (shadow-lg, padding-lg) ──────────┘
```

### Padding Options

```
xs (12px):  ┌────────────┐     compact
            │ Content    │
            └────────────┘

sm (16px):  ┌──────────────┐   standard
            │  Content     │
            └──────────────┘

md (24px):  ┌────────────────┐  default
            │   Content      │
            └────────────────┘

lg (32px):  ┌──────────────────┐ spacious
            │    Content       │
            └──────────────────┘
```

---

## INPUTS

### Input Variants

```
OUTLINED (Default)
Label Text
┌─────────────────────────────┐
│ Type your text here...      │  ← 2px blue border when focused
└─────────────────────────────┘
Helper text or error message

FILLED
Label Text
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
│ Type your text here...      │  ← Gray bg with bottom border
═════════════════════════════════

FLUSHED
Label Text
Type your text here...          │
───────────────────────────────  ← Minimal, only bottom border
Helper text
```

### With Icons

```
┌─ ICON LEFT ─────────────────────┐
│ 🔍 Search for anything...       │
└─────────────────────────────────┘

┌─ ICON RIGHT ────────────────────┐
│ your@email.com               ✓ │
└─────────────────────────────────┘
  (Email validation icon)
```

### Error States

```
VALID INPUT
┌──────────────────────────────┐
│ your@example.com             │
└──────────────────────────────┘
✓ Email format is correct

ERROR INPUT
┌──────────────────────────────┐
│ invalid.email                │  ← Red border
└──────────────────────────────┘
✗ Please enter a valid email address
```

---

## STAT CARDS

### Basic Stat Card

```
┌─────────────────────────────┐
│ Total Students           📊  │  ← Icon in top right
│                              │
│ 2,543                        │  ← Large, bold number
│                              │
│ Active in system     ↑ 12%   │  ← Trend indicator
└─────────────────────────────┘
```

### Stat Card with Trend

```
Up Trend:        ↑ 12%  (Green)
Down Trend:      ↓ 3.2%  (Red)
Neutral:         No trend indicator
```

### Stat Grid Layout

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Students   │  │   Courses   │  │ Attendance  │
│   2,543     │  │      84     │  │    94.2%    │
│  ↑ 12%      │  │             │  │  ↓ 2.3%    │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## BADGES

### Badge Variants

```
Primary   ┌──────────┐   Info colored background
          │ Primary  │   with matching text
          └──────────┘

Success   ┌──────────┐   Green for approved,
          │ Verified │   active, positive
          └──────────┘

Warning   ┌──────────┐   Amber for cautions,
          │ Pending  │   warnings
          └──────────┘

Danger    ┌──────────┐   Red for rejected,
          │ Rejected │   errors, deletions
          └──────────┘

Outline   ┌──────────┐   Bordered style,
          │  Custom  │   transparent background
          └──────────┘
```

### Badge Sizes

```
Small:    ┌────┐  12px font
          │ sm │
          └────┘

Medium:   ┌───────┐  14px font (default)
          │ badge │
          └───────┘

Large:    ┌────────────┐  16px font
          │ Large Tag  │
          └────────────┘
```

---

## ALERTS

### Alert Variants

```
SUCCESS
┌─────────────────────────────────┐
│ ✓ Your changes have been saved  │
└─────────────────────────────────┘
Green background, green text

WARNING
┌─────────────────────────────────┐
│ ⚠ This action cannot be undone  │
└─────────────────────────────────┘
Amber background, amber text

ERROR
┌─────────────────────────────────┐
│ ✗ Error Occurred                │
│                                 │
│ Something went wrong. Please     │
│ try again.                  [×] │
└─────────────────────────────────┘
Red background with close button

INFO
┌─────────────────────────────────┐
│ ℹ Important Information          │
│                                 │
│ Here's something you should      │
│ know about your account.         │
└─────────────────────────────────┘
Blue background, blue text
```

---

## NAVIGATION

### Navbar

```
┌─────────────────────────────────────────────────────────┐
│ S SmartEdu      Dashboard    Profile      John    [×]  │
│ ^ Logo          Links        Links        Logout Button │
└─────────────────────────────────────────────────────────┘
Height: 64px
Sticky: Yes
Mobile: Hamburger menu appears

Mobile View:
┌──────────────────────┐
│ S SmartEdu      [☰]  │  ← Hamburger menu button
└──────────────────────┘
│ Dashboard            │
│ Profile              │
│ ─────────────────────│
│ John Doe             │
│ Logout               │
└──────────────────────┘
```

### Sidebar

```
Desktop View:              Mobile View (Collapsed):
┌──────────────┐           ┌──────────────┐
│   MENU       │           │    MENU  [×] │
│              │           │────────────────
│ 🏠 Dashboard │────────   │ 🏠 Dashboard │
│ 👥 Users     │           │ 👥 Users     │
│ 📅 Courses   │  Collapses│ 📅 Courses   │
│              │────────   │              │
│ ─────────────│           │ ─────────────│
│ ⚙️  Settings │           │ ⚙️  Settings │
│ 🚪 Logout    │           │ 🚪 Logout    │
└──────────────┘           └──────────────┘
                           [Dark overlay]
```

---

## RESPONSIVE LAYOUTS

### Single Column (Mobile)

```
┌─────────────────────┐
│      NAVBAR         │ 64px height
├─────────────────────┤
│                     │
│   Single Column     │ Full width content
│   Content Here      │ Stacked vertically
│                     │
├─────────────────────┤
│      FOOTER         │
└─────────────────────┘
```

### Two Columns (Tablet/Desktop)

```
┌──────────────────────────────────────┐
│           NAVBAR                     │ 64px
├──────────┬───────────────────────────┤
│ SIDEBAR  │                           │
│          │     Main Content          │
│          │                           │
│          │                           │
├──────────┴───────────────────────────┤
│           FOOTER                     │
└──────────────────────────────────────┘
Sidebar: 280px (collapsed)
Main: Flex-1
```

---

## COLOR SWATCHES

```
PRIMARY BLUE
░░░░░░░░░░░░░░░░░░  #3B82F6  Main actions, links, brand
Hex: #3B82F6 | RGB: 59, 130, 246 | HSL: 217°, 97%, 60%

SEMANTIC COLORS
░░░░░░░░░░░░░░░░░░  #10B981  Success (Green)
░░░░░░░░░░░░░░░░░░  #F59E0B  Warning (Amber)
░░░░░░░░░░░░░░░░░░  #EF4444  Error (Red)
░░░░░░░░░░░░░░░░░░  #06B6D4  Info (Cyan)

GRAYS
░░░░░░░░░░░░░░░░░░  #F9FAFB  Gray-50 (Lightest)
░░░░░░░░░░░░░░░░░░  #F3F4F6  Gray-100
░░░░░░░░░░░░░░░░░░  #E5E7EB  Gray-200 (Borders)
░░░░░░░░░░░░░░░░░░  #9CA3AF  Gray-400
░░░░░░░░░░░░░░░░░░  #4B5563  Gray-600 (Body text)
░░░░░░░░░░░░░░░░░░  #111827  Gray-900 (Darkest)
```

---

## INTERACTIVE STATES

### Button States

```
NORMAL       ┌──────────┐
             │ Click Me │  Full opacity
             └──────────┘

HOVER        ┌──────────┐
         🔲  │ Click Me │  Slightly darker,
             └──────────┘  shadow increase

ACTIVE       ┌──────────┐
             │ Click Me │  Pressed effect,
             └──────────┘  scale down slightly

DISABLED     ┌──────────┐
             │ Click Me │  50% opacity,
             └──────────┘  no hover effect

FOCUS        ┌──────────┐
            ║│ Click Me │║  Blue outline ring
            ║└──────────┘║  (keyboard nav)

LOADING      ┌──────────────┐
             │ ⌛ Processing │  Spinner + text
             └──────────────┘
```

---

## SPACING VISUALIZATION

```
Visual spacing grid (4px base):

Base unit: 4px (xs)

4px   ████
8px   ████████
12px  ████████████
16px  ████████████████
20px  ████████████████████
24px  ████████████████████████
32px  ████████████████████████████████
48px  ████████████████████████████████████████████████
```

---

## TYPOGRAPHY

### Font Hierarchy

```
HEADING (Poppins, 32px, 700)
Large, Bold Statement
─────────────────────

Subheading (Poppins, 24px, 600)
Secondary Content Title
─────────────────────

Body Text (Inter, 16px, 400)
Regular paragraph content with normal line height (1.5)
for excellent readability.

Small Text (Inter, 14px, 400)
Secondary information, captions, helper text

Button Text (Inter, 14px, 600)
All buttons use this size with 600 weight
```

---

## HOVER STATES SUMMARY

```
CARDS:       Scale up 5% + shadow increase
BUTTONS:     Color darken 10-20% + shadow
LINKS:       Color change from blue to dark blue
INPUT:       Blue border on focus + subtle shadow
BADGE:       Slightly darker background
NAVBAR:      Link color change on hover
SIDEBAR:     Item background change on hover
```

---

## ACCESSIBILITY INDICATORS

```
COLOR CONTRAST EXAMPLES:
Text on White     #111827 on #FFFFFF   ✓ 21:1 (AAA)
Button on BG      #3B82F6 on #FFFFFF   ✓ 4.6:1 (AA)
Gray on White     #9CA3AF on #FFFFFF   ✗ 4.3:1 (borderline)

FOCUS INDICATORS:
┌─ Focused button ─┐
║┌────────────────┐║  ← 2px blue outline
║│ Click Button   │║     2px offset
║└────────────────┘║
└──────────────────┘

MINIMUM TOUCH TARGET:
┌─────────────────┐
│   44x44 px      │ Minimum for touch devices
│   Button Area   │
└─────────────────┘
```

---

**This visual guide provides reference for all component states and layouts.**

Last Updated: January 2026
