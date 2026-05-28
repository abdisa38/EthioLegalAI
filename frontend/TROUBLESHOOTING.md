# Troubleshooting Guide

## ❌ Error: "useAuth must be used within AuthProvider"

### Cause
This error occurs when:
1. Browser is caching old code
2. Vite dev server has stale modules
3. Old context files are still being referenced

### Solution

**Step 1: Clear Vite Cache**
```bash
# On Windows
clear-cache.bat

# Or manually delete these folders:
# - node_modules/.vite
# - dist
```

**Step 2: Hard Refresh Browser**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)
- Or open DevTools and right-click refresh button → "Empty Cache and Hard Reload"

**Step 3: Restart Dev Server**
```bash
# Stop the current server (Ctrl + C)
npm run dev
```

**Step 4: Verify Imports**
Make sure all files import from the new locations:
```typescript
// ✅ Correct
import { useAuth } from '@/shared/hooks';

// ❌ Wrong (old location)
import { useAuth } from '../context/AuthContext';
```

---

## ❌ Error: Module not found

### Cause
TypeScript path aliases not resolving correctly.

### Solution

**Check tsconfig.json has:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Check vite.config.ts has:**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

## ❌ Error: Cannot find module 'zod'

### Cause
Dependencies not installed.

### Solution
```bash
npm install
```

---

## ❌ Build Errors

### Solution

**Step 1: Clean install**
```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

**Step 2: Clear cache and rebuild**
```bash
clear-cache.bat
npm run build
```

---

## ❌ React Query DevTools not showing

### Cause
DevTools only show in development mode.

### Solution
Make sure you're running:
```bash
npm run dev
```

Not:
```bash
npm run build
npm run preview
```

---

## ❌ API Calls Failing

### Check 1: Backend is running
```bash
# In backend folder
npm run dev
```

### Check 2: API URL is correct
Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:5001/api
```

### Check 3: CORS is enabled
Backend should have CORS configured for `http://localhost:5173`

### Check 4: Token is valid
Open DevTools → Application → Local Storage → Check `ethiolegal_token`

---

## ❌ TypeScript Errors

### Solution

**Restart TypeScript Server:**
1. Open VS Code Command Palette (`Ctrl + Shift + P`)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

---

## ❌ Styles Not Loading

### Solution

**Check Tailwind is working:**
```bash
# Make sure these are in package.json
"@tailwindcss/vite": "4.1.12",
"tailwindcss": "4.1.12"
```

**Restart dev server:**
```bash
npm run dev
```

---

## 🔧 Complete Reset (Nuclear Option)

If nothing else works:

```bash
# 1. Stop dev server (Ctrl + C)

# 2. Delete everything
rmdir /s /q node_modules
rmdir /s /q dist
del package-lock.json

# 3. Reinstall
npm install

# 4. Clear browser cache
# Press Ctrl + Shift + Delete
# Select "Cached images and files"
# Click "Clear data"

# 5. Restart
npm run dev
```

---

## 🐛 Still Having Issues?

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### Check Terminal
Look for error messages in the terminal where `npm run dev` is running.

### Verify File Structure
Make sure these folders exist:
```
src/
├── app/
│   └── providers/
│       ├── AuthProvider.tsx
│       ├── ThemeProvider.tsx
│       ├── LanguageProvider.tsx
│       ├── QueryProvider.tsx
│       └── index.tsx
├── shared/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── lib/
    ├── api/
    ├── react-query/
    └── zod/
```

---

## 📝 Common Mistakes

### 1. Wrong Import Path
```typescript
// ❌ Wrong
import { useAuth } from '../../../shared/hooks';

// ✅ Correct
import { useAuth } from '@/shared/hooks';
```

### 2. Missing Provider
Make sure `main.tsx` wraps App with AppProviders:
```typescript
<AppProviders>
  <App />
</AppProviders>
```

### 3. Old Files Still Present
Delete these old folders if they exist:
- `src/app/context/` (old location)
- `src/app/api/` (old location)

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] Dev server starts without errors
- [ ] Browser shows no console errors
- [ ] Login/Register works
- [ ] Protected routes redirect to login when not authenticated
- [ ] Toast notifications appear
- [ ] React Query DevTools visible (bottom left icon)
- [ ] Theme switching works
- [ ] Language switching works

---

## 🆘 Need More Help?

1. Check the error message carefully
2. Look at the file path in the error
3. Verify that file exists and has correct imports
4. Check browser console for more details
5. Try the "Complete Reset" steps above
