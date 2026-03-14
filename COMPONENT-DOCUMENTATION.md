# SmartEDU ERP - Component Documentation & Usage Guide

This guide covers all the modern UI components created for the redesigned SmartEDU ERP system.

## Table of Contents
1. [Button Component](#button-component)
2. [Card Component](#card-component)
3. [Input Component](#input-component)
4. [StatCard Component](#statcard-component)
5. [Badge Component](#badge-component)
6. [Alert Component](#alert-component)
7. [Layout Components](#layout-components)
8. [Implementation Best Practices](#best-practices)

---

## Button Component

### Location
`/client/src/components/ui/Button.jsx`

### Variants
- **solid** - Filled button (default)
- **outline** - Bordered button
- **ghost** - Text-only button
- **gradient** - Gradient background

### Colors
- primary (blue)
- secondary (gray)
- success (green)
- danger (red)
- warning (amber)

### Sizes
- sm: 32px height
- md: 40px height (default)
- lg: 48px height

### Props
```jsx
<Button
  variant="solid"           // Button style
  size="md"                 // Button size
  color="primary"           // Color theme
  disabled={false}          // Disabled state
  isLoading={false}         // Loading state with spinner
  icon={IconComponent}      // Left icon
  fullWidth={false}         // Full width button
  className=""              // Additional classes
>
  Button Text
</Button>
```

### Examples
```jsx
// Basic primary button
<Button>Click Me</Button>

// Outline button with icon
<Button variant="outline" icon={Download}>
  Download
</Button>

// Large gradient button
<Button size="lg" variant="gradient">
  Premium Feature
</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Full width danger button
<Button color="danger" fullWidth>
  Delete Account
</Button>

// Ghost secondary button
<Button variant="ghost" color="secondary">
  Cancel
</Button>
```

---

## Card Component

### Location
`/client/src/components/ui/Card.jsx`

### Props
```jsx
<Card
  hoverable={false}     // Add hover effects
  borderless={false}    // Remove border
  shadow="sm"          // sm, md, lg, none
  padding="md"         // xs, sm, md, lg, none
  className=""         // Additional classes
>
  Card Content
</Card>
```

### Shadow Options
- **none** - No shadow
- **sm** - 0 1px 2px rgba(0,0,0,0.05)
- **md** - 0 4px 6px rgba(0,0,0,0.1)
- **lg** - 0 10px 15px rgba(0,0,0,0.1)

### Padding Options
- **xs** - 12px
- **sm** - 16px
- **md** - 24px (default)
- **lg** - 32px
- **none** - 0px

### Examples
```jsx
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content here</p>
</Card>

// Hoverable card
<Card hoverable shadow="md">
  <p>Click to interact</p>
</Card>

// Borderless card with custom styling
<Card borderless padding="lg" shadow="lg">
  Featured content
</Card>

// Grid of cards
<div className="grid md:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} hoverable>
      {item.content}
    </Card>
  ))}
</div>
```

---

## Input Component

### Location
`/client/src/components/ui/Input.jsx`

### Variants
- **outlined** - Border around input (default)
- **filled** - Gray background with bottom border
- **flushed** - Only bottom border

### Props
```jsx
<Input
  label="Input Label"        // Display label
  placeholder="Enter..."     // Placeholder text
  type="text"               // Input type
  value={value}             // Controlled input
  onChange={handleChange}   // Change handler
  error="Error message"     // Error state
  helperText="Help text"    // Helper text
  icon={IconComponent}      // Icon display
  iconPosition="left"       // Icon position
  disabled={false}          // Disabled state
  size="md"                 // sm, md, lg
  variant="outlined"        // Input style
  required={false}          // Mark as required
/>
```

### Examples
```jsx
// Basic input
<Input placeholder="Enter your name" />

// Input with label and helper text
<Input
  label="Email Address"
  placeholder="you@example.com"
  type="email"
  helperText="We'll never share your email"
/>

// Input with error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  variant="filled"
/>

// Input with icon
<Input
  label="Search Users"
  icon={Search}
  placeholder="Search..."
  iconPosition="left"
/>

// Disabled input
<Input placeholder="Read-only" disabled value="Cannot edit" />

// Filled variant
<Input
  label="Username"
  variant="filled"
  placeholder="Enter username"
/>
```

---

## StatCard Component

### Location
`/client/src/components/ui/StatCard.jsx`

### Props
```jsx
<StatCard
  title="Metric Title"           // Card title
  value="1,234"                  // Main value
  icon={IconComponent}           // Icon
  trend="12%"                    // Trend percentage
  trendDirection="up"            // up or down
  description="Active users"     // Subtitle
  onClick={handleClick}          // Click handler
  className=""                   // Additional classes
/>
```

### Examples
```jsx
// Basic stat card
<StatCard
  title="Total Students"
  value="2,543"
/>

// With icon and description
<StatCard
  title="Active Instructors"
  value="48"
  icon={Users}
  description="Currently active"
/>

// With trend indicator
<StatCard
  title="Attendance Rate"
  value="94.2%"
  trend="2.3%"
  trendDirection="up"
  icon={TrendingUp}
/>

// Clickable stat card
<StatCard
  title="Revenue"
  value="$45,230"
  icon={DollarSign}
  trend="8.5%"
  onClick={() => navigate('/reports')}
/>

// Grid layout for dashboard
<div className="grid md:grid-cols-3 gap-6">
  <StatCard title="Students" value="5,234" icon={Users} />
  <StatCard title="Courses" value="84" icon={BookOpen} />
  <StatCard title="Attendance" value="94.2%" trend="3.2%" icon={Calendar} />
</div>
```

---

## Badge Component

### Location
`/client/src/components/ui/Badge.jsx`

### Variants
- primary (blue)
- secondary (gray)
- success (green)
- danger (red)
- warning (amber)
- info (cyan)
- outline (bordered)

### Sizes
- sm - 12px font
- md - 14px font (default)
- lg - 16px font

### Props
```jsx
<Badge
  variant="primary"   // Color variant
  size="md"          // sm, md, lg
  icon={IconComponent} // Optional icon
  className=""       // Additional classes
>
  Badge Text
</Badge>
```

### Examples
```jsx
// Basic badge
<Badge>Active</Badge>

// Success badge
<Badge variant="success">Approved</Badge>

// Small danger badge
<Badge variant="danger" size="sm">Rejected</Badge>

// Badge with icon
<Badge variant="primary" icon={CheckCircle}>
  Verified
</Badge>

// Outline badge
<Badge variant="outline">Pending</Badge>

// Status display
<div className="space-y-2">
  <Badge variant="success">Online</Badge>
  <Badge variant="warning">Away</Badge>
  <Badge variant="danger">Offline</Badge>
</div>
```

---

## Alert Component

### Location
`/client/src/components/ui/Alert.jsx`

### Variants
- success (green)
- error (red)
- warning (amber)
- info (blue)

### Props
```jsx
<Alert
  variant="success"        // Alert type
  title="Success Title"    // Optional title
  icon={IconComponent}     // Optional icon
  onClose={() => {}}       // Close handler
  className=""            // Additional classes
>
  Alert message content
</Alert>
```

### Examples
```jsx
// Success alert
<Alert variant="success" icon={CheckCircle}>
  Your changes have been saved successfully.
</Alert>

// Error alert with title
<Alert variant="error" title="Error Occurred" onClose={() => {}}>
  Something went wrong. Please try again.
</Alert>

// Warning alert
<Alert variant="warning" icon={AlertTriangle}>
  This action cannot be undone.
</Alert>

// Dismissible alert
const [showAlert, setShowAlert] = useState(true);

{showAlert && (
  <Alert
    variant="info"
    onClose={() => setShowAlert(false)}
  >
    Important information for your attention
  </Alert>
)}
```

---

## Layout Components

### Navbar Component

**Location**: `/client/src/components/layout/Navbar.jsx`

Features:
- Sticky positioning
- Logo with gradient
- Mobile hamburger menu
- Role-based dashboard links
- User name display
- Logout button

```jsx
import Navbar from '../components/layout/Navbar';

// In your page/layout
<Navbar />
```

### Sidebar Component

**Location**: `/client/src/components/layout/Sidebar.jsx`

Features:
- Collapsible on mobile
- Active link highlighting
- Role-based navigation items
- Settings and logout options
- Responsive overlay on mobile

```jsx
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar
      user={user}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
    />
  );
}
```

### DashboardLayout Component

**Location**: `/client/src/components/layout/DashboardLayout.jsx`

Combines Navbar, Sidebar, and main content area.

```jsx
import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

function Dashboard() {
  return (
    <>
      <Navbar />
      <DashboardLayout
        sidebar={<Sidebar user={user} onLogout={handleLogout} />}
      >
        <h1>Dashboard Content</h1>
      </DashboardLayout>
    </>
  );
}
```

---

## Best Practices

### 1. **Consistency**
- Use the same button variants across similar actions
- Keep spacing consistent (use Tailwind classes: px-4, py-2, etc.)
- Use semantic colors (green for success, red for error)

### 2. **Accessibility**
- Always provide labels for form inputs
- Use semantic HTML (button, input, form)
- Ensure sufficient color contrast
- Add focus indicators (included by default)
- Use descriptive button text

### 3. **Responsive Design**
- Mobile-first approach
- Use Tailwind breakpoints: `md:`, `lg:`, `xl:`
- Test on multiple screen sizes
- Hide/show navigation responsively

### 4. **Performance**
- Use React.memo for frequently rendered components
- Lazy load images and content
- Minimize re-renders with proper prop memoization
- Use CSS transitions instead of JavaScript animations

### 5. **Component Props**
- Use prop defaults for consistency
- Provide sensible defaults (size="md", variant="solid")
- Document all available props
- Use TypeScript for better type safety

### 6. **Color Usage**
```jsx
// ✅ DO: Use semantic colors
<Button color="success">Approve</Button>
<Button color="danger">Delete</Button>

// ❌ DON'T: Use random colors
<Button color="purple">Random</Button>
```

### 7. **Spacing**
```jsx
// ✅ DO: Use Tailwind spacing utilities
<div className="p-6 mb-8 gap-4">

// ❌ DON'T: Use random pixel values
<div style={{padding: '23px', marginBottom: '31px'}}>
```

### 8. **Icons**
- Use `lucide-react` for all icons
- Size icons appropriately: `size={16}` to `size={24}`
- Always provide fallback text for icon-only buttons

### 9. **Forms**
```jsx
// ✅ DO: Wrap inputs with labels
<label>
  Email Address
  <Input type="email" required />
</label>

// ❌ DON'T: Unlabeled inputs
<Input type="email" placeholder="email" />
```

### 10. **Error Handling**
```jsx
// ✅ DO: Show clear error messages
<Input 
  error="Email must be valid (example@domain.com)"
  helperText="We'll send a verification link"
/>

// ❌ DON'T: Generic errors
<Input error="Invalid" />
```

---

## Dark Mode Support (Future)

The design system is prepared for dark mode. Add these classes:

```jsx
// Add to html or body element
<html className="dark">

// Components automatically respond with:
.dark .card { @apply bg-gray-800; }
```

---

## Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #3B82F6 | Main actions, links |
| Success | #10B981 | Positive actions, confirmations |
| Warning | #F59E0B | Warnings, cautions |
| Error | #EF4444 | Errors, destructive actions |
| Info | #06B6D4 | Information, notifications |

---

## Font Stack

**Primary**: Inter (system fonts) - Body text, UI
**Display**: Poppins (Google Fonts) - Headings, hero text

Import in your HTML or CSS:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
```

---

## Quick Integration Checklist

- [ ] Import components in your pages
- [ ] Update Navbar in App.jsx
- [ ] Apply new Button variants
- [ ] Replace old Card components
- [ ] Update form inputs with new Input component
- [ ] Add StatCards to dashboards
- [ ] Test responsive design on mobile
- [ ] Run accessibility audit
- [ ] Test with real data
- [ ] Get design review

