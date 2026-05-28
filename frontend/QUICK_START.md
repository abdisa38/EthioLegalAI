# Frontend Quick Start Guide

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 📖 Common Patterns

### 1. Creating a New Feature

```
src/features/my-feature/
├── components/          # Feature components
├── hooks/              # Feature hooks
│   ├── useMyFeature.ts
│   └── index.ts
├── api/                # Feature API (optional)
└── types/              # Feature types (optional)
```

### 2. Adding a New API Endpoint

**Step 1:** Add endpoint to `src/lib/api/endpoints.ts`
```typescript
export const API_ENDPOINTS = {
  MY_FEATURE: {
    LIST: '/my-feature',
    GET: (id: string) => `/my-feature/${id}`,
  },
};
```

**Step 2:** Create API service in `src/shared/api/my-feature.api.ts`
```typescript
export const myFeatureApi = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MY_FEATURE.LIST);
    return response.data;
  },
};
```

**Step 3:** Create React Query hook in `src/features/my-feature/hooks/`
```typescript
export const useMyFeature = () => {
  return useQuery({
    queryKey: ['my-feature'],
    queryFn: () => myFeatureApi.getAll(),
  });
};
```

### 3. Adding Form Validation

**Step 1:** Create schema in `src/lib/zod/schemas/`
```typescript
export const myFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export type MyFormData = z.infer<typeof myFormSchema>;
```

**Step 2:** Use in component
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { myFormSchema } from '@/lib/zod/schemas';

function MyForm() {
  const form = useForm({
    resolver: zodResolver(myFormSchema),
  });

  const onSubmit = (data: MyFormData) => {
    // Handle form submission
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### 4. Using Toast Notifications

```typescript
import { useToast } from '@/shared/hooks';

function MyComponent() {
  const { success, error, info, warning } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      success('Action completed successfully!');
    } catch (err) {
      error('Action failed. Please try again.');
    }
  };
}
```

### 5. Handling Loading States

```typescript
import { LoadingSpinner, LoadingOverlay, PageLoader } from '@/shared/components';

// Inline spinner
<LoadingSpinner size={24} text="Loading..." />

// Overlay (absolute or fullscreen)
<LoadingOverlay text="Processing..." fullScreen />

// Full page loader
<PageLoader text="Loading application..." />
```

### 6. Showing Empty/Error States

```typescript
import { EmptyState, ErrorState } from '@/shared/components';
import { MessageSquare } from 'lucide-react';

// Empty state
<EmptyState
  icon={MessageSquare}
  title="No chats yet"
  description="Start a conversation to see your chats here"
  action={{
    label: 'Start Chat',
    onClick: () => navigate('/chat'),
  }}
/>

// Error state
<ErrorState
  title="Failed to load"
  message="Unable to fetch data. Please try again."
  onRetry={() => refetch()}
/>
```

### 7. Using Authentication

```typescript
import { useAuth } from '@/shared/hooks';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### 8. Using Theme

```typescript
import { useTheme } from '@/shared/hooks';

function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current: {actualTheme}
    </button>
  );
}
```

### 9. Using Language

```typescript
import { useLanguage } from '@/shared/hooks';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <p>{t('common.welcome')}</p>
      <button onClick={() => setLanguage('am')}>አማርኛ</button>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('or')}>Afaan Oromo</button>
    </div>
  );
}
```

### 10. Formatting Utilities

```typescript
import { formatRelativeTime, formatFileSize, formatSmartDate } from '@/shared/utils';

// Relative time
formatRelativeTime('2024-01-01') // "2 hours ago"

// File size
formatFileSize(1024000) // "1 MB"

// Smart date
formatSmartDate(new Date()) // "Today at 3:45 PM"
```

---

## 🎯 Import Aliases

Use `@/` for absolute imports:

```typescript
// ✅ Good
import { useAuth } from '@/shared/hooks';
import { chatApi } from '@/shared/api';
import { Button } from '@/app/components/ui/button';

// ❌ Avoid
import { useAuth } from '../../../shared/hooks';
```

---

## 🔧 Environment Variables

Create `.env` file in frontend root:

```env
VITE_API_URL=http://localhost:5001/api
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 🧪 React Query DevTools

Available in development mode:
- Press `Ctrl + Shift + D` to toggle
- View all queries and mutations
- Inspect cache state
- Manually trigger refetch

---

## 📦 Key Dependencies

- **React Query** - Data fetching and caching
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Motion** - Animations

---

## 🐛 Debugging Tips

### 1. API Errors
Check browser console for enhanced error messages from interceptor.

### 2. Query Issues
Open React Query DevTools to inspect query state.

### 3. Form Validation
Zod errors are automatically shown in form fields.

### 4. Authentication Issues
Check localStorage for `ethiolegal_token`.

---

## 📚 File Locations

| What | Where |
|------|-------|
| API Services | `src/shared/api/` |
| Hooks | `src/shared/hooks/` |
| Components | `src/shared/components/` |
| Schemas | `src/lib/zod/schemas/` |
| Providers | `src/app/providers/` |
| Utils | `src/shared/utils/` |
| Features | `src/features/` |

---

## ✅ Checklist for New Features

- [ ] Create feature folder in `src/features/`
- [ ] Add API service in `src/shared/api/`
- [ ] Create Zod schemas if needed
- [ ] Create React Query hooks
- [ ] Add components
- [ ] Add to routes if needed
- [ ] Test with React Query DevTools
- [ ] Add loading/error states
- [ ] Add toast notifications

---

## 🎉 You're Ready!

Start building amazing features with this solid foundation!
