# SmartEDU ERP - Quick Reference Guide & Visual Examples

## 🎨 Color Swatches

```
Primary Blue      #3B82F6  ███████  Main actions, brand color
Primary Dark      #1F2937  ███████  Headings, dark text
Primary Light     #EFF6FF  ███████  Light backgrounds

Success Green     #10B981  ███████  Approvals, active states
Warning Amber     #F59E0B  ███████  Cautions, warnings
Error Red         #EF4444  ███████  Errors, deletions
Info Cyan         #06B6D4  ███████  Notifications, info

Gray-50           #F9FAFB  ███████  Lightest background
Gray-100          #F3F4F6  ███████  Light background
Gray-200          #E5E7EB  ███████  Borders
Gray-400          #9CA3AF  ███████  Secondary text
Gray-600          #4B5563  ███████  Body text
Gray-900          #111827  ███████  Dark text, headings
```

---

## 📝 Font Stack

**Primary (Body)**: Inter
```
font-normal: 400 weight
font-medium: 500 weight
font-semibold: 600 weight
font-bold: 700 weight
```

**Display (Headings)**: Poppins
```
h1: 32px, 700 weight, line-height: 1.2
h2: 28px, 700 weight, line-height: 1.25
h3: 24px, 600 weight, line-height: 1.33
h4: 20px, 600 weight, line-height: 1.4
body: 16px, 400 weight, line-height: 1.5
body-sm: 14px, 400 weight, line-height: 1.43
caption: 12px, 500 weight, line-height: 1.33
button: 14px, 600 weight
```

---

## 🔲 Spacing Reference

| Value | Rem | Pixels | Usage |
|-------|-----|--------|-------|
| xs | 0.25 | 4px | Tiny gaps |
| sm | 0.5 | 8px | Button/form padding |
| md | 0.75 | 12px | Card gaps |
| lg | 1 | 16px | Section spacing |
| xl | 1.5 | 24px | Component spacing |
| 2xl | 2 | 32px | Major spacing |
| 3xl | 2.5 | 40px | Section gaps |
| 4xl | 3 | 48px | Large gaps |
| 5xl | 4 | 64px | Hero spacing |
| 6xl | 5 | 80px | Page margins |

### Tailwind Classes
```
p-4     = padding: 16px
m-4     = margin: 16px
gap-4   = gap: 16px
px-6    = padding left/right: 24px
py-3    = padding top/bottom: 12px
mb-8    = margin-bottom: 32px
mt-2    = margin-top: 8px
```

---

## 🔘 Button Component Examples

### Solid Variant (Primary Actions)
```
Default:  Blue bg, white text, hover darker
Disabled: Gray bg, gray text, no hover effect
Hover:    Slightly darker blue, smooth transition
```

### Outline Variant (Secondary Actions)
```
Default:  Blue border, blue text, transparent bg
Disabled: Gray border, gray text
Hover:    Light blue bg, maintained border
```

### Ghost Variant (Tertiary Actions)
```
Default:  No border, colored text only
Disabled: Gray text
Hover:    Colored light bg
```

### Button States
```
Default  → Solid blue background
Hover    → Darker shade (smooth 200ms)
Active   → Pressed effect (subtle)
Disabled → 50% opacity, no cursor
Focus    → Blue outline ring
Loading  → Spinner animation
```

---

## 📦 Card Component States

### Variations
```
Shadow: sm, md, lg, none
Padding: xs (12px), sm (16px), md (24px), lg (32px), none
Hover: Scale up 5%, shadow increase
Border: On/off (gray-200)
```

### Example Layout
```
┌─────────────────────────┐
│                         │  ← 24px padding (md)
│  Card Content Here      │
│                         │
└─────────────────────────┘
Shadow: 0 1px 2px rgba(0,0,0,0.05)
Border: 1px solid #E5E7EB
Border-radius: 8px
```

---

## 📋 Input Variants

### Outlined (Default)
```
┌──────────────────────────┐
│ Your text here...        │  ← Focused: Blue border
└──────────────────────────┘
Border: 2px solid #E5E7EB
Focus: 2px solid #3B82F6
```

### Filled
```
███████████████████████████  ← Gray background
│ Your text here...        │
┌──────────────────────────┘
Bg: #F3F4F6, Bottom border only
Focus: Blue bottom border
```

### Flushed
```
Your text here...           │
─────────────────────────── ← Border
Only bottom border visible
Focus: Blue bottom border
```

---

## 🏷️ Badge Variants

```
Primary:    Blue bg, blue text      (Information)
Secondary:  Gray bg, gray text      (Neutral)
Success:    Green bg, green text    (Approved)
Danger:     Red bg, red text        (Rejected)
Warning:    Amber bg, amber text    (Caution)
Info:       Cyan bg, cyan text      (Notice)
Outline:    Transparent, colored border & text
```

### Sizes
```
sm:  12px font, small padding     (Compact labels)
md:  14px font, medium padding    (Default)
lg:  16px font, large padding     (Prominent)
```

---

## ⚠️ Alert Variants

```
Success:  Green bg (#F0FDF4), green text
          Icon: CheckCircle
          Usage: Confirmations, saved actions

Error:    Red bg (#FEF2F2), red text
          Icon: AlertCircle
          Usage: Errors, failures

Warning:  Amber bg (#FFFBEB), amber text
          Icon: AlertTriangle
          Usage: Cautions, warnings

Info:     Blue bg (#F0F9FF), blue text
          Icon: Info
          Usage: Notifications, information
```

---

## 📱 Responsive Breakpoints

```
Mobile (320-639px):
  Single column layouts
  Full-width components
  Hamburger menu
  Smaller fonts (14px base)
  Tight spacing (p-3, gap-3)

Tablet (640-1023px):
  2-column grids
  Visible sidebar
  Balanced spacing
  Medium fonts (16px base)
  Relaxed spacing (p-4, gap-4)

Desktop (1024px+):
  3-column grids
  Full navigation
  Generous spacing (p-6, gap-6)
  Larger fonts (18px headings)
  Whitespace focus
```

### Tailwind Responsive Examples
```
Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      (1 column on mobile, 2 on tablet, 3 on desktop)

Display: hidden md:block
        (Hidden on mobile, visible on tablet+)

Padding: px-4 md:px-6 lg:px-8
        (4px to 8px to 12px as screen grows)

Flex: flex-col md:flex-row
     (Column on mobile, row on tablet+)
```

---

## 🎯 Focus & Keyboard Navigation

All interactive elements have:
```
Focus State:
  ✓ 2px blue outline
  ✓ 2px offset
  ✓ Visible on all elements
  ✓ Accessible with Tab key

Tab Order:
  ✓ Logical top-to-bottom flow
  ✓ No keyboard traps
  ✓ Visible focus indicator

Keyboard Support:
  ✓ Enter: Activates button/link
  ✓ Space: Activates button/checkbox
  ✓ Arrow keys: Navigate menus
  ✓ Escape: Close modals/dropdowns
```

---

## ⚡ Performance Metrics

Target metrics:
```
Largest Contentful Paint (LCP):  < 2.5s
First Input Delay (FID):         < 100ms
Cumulative Layout Shift (CLS):   < 0.1
Lighthouse Score:                > 90
```

Optimization tips:
```
✓ Lazy load images
✓ Minimize animations (< 400ms)
✓ Code split large pages
✓ Cache API responses
✓ Use CSS Grid over nested divs
✓ Memoize expensive components
✓ Defer non-critical JS
✓ Optimize font loading
```

---

## 🔒 Accessibility Checklist

```
✓ Color Contrast
  - Normal text: 4.5:1 ratio minimum
  - Large text: 3:1 ratio minimum
  - Icons: 3:1 ratio

✓ Interactive Elements
  - Minimum 44x44px (mobile)
  - 8px spacing between targets
  - Clear focus indicators
  - Descriptive labels

✓ Forms
  - Labels for all inputs
  - Error messages clear
  - Validation feedback
  - Required indicators

✓ Navigation
  - Logical tab order
  - Skip links for main content
  - Clear link text
  - No ambiguous buttons

✓ Images
  - Descriptive alt text
  - Decorative images ignored
  - Text in images has alternatives
```

---

## 🎨 Dark Mode Ready

The design system is prepared for dark mode:

```css
/* Add to theme switcher */
.dark {
  @apply bg-gray-900;
}

.dark button {
  @apply bg-gray-800 text-white;
}

.dark Card {
  @apply bg-gray-800 border-gray-700;
}
```

---

## 📚 Common Patterns

### Authentication Card
```jsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
  <Card shadow="lg" padding="lg" className="w-full max-w-md">
    <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
    {/* Form inputs */}
    <Button fullWidth>Submit</Button>
  </Card>
</div>
```

### Dashboard Grid
```jsx
<div className="grid md:grid-cols-3 gap-6">
  <StatCard title="Stat 1" value="123" icon={Icon1} />
  <StatCard title="Stat 2" value="456" icon={Icon2} />
  <StatCard title="Stat 3" value="789" icon={Icon3} />
</div>
```

### Two-Column Layout
```jsx
<div className="grid lg:grid-cols-3 gap-6">
  <Card className="lg:col-span-1">
    Sidebar content
  </Card>
  <Card className="lg:col-span-2">
    Main content
  </Card>
</div>
```

### Status List
```jsx
<div className="space-y-3">
  {items.map(item => (
    <Card key={item.id} className="flex justify-between items-center">
      <div>
        <h4 className="font-semibold">{item.name}</h4>
        <p className="text-sm text-gray-600">{item.subtitle}</p>
      </div>
      <Badge variant={item.status}>
        {item.status}
      </Badge>
    </Card>
  ))}
</div>
```

---

## 🚀 Quick Copy-Paste Components

### Hero Section
```jsx
<section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 -z-10" />
  <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10" />
  
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
      Your Headline
    </h1>
    <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
      Your subheadline
    </p>
    <Button size="lg">Call to Action</Button>
  </div>
</section>
```

### Feature Grid
```jsx
<div className="grid md:grid-cols-3 gap-8">
  {features.map(feature => (
    <Card key={feature.title} hoverable>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
        <feature.icon size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </Card>
  ))}
</div>
```

### Form Layout
```jsx
<Card padding="lg" className="max-w-2xl">
  <h2 className="text-2xl font-bold mb-6">Form Title</h2>
  <form className="space-y-6">
    <Input label="Field 1" placeholder="Enter..." required />
    <Input label="Field 2" placeholder="Enter..." required />
    <Button fullWidth size="lg">Submit</Button>
  </form>
</Card>
```

---

## 📞 Design System Support

**Questions about...?**

- **Colors**: See Color Swatches section or UI-DESIGN-SYSTEM.md
- **Typography**: See Font Stack section or UI-DESIGN-SYSTEM.md  
- **Components**: See COMPONENT-DOCUMENTATION.md
- **Implementation**: See IMPLEMENTATION-GUIDE.md
- **Examples**: Check Home.jsx and other pages

---

**Last Updated**: January 2026
**Version**: 1.0

