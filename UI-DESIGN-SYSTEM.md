# SmartEDU ERP - Modern UI/UX Design System

## 1. COLOR PALETTE

### Primary Colors
- **Primary Brand**: `#3B82F6` (Blue-500) - Trust, Professional
- **Primary Dark**: `#1F2937` (Gray-900) - Text, Borders
- **Primary Light**: `#EFF6FF` (Blue-50) - Backgrounds

### Semantic Colors
- **Success**: `#10B981` (Emerald-500)
- **Warning**: `#F59E0B` (Amber-500)
- **Error**: `#EF4444` (Red-500)
- **Info**: `#06B6D4` (Cyan-500)

### Neutrals (Gray Scale)
- **Gray-50**: `#F9FAFB` - Light backgrounds
- **Gray-100**: `#F3F4F6` - Subtle backgrounds
- **Gray-200**: `#E5E7EB` - Borders, dividers
- **Gray-400**: `#9CA3AF` - Secondary text
- **Gray-600**: `#4B5563` - Primary text
- **Gray-900**: `#111827` - Dark text, headings

### Background Colors
- **Page Background**: `#FFFFFF` or `#F9FAFB`
- **Card Background**: `#FFFFFF`
- **Hover State**: `#F3F4F6`
- **Active State**: `#EFF6FF`

---

## 2. TYPOGRAPHY

### Font Pairing
**Primary Font**: `Inter` (System Stack: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
- Modern, clean, excellent readability
- Professional for enterprise apps
- Great for UI/forms/dashboards

**Secondary Font**: `Poppins` (Google Fonts)
- Used for headers/hero sections
- Friendly yet professional
- Great personality without being distracting

### Type Scale
```
h1: 32px (2rem) - 700 weight - Line-height: 1.2
h2: 28px (1.75rem) - 700 weight - Line-height: 1.25
h3: 24px (1.5rem) - 600 weight - Line-height: 1.33
h4: 20px (1.25rem) - 600 weight - Line-height: 1.4
Body: 16px (1rem) - 400 weight - Line-height: 1.5
Body-sm: 14px (0.875rem) - 400 weight - Line-height: 1.43
Caption: 12px (0.75rem) - 500 weight - Line-height: 1.33
Button: 14px (0.875rem) - 600 weight
```

### CSS Variables for Typography
```css
--font-sans: Inter, system-ui, sans-serif;
--font-display: "Poppins", system-ui, sans-serif;
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

---

## 3. SPACING SYSTEM

### Base Unit: 4px (Used consistently across all elements)

```
4px   - xs  (padding: 0.25rem)
8px   - sm  (padding: 0.5rem)
12px  - md  (padding: 0.75rem)
16px  - lg  (padding: 1rem)
24px  - xl  (padding: 1.5rem)
32px  - 2xl (padding: 2rem)
40px  - 3xl (padding: 2.5rem)
48px  - 4xl (padding: 3rem)
64px  - 5xl (padding: 4rem)
80px  - 6xl (padding: 5rem)
```

### Component Spacing Rules

**Buttons**
- Padding: 10px 16px (height: 40px)
- Icon + Text gap: 8px
- Border-radius: 6px

**Cards**
- Padding: 20px-24px
- Border-radius: 8px
- Box-shadow: 0 1px 2px rgba(0,0,0,0.05)
- Margin between cards: 16px

**Forms**
- Input padding: 10px 12px
- Input height: 40px
- Input border-radius: 6px
- Label to input gap: 8px
- Field spacing: 20px

**Navbar**
- Height: 64px
- Padding: 16px 24px
- Icon spacing: 16px

**Sidebar**
- Width: 280px (desktop)
- Padding: 16px
- Item padding: 12px
- Item border-radius: 6px

---

## 4. COMPONENT STRUCTURE

### Design Principles
1. **Mobile-First**: Build for mobile, enhance for desktop
2. **Clear Hierarchy**: Size, color, position guide user attention
3. **Consistency**: Reusable components with consistent patterns
4. **Accessibility**: WCAG 2.1 AA compliance, proper contrast ratios
5. **Whitespace**: Generous spacing reduces cognitive load

### Component Library Structure

```
/components/ui/
  ├── Button.jsx
  ├── Card.jsx
  ├── Input.jsx
  ├── Select.jsx
  ├── Modal.jsx
  ├── Tabs.jsx
  ├── Dropdown.jsx
  ├── Alert.jsx
  ├── Badge.jsx
  ├── Loader.jsx
  ├── Pagination.jsx
  └── Tooltip.jsx

/components/layout/
  ├── Navbar.jsx (redesigned)
  ├── Sidebar.jsx (redesigned)
  ├── DashboardLayout.jsx (redesigned)
  ├── Layout.jsx (redesigned)
  └── Footer.jsx (new)

/components/sections/
  ├── Hero.jsx (new)
  ├── Features.jsx (new)
  ├── Dashboard.jsx (new)
  ├── StatGrid.jsx (new)
  └── Tables.jsx (new)
```

---

## 5. VISUAL HIERARCHY RULES

### Using Color
- **Primary action**: Use brand blue (#3B82F6)
- **Secondary action**: Use gray borders with gray text
- **Tertiary action**: Use text-only buttons
- **Disabled state**: Use gray-300 with gray-400 text

### Using Size & Weight
- Headings: Bold (600-700)
- Body text: Regular (400)
- Labels: Medium (500)
- Large elements draw attention first

### Using Position
- Important elements: Top-left, top-right
- Secondary elements: Bottom or right
- Grouped elements: Proximity principle

---

## 6. RESPONSIVE DESIGN

### Breakpoints
```
mobile:   320px - 639px (default)
tablet:   640px - 1023px (md)
desktop:  1024px+ (lg)
wide:     1280px+ (xl)
```

### Mobile-First Strategy
1. Build base styles for mobile
2. Use `md:` for tablet
3. Use `lg:` for desktop
4. Use `xl:` for wide screens

### Navigation Strategy
- **Mobile**: Hamburger menu with sidebar
- **Tablet+**: Sidebar always visible or horizontal nav
- **Desktop**: Full sidebar + top navbar

---

## 7. INTERACTIVE STATES

All interactive elements should have:
- **Default**: Base state
- **Hover**: Slightly darker/lighter (10-20% opacity change)
- **Active**: Brand color for selection
- **Disabled**: Gray-300 background, gray-400 text, no cursor
- **Focus**: 2px blue outline (for accessibility)
- **Loading**: Spinner or skeleton screen

---

## 8. SHADOW & DEPTH

```
Elevation 0: No shadow (flat)
Elevation 1: 0 1px 2px rgba(0,0,0,0.05)
Elevation 2: 0 4px 6px rgba(0,0,0,0.1)
Elevation 3: 0 10px 15px rgba(0,0,0,0.1)
Elevation 4: 0 20px 25px rgba(0,0,0,0.1)
```

Use shadows sparingly - prefer borders for subtle separation.

---

## 9. MICRO-INTERACTIONS

- Button press: 2ms feedback
- Hover state: Smooth 200ms transition
- Loading: Animated spinner
- Toast notifications: Slide in/out 300ms
- Transitions: Use ease-in-out for 200-300ms
- Animations: Keep under 400ms to feel responsive

---

## 10. ACCESSIBILITY STANDARDS

✅ **Color Contrast**
- Text on background: 4.5:1 (normal text)
- UI components: 3:1 minimum

✅ **Focus Indicators**
- Always visible blue outline
- Minimum 2px width

✅ **Touch Targets**
- Minimum 44x44px for interactive elements
- 8px spacing between touch targets

✅ **Text**
- Never rely on color alone
- Use labels for form inputs
- Descriptive button text

---

## 11. IMPLEMENTATION CHECKLIST

- [ ] Update Tailwind config with custom colors/spacing
- [ ] Import fonts (Inter + Poppins)
- [ ] Create base button variants
- [ ] Redesign Navbar
- [ ] Redesign Sidebar
- [ ] Update Card components
- [ ] Create form component library
- [ ] Update home/hero page
- [ ] Test responsive on mobile/tablet/desktop
- [ ] Run accessibility audit
- [ ] Performance test (Lighthouse)

